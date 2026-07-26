export const starVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uWarp;

attribute float aSize;
attribute float aPhase;
attribute float aTwinkleSpeed;
attribute vec3 aColor;

varying vec3 vColor;
varying float vBrightness;

void main() {
  vColor = aColor;

  // Smooth low-frequency brightness variation, never a hard blink.
  float twinkle = 0.62 + 0.38 * sin(uTime * aTwinkleSpeed + aPhase);
  vBrightness = twinkle;

  vec3 transformed = position;
  // During warp, stars stretch away from the view axis.
  transformed *= 1.0 + uWarp * 0.35;

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  float distanceAttenuation = 320.0 / max(-mvPosition.z, 1.0);

  gl_PointSize = aSize * uSize * uPixelRatio * distanceAttenuation * (0.7 + twinkle * 0.5);
  gl_PointSize = clamp(gl_PointSize, 0.6, 26.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const starFragmentShader = /* glsl */ `
precision highp float;

uniform float uOpacity;

varying vec3 vColor;
varying float vBrightness;

void main() {
  vec2 centered = gl_PointCoord - 0.5;
  float distance = length(centered);
  if (distance > 0.5) discard;

  float core = smoothstep(0.5, 0.0, distance);
  float halo = pow(core, 3.0);

  vec3 color = vColor * (0.65 + vBrightness * 0.6);
  float alpha = (core * 0.35 + halo * 0.85) * uOpacity * vBrightness;

  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
`;
