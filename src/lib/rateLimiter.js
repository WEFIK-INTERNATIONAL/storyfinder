const rateLimitMap = new Map();

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

export function checkRateLimit(ip) {
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, start: now });
        return true;
    }

    const data = rateLimitMap.get(ip);

    if (now - data.start > WINDOW_SIZE) {
        rateLimitMap.set(ip, { count: 1, start: now });
        return true;
    }

    if (data.count >= MAX_REQUESTS) {
        return false;
    }

    data.count++;
    return true;
}
