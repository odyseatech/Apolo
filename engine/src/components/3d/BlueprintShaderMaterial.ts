import * as THREE from 'three';

// Mechanical Blueprint & Structural CAD Drawing Shader
// Replicates high-precision engineering schematics, technical blueprint cyan contours,
// orthogonal drafting grid lines, and architectural white structural edge accents.

const blueprintVertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vModelPosition;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vModelPosition = position;
    
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    
    vec4 mvPosition = viewMatrix * worldPos;
    vViewDir = normalize(-mvPosition.xyz);
    vNormal = normalize(normalMatrix * normal);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const blueprintFragmentShader = `
  uniform vec3 uBaseColor;      // Deep Blueprint Prussian Blue #0A2240
  uniform vec3 uLineColor;      // Blueprint Technical Cyan #38BDF8
  uniform vec3 uHighlightColor; // Drafting Pure White #FFFFFF
  uniform float uGridScale;
  uniform float uOpacity;

  varying vec3 vWorldPosition;
  varying vec3 vModelPosition;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // 1. Base Blueprint Shading with directional technical illumination
    vec3 lightDir = normalize(vec3(0.4, 0.9, 0.5));
    float nDotL = max(0.0, dot(normal, lightDir));
    float diffuse = 0.55 + 0.45 * nDotL;

    // 2. Blueprint Engineering Drafting Grid (Orthographic Drafting Lines)
    vec3 gridPos = vModelPosition * uGridScale;
    vec3 grid = abs(fract(gridPos - 0.5) - 0.5) / fwidth(gridPos);
    float line = min(min(grid.x, grid.y), grid.z);
    float gridIntensity = 1.0 - min(line, 1.0);
    gridIntensity = smoothstep(0.0, 0.7, gridIntensity) * 0.32;

    // 3. Structural Silhouette & Edge Detection (Crisp White & Cyan Ink contours)
    float edgeFactor = 1.0 - max(0.0, dot(normal, viewDir));
    float edgeLine = pow(edgeFactor, 1.8);
    float rimHighlight = smoothstep(0.45, 0.92, edgeFactor);

    // 4. Subtle Drafting Cross-Hatch Shading
    float hatch1 = sin((vWorldPosition.x + vWorldPosition.y + vWorldPosition.z) * 55.0) * 0.5 + 0.5;
    float hatch2 = sin((vWorldPosition.x - vWorldPosition.y + vWorldPosition.z) * 55.0) * 0.5 + 0.5;
    float hatchFactor = (1.0 - nDotL) * (smoothstep(0.4, 0.85, hatch1) * 0.08 + smoothstep(0.4, 0.85, hatch2) * 0.08);

    // Compose Final Mechanical Blueprint
    vec3 base = uBaseColor * diffuse;
    
    // Add grid lines
    vec3 color = mix(base, uLineColor * 0.85, gridIntensity);
    
    // Add cross-hatch shading
    color += uLineColor * hatchFactor;
    
    // Add structural contour blueprint lines
    color = mix(color, uLineColor, edgeLine * 0.88);
    
    // Add sharp white drafting edge highlights
    color = mix(color, uHighlightColor, rimHighlight * 0.85);

    gl_FragColor = vec4(color, uOpacity);
  }
`;

export function createBlueprintShaderMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: blueprintVertexShader,
    fragmentShader: blueprintFragmentShader,
    uniforms: {
      uBaseColor: { value: new THREE.Color(0x0a2240) },      // Deep Blueprint Prussian Blue
      uLineColor: { value: new THREE.Color(0x38bdf8) },      // Crisp Blueprint Technical Cyan
      uHighlightColor: { value: new THREE.Color(0xffffff) }, // Drafting Pure White
      uGridScale: { value: 18.0 },
      uOpacity: { value: 0.96 }
    },
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide
  });
}
