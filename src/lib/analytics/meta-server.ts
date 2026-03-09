import "server-only";
import { createHash } from "crypto";

const META_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID ?? process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ?? "";
const META_CAPI_ACCESS_TOKEN = process.env.FACEBOOK_CAPI_ACCESS_TOKEN ?? "";
const META_TEST_EVENT_CODE = process.env.FACEBOOK_CAPI_TEST_EVENT_CODE?.trim() || undefined;

export type MetaUserData = {
  em?: string[];
  ph?: string[];
  external_id?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
};

export type MetaServerEvent = {
  event_name: string;
  event_id?: string;
  event_source_url?: string;
  action_source?: string;
  custom_data?: Record<string, unknown>;
  user_data?: MetaUserData;
};

export type MetaServerResult =
  | { success: true; response: unknown }
  | { success: false; error: string };

export async function sendMetaServerEvent(event: MetaServerEvent): Promise<MetaServerResult> {
  if (!META_PIXEL_ID) {
    return { success: false, error: "Missing Meta Pixel ID" };
  }

  if (!META_CAPI_ACCESS_TOKEN) {
    return { success: false, error: "Missing Meta CAPI access token" };
  }

  const sanitizedUserData = sanitizeUserData(event.user_data);

  const payload: Record<string, unknown> = {
    event_name: event.event_name,
    event_time: Math.floor(Date.now() / 1000),
    action_source: event.action_source ?? "website",
  };

  if (event.event_id) {
    payload.event_id = event.event_id;
  }

  if (event.event_source_url) {
    payload.event_source_url = event.event_source_url;
  }

  if (sanitizedUserData) {
    payload.user_data = sanitizedUserData;
  }

  if (event.custom_data) {
    payload.custom_data = event.custom_data;
  }

  const requestBody: Record<string, unknown> = {
    data: [payload],
  };

  if (META_TEST_EVENT_CODE) {
    requestBody.test_event_code = META_TEST_EVENT_CODE;
  }

  const endpoint = new URL(`https://graph.facebook.com/v18.0/${encodeURIComponent(META_PIXEL_ID)}/events`);
  endpoint.searchParams.set("access_token", META_CAPI_ACCESS_TOKEN);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Meta CAPI error", errorText);
    return { success: false, error: errorText };
  }

  const json = (await response.json()) as unknown;
  return { success: true, response: json };
}

function sanitizeUserData(userData?: MetaUserData) {
  if (!userData) {
    return undefined;
  }

  const payload: Record<string, unknown> = {};

  const hashedEmails = hashArray(userData.em, normalizeEmail);
  if (hashedEmails?.length) {
    payload.em = hashedEmails;
  }

  const hashedPhones = hashArray(userData.ph, normalizePhone);
  if (hashedPhones?.length) {
    payload.ph = hashedPhones;
  }

  const hashedExternalIds = hashArray(userData.external_id, normalizeExternalId);
  if (hashedExternalIds?.length) {
    payload.external_id = hashedExternalIds;
  }

  if (userData.client_ip_address) {
    payload.client_ip_address = userData.client_ip_address;
  }

  if (userData.client_user_agent) {
    payload.client_user_agent = userData.client_user_agent;
  }

  return Object.keys(payload).length ? payload : undefined;
}

function hashArray(values?: string[], formatter?: (value: string) => string) {
  if (!values?.length) {
    return undefined;
  }

  const hashed = values
    .map((value) => (formatter ? formatter(value) : value))
    .map((value) => hashSha256(value))
    .filter((value): value is string => Boolean(value));

  return hashed.length ? hashed : undefined;
}

function hashSha256(raw?: string) {
  const value = raw?.trim();
  if (!value) {
    return undefined;
  }
  return createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits;
}

function normalizeExternalId(value: string) {
  return value.trim().toLowerCase();
}
