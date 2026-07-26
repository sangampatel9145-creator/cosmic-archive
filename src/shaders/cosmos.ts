import { NOISE_CHUNK } from './noise';

const BILLBOARD_VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const nebulaVertexShader = BILLBOARD_VERTEX;

export const nebulaFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uSeed;
uniform float uOpacity;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpectrum;

varying vec2 vUv;

${NOISE_CHUNK}

void main() {
  vec2 centered = vUv - 0.5;
  float radial = length(centered);
  if (radial > 0.5) discard;

  vec3 samplePoint = vec3(centered * 3.4, uSeed + uTime * 0.012);
  float cloud = fbm(samplePoint, 5) * 0.5 + 0.5;
  float wisps = fbm(samplePoint * 2.7 + vec3(3.1), 4) * 0.5 + 0.5;

  float mask = smoothstep(0.5, 0.06, radial);
  float density = pow(cloud * wisps, 1.6) * mask;

  vec3 color = mix(uColorA, uColorB, wisps);
  color = mix(color, vec3(color.b, color.r, color.g), uSpectrum);

  gl_FragColor = vec4(color, density * uOpacity);
  #include <colorspace_fragment>
}
`;

export const galaxyVertexShader = BILLBOARD_VERTEX;

export const galaxyFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uSeed;
uniform float uOpacity;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uArms;

varying vec2 vUv;

${NOISE_CHUNK}

void main() {
  vec2 centered = (vUv - 0.5) * 2.0;
  float radius = length(centered);
  if (radius > 1.0) discard;

  float angle = atan(centered.y, centered.x);
  float spiral = sin(angle * uArms + radius * 9.0 - uTime * 0.05 + uSeed);
  float arms = smoothstep(0.1, 0.95, spiral * 0.5 + 0.5);

  float grain = fbm(vec3(centered * 5.0, uSeed), 3) * 0.5 + 0.5;
  float core = smoothstep(0.42, 0.0, radius);
  float disc = smoothstep(1.0, 0.15, radius);

  float density = (arms * disc * grain * 0.75 + core * 1.1);
  vec3 color = mix(uColorB, uColorA, core);

  gl_FragColor = vec4(color, density * uOpacity);
  #include <colorspace_fragment>
}
`;

export const warpVertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;

attribute float aOffset;
attribute float aSpeed;
attribute float aScale;

varying float vFade;

void main() {
  float travel = fract(aOffset + uTime * aSpeed * (0.4 + uProgress * 2.2));
  vec3 transformed = position;
  transformed.z = mix(28.0, -140.0, travel);

  float edgeFade = smoothstep(0.0, 0.12, travel) * smoothstep(1.0, 0.75, travel);
  vFade = edgeFade * uProgress;

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_PointSize = aScale * uPixelRatio * (2.0 + uProgress * 9.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const warpFragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vFade;

void main() {
  vec2 centered = gl_PointCoord - 0.5;
  float distance = length(centered);
  if (distance > 0.5) discard;

  float core = smoothstep(0.5, 0.0, distance);
  vec3 color = mix(uColorA, uColorB, core);

  gl_FragColor = vec4(color, core * vFade);
  #include <colorspace_fragment>
}
`;

export const blackHoleVertexShader = BILLBOARD_VERTEX;

export const blackHoleFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uOpacity;
uniform vec3 uDiskInner;
uniform vec3 uDiskOuter;

varying vec2 vUv;

${NOISE_CHUNK}

void main() {
  vec2 centered = (vUv - 0.5) * 2.0;
  float radius = length(centered);
  if (radius > 1.0) discard;

  float angle = atan(centered.y, centered.x);

  // Event horizon: fully opaque black core with a sharp photon ring.
  float horizon = smoothstep(0.30, 0.27, radius);
  float photonRing = smoothstep(0.34, 0.305, radius) - smoothstep(0.30, 0.28, radius);

  // Accretion disk, sheared by differential rotation.
  float shear = angle + 2.6 / max(radius, 0.18) - uTime * 0.35;
  float turbulence = fbm(vec3(cos(shear) * radius * 4.0, sin(shear) * radius * 4.0, uTime * 0.05), 4) * 0.5 + 0.5;
  float disk = smoothstep(0.32, 0.46, radius) * smoothstep(1.0, 0.5, radius);
  disk *= 0.35 + turbulence * 0.9;

  // Doppler beaming: the approaching side is brighter.
  float beaming = 0.55 + 0.45 * cos(angle);

  vec3 color = mix(uDiskOuter, uDiskInner, smoothstep(0.9, 0.35, radius));
  color *= disk * beaming * 2.1;
  color += uDiskInner * photonRing * 3.0;

  float alpha = clamp(disk * beaming + photonRing * 1.4 + horizon, 0.0, 1.0);
  color *= (1.0 - horizon);

  gl_FragColor = vec4(color, alpha * uOpacity);
  #include <colorspace_fragment>
}
`;

export const sunVertexShader = BILLBOARD_VERTEX;

export const sunFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uColorCore;
uniform vec3 uColorEdge;
uniform float uOpacity;

varying vec2 vUv;

${NOISE_CHUNK}

void main() {
  vec2 centered = (vUv - 0.5) * 2.0;
  float radius = length(centered);
  if (radius > 1.0) discard;

  float surface = fbm(vec3(centered * 3.0, uTime * 0.08), 4) * 0.5 + 0.5;
  float core = smoothstep(0.55, 0.0, radius);
  float corona = smoothstep(1.0, 0.35, radius) * (0.45 + surface * 0.55);

  vec3 color = mix(uColorEdge, uColorCore, core);
  float alpha = clamp(core * 1.15 + corona * 0.5, 0.0, 1.0);

  gl_FragColor = vec4(color * (0.9 + surface * 0.4), alpha * uOpacity);
  #include <colorspace_fragment>
}
`;

export const ringVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const ringFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uSeed;
uniform float uInnerRatio;

varying vec2 vUv;

${NOISE_CHUNK}

void main() {
  // RingGeometry uses planar UVs, so the radial coordinate is derived here.
  vec2 centered = (vUv - 0.5) * 2.0;
  float radius = length(centered);
  if (radius > 1.0 || radius < uInnerRatio) discard;

  float across = (radius - uInnerRatio) / max(1.0 - uInnerRatio, 0.001);
  float angle = atan(centered.y, centered.x);

  float bands = fbm(vec3(across * 18.0, uSeed, 0.0), 3) * 0.5 + 0.5;
  float edges = smoothstep(0.0, 0.16, across) * smoothstep(1.0, 0.84, across);
  float sparkle = 0.86 + 0.14 * sin(angle * 90.0 + uTime * 0.7);

  float alpha = bands * edges * uOpacity * sparkle;
  gl_FragColor = vec4(uColor * (0.7 + bands * 0.6), alpha);
  #include <colorspace_fragment>
}
`;
