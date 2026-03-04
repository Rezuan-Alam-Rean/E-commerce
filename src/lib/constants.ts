export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ORDER_STATUS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

export const DELIVERY_OPTIONS = ["standard", "express"] as const;
export type DeliveryOption = (typeof DELIVERY_OPTIONS)[number];

export const COOKIE_NAME = "store_token";
