type RuntimeWindow = Window & {
  __ENV?: {
    API_BASE_URL?: string;
  };
};

const runtimeApiBaseUrl =
  typeof window !== "undefined"
    ? (window as RuntimeWindow).__ENV?.API_BASE_URL
    : undefined;

export const API_BASE_URL =
  runtimeApiBaseUrl ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8888";
