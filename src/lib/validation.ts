import { ZodSchema } from "zod";

export async function parseBody<T>(req: Request, schema: ZodSchema<T>) {
  const json = await req.json();
  return schema.parse(json);
}
