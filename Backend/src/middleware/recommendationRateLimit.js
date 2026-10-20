const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const requests = new Map();

export default function recommendationRateLimit(req, res, next) {
  const now = Date.now();
  const key = String(req.userId || req.ip);
  const entry = requests.get(key);

  if (!entry || now >= entry.windowEndsAt) {
    requests.set(key, { count: 1, windowEndsAt: now + WINDOW_MS });
  } else if (entry.count >= MAX_REQUESTS) {
    res.set("Retry-After", String(Math.ceil((entry.windowEndsAt - now) / 1000)));
    return res.status(429).json({ message: "Too many recommendation requests. Please try again later." });
  } else {
    entry.count += 1;
  }

  if (requests.size > 2000) {
    for (const [requestKey, request] of requests) {
      if (now >= request.windowEndsAt) requests.delete(requestKey);
    }
  }

  next();
}
