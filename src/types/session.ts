export type SessionOwner =
  | { kind: "user"; userId: string }
  | { kind: "guest"; guestToken: string };
