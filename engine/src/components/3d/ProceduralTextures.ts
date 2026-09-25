import * as THREE from 'three';

// 1. Procedural Sand-Cast Iron Bump Map
export function createCastIronBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Multi-frequency Perlin-like noise
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // High-frequency sand grain
      const n1 = (Math.random() - 0.5) * 60;
      const n2 = Math.sin(x * 0.15) * Math.cos(y * 0.15) * 20;
      const n3 = Math.sin(x * 0.05 + y * 0.05) * 35;
      const val = Math.max(0, Math.min(255, 128 + n1 + n2 + n3));

      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 2. Procedural Brushed Machined Metal Normal/Bump Map
export function createMachinedSteelBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Micro fine concentric/parallel machining grooves
  for (let i = 0; i < size; i += 2) {
    const brightness = 120 + Math.floor(Math.random() * 25);
    ctx.strokeStyle = `rgb(${brightness},${brightness},${brightness})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// 3. Procedural Industrial Paint Micro-Orange-Peel Bump Map
export function createPaintOrangePeelTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Soft gentle undulations simulating baked industrial enamel
      const wave = Math.sin(x * 0.2) * Math.cos(y * 0.2) * 12 +
                   Math.sin(x * 0.08 + y * 0.1) * 18 +
                   (Math.random() - 0.5) * 8;
      const val = Math.max(0, Math.min(255, 128 + wave));

      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// 4. Procedural Soft Radial Contact Shadow Texture
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 10,
    size / 2, size / 2, size / 2
  );

  gradient.addColorStop(0, 'rgba(0, 0, 20, 0.95)');
  gradient.addColorStop(0.25, 'rgba(0, 0, 30, 0.75)');
  gradient.addColorStop(0.55, 'rgba(0, 0, 45, 0.35)');
  gradient.addColorStop(0.8, 'rgba(0, 0, 60, 0.10)');
  gradient.addColorStop(1, 'rgba(0, 0, 80, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 5. Procedural Studio HDRI Environment Map Generator
export function createStudioEnvironmentMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const scene = new THREE.Scene();

  // Studio background dome with realistic warm key and cool fill softboxes
  const roomGeo = new THREE.SphereGeometry(100, 32, 32);
  const roomMat = new THREE.MeshBasicMaterial({
    color: 0x1a2436,
    side: THREE.BackSide
  });
  const room = new THREE.Mesh(roomGeo, roomMat);
  scene.add(room);

  // Top overhead rectangular softbox (high brightness white)
  const topLightGeo = new THREE.PlaneGeometry(50, 40);
  const topLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const topLight = new THREE.Mesh(topLightGeo, topLightMat);
  topLight.position.set(0, 45, 0);
  topLight.rotation.x = Math.PI / 2;
  scene.add(topLight);

  // Key rim softbox (warm gold/white highlight for metal curves)
  const keySoftboxGeo = new THREE.PlaneGeometry(35, 60);
  const keySoftboxMat = new THREE.MeshBasicMaterial({ color: 0xfff5e6, side: THREE.DoubleSide });
  const keySoftbox = new THREE.Mesh(keySoftboxGeo, keySoftboxMat);
  keySoftbox.position.set(-45, 25, 35);
  keySoftbox.lookAt(0, 0, 0);
  scene.add(keySoftbox);

  // Fill cool blue softbox (adds rich depth to shadows and polished surfaces)
  const fillSoftboxGeo = new THREE.PlaneGeometry(40, 50);
  const fillSoftboxMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, side: THREE.DoubleSide });
  const fillSoftbox = new THREE.Mesh(fillSoftboxGeo, fillSoftboxMat);
  fillSoftbox.position.set(45, 15, -30);
  fillSoftbox.lookAt(0, 0, 0);
  scene.add(fillSoftbox);

  // Ground bounce reflection plate
  const groundReflectGeo = new THREE.PlaneGeometry(80, 80);
  const groundReflectMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });
  const groundReflect = new THREE.Mesh(groundReflectGeo, groundReflectMat);
  groundReflect.position.set(0, -40, 0);
  groundReflect.rotation.x = -Math.PI / 2;
  scene.add(groundReflect);

  const envMap = pmremGenerator.fromScene(scene).texture;
  pmremGenerator.dispose();

  return envMap;
}
