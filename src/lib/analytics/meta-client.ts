"use client";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ?? "";
const META_API_ENDPOINT = "/api/analytics/meta";

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type MetaClientUserData = {
  em?: string[];
  ph?: string[];
  external_id?: string[];
};

export type TrackMetaEventOptions = {
  eventId?: string;
  actionSource?: string;
  sourceUrl?: string;
  userData?: MetaClientUserData;
};

let sharedUserData: MetaClientUserData | undefined;

export function trackMetaEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  options?: TrackMetaEventOptions,
): string | undefined {
  if (!META_PIXEL_ID) {
    return undefined;
  }

  const eventId = options?.eventId ?? generateMetaEventId();
  const actionSource = options?.actionSource ?? "website";
  const eventSourceUrl = options?.sourceUrl ?? (typeof window !== "undefined" ? window.location.href : undefined);
  const mergedUserData = mergeUserData(sharedUserData, options?.userData);
  const pixelUserData = toPixelUserData(mergedUserData);

  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (pixelUserData) {
      window.fbq("set", "userData", pixelUserData);
    }
    window.fbq("track", eventName, customData ?? {}, { eventID: eventId });
  }

  sendServerSideEvent({
    event_name: eventName,
    event_id: eventId,
    custom_data: customData,
    action_source: actionSource,
    event_source_url: eventSourceUrl,
    user_data: mergedUserData,
  });

  return eventId;
}

export function setMetaUserData(data?: MetaClientUserData) {
  sharedUserData = sanitizeUserData(data);
}

export function generateMetaEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mergeUserData(
  base?: MetaClientUserData,
  override?: MetaClientUserData,
): MetaClientUserData | undefined {
  if (!base && !override) {
    return undefined;
  }

  const sanitizedBase = sanitizeUserData(base);
  const sanitizedOverride = sanitizeUserData(override);

  const merged: MetaClientUserData = {
    em: mergeArrays(sanitizedBase?.em, sanitizedOverride?.em),
    ph: mergeArrays(sanitizedBase?.ph, sanitizedOverride?.ph),
    external_id: mergeArrays(sanitizedBase?.external_id, sanitizedOverride?.external_id),
  };

  return hasUserData(merged) ? merged : undefined;
}

function sanitizeUserData(data?: MetaClientUserData): MetaClientUserData | undefined {
  if (!data) {
    return undefined;
  }

  const sanitized: MetaClientUserData = {
    em: sanitizeArray(data.em, (value) => value.trim().toLowerCase()),
    ph: sanitizeArray(data.ph, (value) => value.replace(/[^0-9]/g, "")),
    external_id: sanitizeArray(data.external_id, (value) => value.trim().toLowerCase()),
  };

  return hasUserData(sanitized) ? sanitized : undefined;
}

function sanitizeArray(values: string[] | undefined, formatter: (value: string) => string) {
  if (!values?.length) {
    return undefined;
  }

  const transformed = values
    .map((value) => formatter(value))
    .filter((value) => Boolean(value));

  if (!transformed.length) {
    return undefined;
  }

  return Array.from(new Set(transformed));
}

function mergeArrays(base?: string[], override?: string[]) {
  if (!base && !override) {
    return undefined;
  }

  const merged = new Set<string>();
  base?.forEach((value) => merged.add(value));
  override?.forEach((value) => merged.add(value));

  return merged.size ? Array.from(merged) : undefined;
}

function hasUserData(data?: MetaClientUserData) {
  return Boolean(data?.em?.length || data?.ph?.length || data?.external_id?.length);
}

function toPixelUserData(data?: MetaClientUserData) {
  if (!data) {
    return undefined;
  }

  const payload: Record<string, string> = {};

  if (data.em?.[0]) {
    payload.em = data.em[0];
  }
  if (data.ph?.[0]) {
    payload.ph = data.ph[0];
  }
  if (data.external_id?.[0]) {
    payload.external_id = data.external_id[0];
  }

  return Object.keys(payload).length ? payload : undefined;
}

type ServerEventPayload = {
  event_name: string;
  event_id?: string;
  event_source_url?: string;
  action_source?: string;
  custom_data?: Record<string, unknown>;
  user_data?: MetaClientUserData;
};

async function sendServerSideEvent(payload: ServerEventPayload) {
  try {
    await fetch(META_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Meta CAPI request failed", error);
    }
  }
}
