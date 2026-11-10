/*
 * The beads of the AI landing's swirl as small copies of the cube in the
 * middle: a rounded cube wearing a detail of a case's interface on its faces,
 * the picture slowly running like liquid, held in a clear rippling shell —
 * ray-marched in WebGL the way lib/aiCube.js draws the big one. Every bead is
 * one quad on a canvas the size of the swirl's, which the swirl then lays
 * into its own picture.
 *
 * createBeadRenderer() → { canvas, resize(width, height), setDetails(list),
 * draw(beads) } or null without WebGL. `list` is [{ image, crop }], `crop`
 * being [left, top, side]; `beads` are { x, y, radius, alpha, detail, beat,
 * spin }, in device pixels, drawn in the order given.
 */

const CELL = 256;
const COLUMNS = 8;

const VERTEX = `
attribute vec2 corner;
uniform vec2 resolution;
uniform vec3 bead;
varying vec2 local;
void main() {
  vec2 at = (bead.xy + corner * bead.z) / resolution * 2.0 - 1.0;
  gl_Position = vec4(at.x, -at.y, 0.0, 1.0);
  local = vec2(corner.x, -corner.y);
}
`;

const FRAGMENT = `
precision highp float;
varying vec2 local;
uniform sampler2D atlas;
uniform vec4 cell;
uniform float beat;
uniform float spin;
uniform float alpha;

mat3 turn;

mat3 rotation(float yaw, float pitch) {
  float cy = cos(yaw), sy = sin(yaw), cp = cos(pitch), sp = sin(pitch);
  return mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy) *
         mat3(1.0, 0.0, 0.0, 0.0, cp, sp, 0.0, -sp, cp);
}

float roundBox(vec3 p, vec3 size, float radius) {
  vec3 q = abs(p) - size + radius;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - radius;
}

float ripple(vec3 p, float amount, float speed) {
  return amount * sin(3.1 * p.x + beat * speed) * sin(2.7 * p.y + beat * speed * 1.3) *
         sin(2.9 * p.z + beat * speed * 0.8);
}

float core(vec3 p) {
  vec3 q = turn * p;
  return roundBox(q, vec3(0.4), 0.1) + ripple(q, 0.025, 1.4);
}

float shell(vec3 p) {
  vec3 q = turn * p;
  return roundBox(q, vec3(0.5), 0.26) + ripple(q * 1.3, 0.035, 1.0);
}

vec3 normalOf(vec3 p, bool inner) {
  vec2 e = vec2(0.002, 0.0);
  if (inner) {
    return normalize(vec3(core(p + e.xyy) - core(p - e.xyy), core(p + e.yxy) - core(p - e.yxy),
                          core(p + e.yyx) - core(p - e.yyx)));
  }
  return normalize(vec3(shell(p + e.xyy) - shell(p - e.xyy), shell(p + e.yxy) - shell(p - e.yxy),
                        shell(p + e.yyx) - shell(p - e.yyx)));
}

float march(vec3 origin, vec3 direction, bool inner) {
  float t = 0.0;
  for (int i = 0; i < 56; i++) {
    vec3 p = origin + direction * t;
    float d = inner ? core(p) : shell(p);
    if (d < 0.0015) return t;
    t += d * 0.85;
    if (t > 6.0) break;
  }
  return -1.0;
}

// The detail on whichever face the point is on, running slowly like liquid.
vec3 face(vec3 q, vec3 n) {
  vec3 a = abs(n);
  vec2 f;
  if (a.z >= a.x && a.z >= a.y) {
    f = vec2(q.x * sign(n.z), -q.y);
  } else if (a.x >= a.y) {
    f = vec2(-q.z * sign(n.x), -q.y);
  } else {
    f = vec2(q.x, q.z * sign(n.y));
  }
  f = f / 0.84 + 0.5;
  f += 0.03 * vec2(sin(f.y * 9.0 + beat * 1.7), sin(f.x * 8.0 - beat * 1.4));
  f = clamp(f, 0.004, 0.996);
  return texture2D(atlas, cell.xy + f * cell.zw).rgb;
}

void main() {
  vec2 uv = local * 0.36;
  turn = rotation(beat * 0.5 + spin, 0.45 + sin(beat * 0.3 + spin) * 0.3);

  vec3 origin = vec3(0.0, 0.0, 4.0);
  vec3 direction = normalize(vec3(uv, -1.75));
  vec3 light = normalize(vec3(-0.55, 0.85, 0.55));

  float hit = march(origin, direction, false);
  if (hit < 0.0) {
    discard;
  }

  vec3 surface = origin + direction * hit;
  vec3 normal = normalOf(surface, false);
  float facing = clamp(dot(normal, -direction), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, 3.0);
  float shine = pow(max(dot(reflect(direction, normal), light), 0.0), 60.0) * 0.6;

  vec3 inside = refract(direction, normal, 0.92);
  float coreHit = march(surface + inside * 0.01, inside, true);

  // Clear glass: barely there face-on, milky and bright towards its edges.
  vec3 color = mix(vec3(0.86, 0.9, 0.95), vec3(1.0), fresnel);
  float opacity = 0.16 + fresnel * 0.7;

  if (coreHit > 0.0) {
    vec3 p = surface + inside * (coreHit + 0.01);
    vec3 n = normalOf(p, true);
    vec3 picture = face(turn * p, turn * n);
    float diffuse = max(dot(n, light), 0.0);
    float rim = pow(1.0 - clamp(dot(n, -inside), 0.0, 1.0), 2.5);
    float glint = pow(max(dot(reflect(inside, n), light), 0.0), 36.0);
    // Lit like the big cube: the faces apart in tone, a cyan-to-violet sheen
    // where they turn away, a small wet highlight.
    vec3 lit = picture * (0.68 + 0.42 * diffuse);
    vec3 play = 0.5 + 0.5 * cos(6.2831 * (dot(n, -inside) * 0.9 + p.y * 0.6 + beat * 0.05) +
                                vec3(0.0, 2.1, 4.2));
    vec3 sheen = mix(vec3(0.3, 0.85, 1.0), vec3(0.75, 0.45, 1.0), play.x);
    lit += sheen * rim * 0.4 + vec3(1.0) * glint * 0.45;
    color = mix(lit, vec3(0.92, 0.95, 1.0), 0.04 + fresnel * 0.45);
    opacity = 1.0;
  }

  color += vec3(1.0) * shine;
  opacity = clamp(opacity + shine, 0.0, 1.0) * alpha;
  gl_FragColor = vec4(color * opacity, opacity);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export function createBeadRenderer() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', {
    premultipliedAlpha: true,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  if (!gl) {
    return null;
  }
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vertex || !fragment) {
    return null;
  }
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return null;
  }

  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const corner = gl.getAttribLocation(program, 'corner');
  gl.enableVertexAttribArray(corner);
  gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const at = (name) => gl.getUniformLocation(program, name);
  const uniforms = {
    resolution: at('resolution'),
    bead: at('bead'),
    cell: at('cell'),
    beat: at('beat'),
    spin: at('spin'),
    alpha: at('alpha'),
  };
  let cells = [];
  const texture = gl.createTexture();

  return {
    canvas,

    resize(width, height) {
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },

    // All the details on one texture, a square cell each.
    setDetails(list) {
      const rows = Math.max(1, Math.ceil(list.length / COLUMNS));
      const sheet = document.createElement('canvas');
      sheet.width = CELL * COLUMNS;
      sheet.height = CELL * rows;
      const sheetContext = sheet.getContext('2d');
      sheetContext.fillStyle = '#ffffff';
      sheetContext.fillRect(0, 0, sheet.width, sheet.height);
      cells = list.map(({ image, crop }, index) => {
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        const [left, top, size] = crop ?? [
          (image.naturalWidth - side) / 2,
          (image.naturalHeight - side) / 2,
          side,
        ];
        const x = (index % COLUMNS) * CELL;
        const y = Math.floor(index / COLUMNS) * CELL;
        sheetContext.drawImage(image, left, top, size, size, x, y, CELL, CELL);
        return [x / sheet.width, y / sheet.height, CELL / sheet.width, CELL / sheet.height];
      });
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    },

    draw(beads) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      for (const bead of beads) {
        const cell = cells[bead.detail];
        if (!cell) {
          continue;
        }
        gl.uniform3f(uniforms.bead, bead.x, bead.y, bead.radius);
        gl.uniform4f(uniforms.cell, cell[0], cell[1], cell[2], cell[3]);
        gl.uniform1f(uniforms.beat, bead.beat);
        gl.uniform1f(uniforms.spin, bead.spin);
        gl.uniform1f(uniforms.alpha, bead.alpha);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    },
  };
}
