/*
 * The smallest possible Upstash client: one REST pipeline call per request,
 * no dependency. The Vercel Marketplace integration names the variables
 * KV_REST_API_* or UPSTASH_REDIS_REST_*, depending on how it was connected —
 * either works.
 */
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export function isConfigured() {
  return Boolean(url && token);
}

/* Runs the commands in order and returns their results, in the same order. */
export async function pipeline(commands) {
  if (!commands.length) {
    return [];
  }

  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    throw new Error(`Upstash ${response.status}: ${await response.text()}`);
  }

  const results = await response.json();
  return results.map((entry) => {
    if (entry.error) {
      throw new Error(`Upstash: ${entry.error}`);
    }

    return entry.result;
  });
}
