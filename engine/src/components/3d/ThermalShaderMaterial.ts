import * as THREE from 'three';

// Radiometric Thermography Shader - High-Precision FLIR Rainbow Palette
// Deep Violet (<30°C) -> Navy Blue (30-50°C) -> Electric Cyan (50-75°C) -> 
// Vivid Green (75-95°C) -> Solar Yellow (95-130°C) -> Radiant Orange (130-350°C) -> 
// Fiery Red (350-600°C) -> Incandescent White Hot (>650°C)

const thermalVertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const thermalFragmentShader = `
  uniform float uBaseTemp;       // Baseline heat for this component (0.0 to 1.0)
  uniform float uHeatFactor;     // Global engine thermal load multiplier (0.0 to 1.0)
  uniform vec3 uLightDirection;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  // High quality 3D simplex noise for natural thermal diffusion
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // Exact 8-Stop Rainbow Thermographic Color Ramp (Pure FLIR Rainbow HC)
  vec3 getRainbowColor(float t) {
    t = clamp(t, 0.0, 1.0);

    vec3 c0 = vec3(0.08, 0.00, 0.22); // Deep Violet (<30°C)
    vec3 c1 = vec3(0.00, 0.20, 0.85); // Navy Blue (30-50°C)
    vec3 c2 = vec3(0.00, 0.85, 0.95); // Cyan (50-75°C)
    vec3 c3 = vec3(0.05, 0.95, 0.15); // Emerald Green (75-95°C)
    vec3 c4 = vec3(1.00, 0.95, 0.00); // Solar Yellow (95-130°C)
    vec3 c5 = vec3(1.00, 0.42, 0.00); // Radiant Orange (130-350°C)
    vec3 c6 = vec3(0.95, 0.05, 0.02); // Fiery Red (350-600°C)
    vec3 c7 = vec3(1.00, 1.00, 0.95); // Incandescent White Hot (>650°C)

    if (t < 0.14) {
      return mix(c0, c1, t / 0.14);
    } else if (t < 0.28) {
      return mix(c1, c2, (t - 0.14) / 0.14);
    } else if (t < 0.44) {
      return mix(c2, c3, (t - 0.28) / 0.16);
    } else if (t < 0.60) {
      return mix(c3, c4, (t - 0.44) / 0.16);
    } else if (t < 0.74) {
      return mix(c4, c5, (t - 0.60) / 0.14);
    } else if (t < 0.88) {
      return mix(c5, c6, (t - 0.74) / 0.14);
    } else {
      return mix(c6, c7, (t - 0.88) / 0.12);
    }
  }

  void main() {
    // Spatial temperature diffusion using simplex noise
    vec3 pos = vWorldPosition * 1.8;
    float n1 = snoise(pos) * 0.05;
    float n2 = snoise(pos * 2.4) * 0.025;
    float diffusion = n1 + n2;

    // Physical heat conduction bleed from turbo & exhaust center
    vec3 hotCenter = vec3(-0.85, 0.65, -0.1);
    float distToExhaust = length(vWorldPosition - hotCenter);
    float exhaustRadiation = exp(-distToExhaust * 1.8) * 0.26 * uHeatFactor;

    // Dynamic temperature curve responding proportionally to engine state & load:
    // When cold/resting (uHeatFactor ~ 0): deep violet & navy blue (0.05 - 0.20)
    // At idle (uHeatFactor ~ 0.25): warm cyan & green (0.30 - 0.50)
    // Under full dyno stress (uHeatFactor ~ 0.9 - 1.0): fiery red & incandescent white hot (0.80 - 0.98)
    float baseScaled = mix(uBaseTemp * 0.20, uBaseTemp * 1.15, uHeatFactor);
    float localHeat = baseScaled + diffusion + exhaustRadiation + (uHeatFactor * 0.12);
    localHeat = clamp(localHeat, 0.02, 0.98);

    // Pure Rainbow thermographic color
    vec3 heatColor = getRainbowColor(localHeat);

    // Surface normal and lighting for 3D depth and shape retention
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDirection);
    float diffuse = clamp(dot(normal, lightDir), 0.45, 1.0);
    float specular = pow(max(0.0, dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0))), 24.0) * 0.14;
    float ao = clamp(0.7 + 0.3 * normal.y, 0.6, 1.0);

    vec3 shadedColor = heatColor * (diffuse * 0.85 + 0.15) * ao + vec3(specular);

    gl_FragColor = vec4(shadedColor, 1.0);
  }
`;

export function createThermalShaderMaterial(baseTemp: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBaseTemp: { value: baseTemp },
      uHeatFactor: { value: 0.5 },
      uLightDirection: { value: new THREE.Vector3(0.5, 0.8, 0.6) }
    },
    vertexShader: thermalVertexShader,
    fragmentShader: thermalFragmentShader,
    side: THREE.DoubleSide
  });
}
