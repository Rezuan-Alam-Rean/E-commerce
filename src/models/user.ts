import { Schema, model, models, type InferSchemaType } from "mongoose";
import { USER_ROLES } from "@/lib/constants";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: "user" },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

if (models.User && !models.User.schema.path("avatar")) {
  models.User.schema.add({ avatar: { type: String } });
}

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = models.User || model("User", userSchema);
