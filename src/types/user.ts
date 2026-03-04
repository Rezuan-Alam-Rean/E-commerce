import type { UserRole } from "@/lib/constants";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
};
