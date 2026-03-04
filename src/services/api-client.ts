import type { ApiResponse } from "@/types/api";

export async function apiRequest<T>(input: string, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const data = (await res.json()) as ApiResponse<T>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}
