const rateLimitMap = new Map();

const WINDOW_SIZE = 60 * 1000;
const MAX_REQUESTS = 20;
const MAX_MAP_SIZE = 1000;

export function checkRateLimit(ip) {
    const now = Date.now();

    // Prevent Map from growing infinitely under attack
    if (rateLimitMap.size > MAX_MAP_SIZE) {
        // Quick cleanup of expired items
        for (const [key, data] of rateLimitMap.entries()) {
            if (now - data.start > WINDOW_SIZE) {
                rateLimitMap.delete(key);
            }
        }
        // If still too large, aggressive clear to protect memory
        if (rateLimitMap.size > MAX_MAP_SIZE) {
            rateLimitMap.clear();
        }
    }

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
