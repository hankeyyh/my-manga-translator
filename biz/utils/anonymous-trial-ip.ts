import { createHmac } from "node:crypto";
import { isIP } from "node:net";

/** IPv4 原样；IPv4-mapped 收成 IPv4；IPv6 收到 /64。无法解析时返回 null。 */
export function normalizeClientIp(ip: string): string | null {
    const value = ip.trim();
    if (isIP(value) === 4) {
        return value;
    }
    const mapped = value.toLowerCase().startsWith("::ffff:") ? value.slice("::ffff:".length) : null;
    if (mapped && isIP(mapped) === 4) {
        return mapped;
    }
    if (isIP(value) !== 6) {
        return null;
    }
    const groups = expandIpv6(value);
    if (!groups) {
        return null;
    }
    return [...groups.slice(0, 4), "0", "0", "0", "0"].join(":");
}

export function hashClientIp(normalizedIp: string): string | null {
    const secret = process.env.ANONYMOUS_TRIAL_IP_SECRET;
    if (!secret) {
        return null;
    }
    return createHmac("sha256", secret).update(normalizedIp).digest("hex");
}

function expandIpv6(ip: string): string[] | null {
    const lower = ip.toLowerCase();
    const pieces = lower.split("::");
    if (pieces.length > 2) {
        return null;
    }
    const head = pieces[0] ? pieces[0].split(":") : [];
    const hasCompression = pieces.length === 2;
    const tail = hasCompression && pieces[1] ? pieces[1].split(":") : [];
    const missing = 8 - head.length - tail.length;
    if (!hasCompression && head.length !== 8) {
        return null;
    }
    if (missing < 0) {
        return null;
    }
    const parts = hasCompression ? [...head, ...Array(missing).fill("0"), ...tail] : head;
    if (parts.length !== 8 || parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) {
        return null;
    }
    return parts.map((part) => part.padStart(4, "0"));
}
