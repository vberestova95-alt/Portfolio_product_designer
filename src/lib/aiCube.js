/*
 * The shape in the middle of the AI landing: a blue rounded cube — the site's
 * square, made solid — held in a clear, softly wobbling shell, the two turning
 * slowly together. Ray-marched in one WebGL fragment shader on a transparent
 * canvas, so it sits on the page's paper with nothing behind it.
 *
 * attachAiCube(canvas) → cleanup. Without WebGL the canvas stays empty and
 * the CSS fallback square behind it shows instead.
 */

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform vec2 tilt;

mat3 rotation(float yaw, float pitch) {
  float cy = cos(yaw), sy = sin(yaw), cp = cos(pitch), sp = sin(pitch);
  return mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy) *
         mat3(1.0, 0.0, 0.0, 0.0, cp, sp, 0.0, -sp, cp);
}

float roundBox(vec3 p, vec3 size, float radius) {
  vec3 q = abs(p) - size + radius;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - radius;
}

// A slow ripple over the surface, so both bodies read as liquid, not plastic.
float ripple(vec3 p, float amount, float speed) {
  return amount * sin(3.1 * p.x + time * speed) * sin(2.7 * p.y + time * speed * 1.3) *
         sin(2.9 * p.z + time * speed * 0.8);
}

mat3 turn;

float core(vec3 p) {
  vec3 q = turn * p;
  return roundBox(q, vec3(0.4), 0.13) + ripple(q, 0.012, 0.9);
}

float shell(vec3 p) {
  vec3 q = turn * p;
  return roundBox(q, vec3(0.66), 0.4) + ripple(q * 1.2, 0.05, 0.7);
}

vec3 normalOf(vec3 p, bool inner) {
  vec2 e = vec2(0.0015, 0.0);
  if (inner) {
    return normalize(vec3(core(p + e.xyy) - core(p - e.xyy), core(p + e.yxy) - core(p - e.yxy),
                          core(p + e.yyx) - core(p - e.yyx)));
  }
  return normalize(vec3(shell(p + e.xyy) - shell(p - e.xyy), shell(p + e.yxy) - shell(p - e.yxy),
                        shell(p + e.yyx) - shell(p - e.yyx)));
}

float march(vec3 origin, vec3 direction, bool inner) {
  float t = 0.0;
  for (int i = 0; i < 80; i++) {
    vec3 p = origin + direction * t;
    float d = inner ? core(p) : shell(p);
    if (d < 0.001) return t;
    t += d * 0.8;
    if (t > 6.0) break;
  }
  return -1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution) / resolution.y;
  turn = rotation(time * 0.32 + tilt.x, 0.55 + sin(time * 0.21) * 0.25 + tilt.y);

  vec3 origin = vec3(0.0, 0.0, 4.0);
  vec3 direction = normalize(vec3(uv, -1.75));
  vec3 light = normalize(vec3(-0.55, 0.85, 0.55));
  vec3 fill = normalize(vec3(0.8, -0.2, 0.6));

  float hit = march(origin, direction, false);
  if (hit < 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec3 surface = origin + direction * hit;
  vec3 normal = normalOf(surface, false);
  float facing = clamp(dot(normal, -direction), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, 3.0);
  float shine = pow(max(dot(reflect(direction, normal), light), 0.0), 60.0);

  // Through the shell to the core, bent a little as through water.
  vec3 inside = refract(direction, normal, 0.92);
  float coreHit = march(surface + inside * 0.01, inside, true);

  // Clear glass: barely there face-on, milky and bright towards its edges.
  vec3 color = mix(vec3(0.86, 0.9, 0.95), vec3(1.0), fresnel);
  float alpha = 0.16 + fresnel * 0.7;

  if (coreHit > 0.0) {
    vec3 p = surface + inside * (coreHit + 0.01);
    vec3 n = normalOf(p, true);
    float diffuse = max(dot(n, light), 0.0);
    float soft = max(dot(n, fill), 0.0);
    float rim = pow(1.0 - clamp(dot(n, -inside), 0.0, 1.0), 2.5);
    float glint = pow(max(dot(reflect(inside, n), light), 0.0), 10.0);
    // A dense, matte blue: the faces differ only a little, the way pigment
    // does, with a broad soft sheen instead of a plastic highlight.
    vec3 deep = vec3(0.02, 0.05, 0.4);
    vec3 bright = vec3(0.14, 0.3, 1.0);
    vec3 blue = mix(deep, bright, smoothstep(0.0, 1.0, 0.1 + 0.9 * diffuse));
    blue += vec3(0.03, 0.07, 0.3) * soft * 0.35;
    blue += vec3(0.2, 0.3, 0.8) * rim * 0.15 + vec3(0.5, 0.6, 1.0) * glint * 0.06;
    // The shell's milk lies over the core, thicker towards its edges.
    color = mix(blue, vec3(0.92, 0.95, 1.0), 0.03 + fresnel * 0.45);
    alpha = 1.0;
  }

  shine *= 0.35;
  color += vec3(1.0) * shine;
  alpha = clamp(alpha + shine, 0.0, 1.0);
  gl_FragColor = vec4(color * alpha, alpha);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export function attachAiCube(canvas) {
  const gl = canvas?.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true });
  if (!gl) {
    return () => {};
  }

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vertex || !fragment) {
    return () => {};
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return () => {};
  }

  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const tilt = gl.getUniformLocation(program, 'tilt');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let frame = 0;
  let visible = true;
  let clock = 2;
  let last = performance.now();

  canvas.classList.add('is-live');

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw() {
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform1f(time, clock);
    gl.uniform2f(tilt, pointer.x * 0.5, pointer.y * 0.35);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function tick(now) {
    clock += Math.min(0.05, (now - last) / 1000);
    last = now;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    draw();
    frame = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
  }

  function start() {
    if (reduceMotion || frame || !visible || document.hidden) {
      return;
    }
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function onPointerMove(event) {
    pointer.tx = event.clientX / window.innerWidth - 0.5;
    pointer.ty = event.clientY / window.innerHeight - 0.5;
  }

  function onVisibility() {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      start();
    } else {
      stop();
    }
  });
  const resizeObserver = new ResizeObserver(() => {
    resize();
    draw();
  });

  resize();
  draw();
  observer.observe(canvas);
  resizeObserver.observe(canvas);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  start();

  return () => {
    stop();
    observer.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.classList.remove('is-live');
  };
}
