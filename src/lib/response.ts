import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

export function ok<T>(data: T, status = 200) {
  const body: ApiResponse<T> = { success: true, data };
  return NextResponse.json(body, { status });
}

export function fail(message: string, status = 400) {
  const body: ApiResponse<null> = { success: false, error: message };
  return NextResponse.json(body, { status });
}
