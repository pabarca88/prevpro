import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Inicializa Redis (solo una vez)
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Crea limitador: 5 solicitudes por minuto por IP
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});
