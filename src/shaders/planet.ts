import { NOISE_CHUNK } from './noise';

export const planetVertexShader = /* glsl */ `
varying vec3 vObjectPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vObjectPosition = position;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const planetFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uSeed;
uniform vec3 uLowColor;
uniform vec3 uMidColor;
uniform vec3 uHighColor;
uniform vec3 uAtmosphereColor;
uniform vec3 uLightDirection;
uniform float uCloudOpacity;
uniform float uEmissive;
uniform float uHighlight;
uniform float uSpectrum;

varying vec3 vObjectPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

${NOISE_CHUNK}

vec3 spectrumShift(vec3 color, float amount) {
  vec3 shifted = vec3(color.b, color.r, color.g);
  return mix(color, shifted, amount);
}

void main() {
  vec3 sphere = normalize(vObjectPosition);
  vec3 seeded = sphere * 2.6 + vec3(uSeed);

  float continents = fbm(seeded, 5);
  float detail = fbm(seeded * 4.1 + vec3(11.3), 4) * 0.35;
  float elevation = continents + detail;

  vec3 surface = mix(uLowColor, uMidColor, smoothstep(-0.12, 0.14, elevation));
  surface = mix(surface, uHighColor, smoothstep(0.16, 0.42, elevation));

  float clouds = fbm(sphere * 3.2 + vec3(uTime * 0.02, uSeed, uTime * 0.014), 4);
  clouds = smoothstep(0.02, 0.36, clouds) * uCloudOpacity;
  surface = mix(surface, vec3(0.94, 0.97, 1.0), clouds);

  vec3 normal = normalize(vWorldNormal);
  vec3 lightDirection = normalize(uLightDirection);
  float diffuse = max(dot(normal, lightDirection), 0.0);
  float wrapped = pow(diffuse * 0.72 + 0.28, 1.25);

  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 2.6);

  // Poles pick up a faint aurora band.
  float polar = smoothstep(0.68, 0.98, abs(sphere.y));
  float aurora = polar * (0.4 + 0.6 * sin(uTime * 0.6 + sphere.x * 6.0)) * 0.35;

  vec3 color = surface * wrapped;
  color += uAtmosphereColor * fresnel * (0.55 + uHighlight * 0.8);
  color += uAtmosphereColor * aurora;
  color += surface * uEmissive * 0.35;
  color = spectrumShift(color, uSpectrum);

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

export const atmosphereVertexShader = /* glsl */ `
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const atmosphereFragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;
uniform vec3 uLightDirection;

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float rim = pow(1.0 - max(dot(viewDirection, normal), 0.0), 3.2);
  float lit = max(dot(normal, normalize(uLightDirection)), 0.0);
  float breathe = 0.9 + 0.1 * sin(uTime * 0.7);

  float alpha = rim * uIntensity * breathe * (0.35 + lit * 0.75);
  gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 1.0));
  #include <colorspace_fragment>
}
`;
