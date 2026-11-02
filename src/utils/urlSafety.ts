// src/utils/urlSafety.ts
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata',
  'metadata.google.internal',
  'instance-data'
]);

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.home.arpa'];

/**
 * Returns true when an IP address literal points at a loopback, private,
 * link-local, carrier-grade NAT, multicast or otherwise non-public network.
 */
export function isPrivateIp(address: string): boolean {
  const version = isIP(address);

  if (version === 4) {
    const parts = address.split('.').map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
      return true;
    }
    const [a, b] = parts;

    if (a === 0) return true; // "this" network
    if (a === 10) return true; // private
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 192 && b === 0) return true; // IETF protocol assignments
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
    if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
    if (a >= 224) return true; // multicast + reserved
    return false;
  }

  if (version === 6) {
    const normalized = address.toLowerCase().split('%')[0];

    if (normalized === '::' || normalized === '::1') return true;

    // IPv4-mapped IPv6 (::ffff:127.0.0.1)
    const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);

    if (/^f[cd][0-9a-f]{2}:/.test(normalized)) return true; // unique local fc00::/7
    if (/^fe[89ab][0-9a-f]:/.test(normalized)) return true; // link-local fe80::/10
    if (normalized.startsWith('ff')) return true; // multicast
    return false;
  }

  return true;
}

/**
 * Validates that a URL is an http(s) URL pointing at a public host.
 * Throws with a user-facing message when it is not safe to fetch.
 */
export async function assertSafePublicUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('That does not look like a valid URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http:// and https:// URLs can be fetched.');
  }

  if (url.username || url.password) {
    throw new Error('URLs with embedded credentials are not allowed.');
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');

  if (!hostname) throw new Error('The URL is missing a hostname.');
  if (BLOCKED_HOSTNAMES.has(hostname)) throw new Error('That host is not allowed.');
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    throw new Error('That host is not allowed.');
  }

  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('Private and internal addresses are not allowed.');
    return url;
  }

  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    throw new Error(`Could not resolve host "${hostname}".`);
  }

  if (addresses.length === 0) throw new Error(`Could not resolve host "${hostname}".`);
  if (addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new Error('Private and internal addresses are not allowed.');
  }

  return url;
}

/**
 * Fetches a URL with SSRF protections: scheme/host validation, manual redirect
 * handling (each hop re-validated), a hard timeout, and a response size cap.
 */
export async function safeFetchText(
  rawUrl: string,
  options: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    maxBytes?: number;
    maxRedirects?: number;
  } = {}
): Promise<{ url: string; status: number; ok: boolean; text: string }> {
  const { headers = {}, timeoutMs = 10_000, maxBytes = 1_000_000, maxRedirects = 3 } = options;

  let currentUrl = await assertSafePublicUrl(rawUrl);

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const response = await fetch(currentUrl, {
      headers,
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        return { url: currentUrl.href, status: response.status, ok: false, text: '' };
      }
      currentUrl = await assertSafePublicUrl(new URL(location, currentUrl).href);
      continue;
    }

    if (!response.ok) {
      return { url: currentUrl.href, status: response.status, ok: false, text: '' };
    }

    const declaredLength = Number(response.headers.get('content-length') || 0);
    if (declaredLength && declaredLength > maxBytes) {
      throw new Error('That page is too large to analyse.');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      const text = (await response.text()).slice(0, maxBytes);
      return { url: currentUrl.href, status: response.status, ok: true, text };
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        throw new Error('That page is too large to analyse.');
      }
      chunks.push(value);
    }

    const text = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf8');
    return { url: currentUrl.href, status: response.status, ok: true, text };
  }

  throw new Error('Too many redirects.');
}
