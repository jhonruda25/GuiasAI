export const API_BASE_URL =
  (typeof window !== "undefined" && (window as any).__ENV?.API_BASE_URL) ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8888";
