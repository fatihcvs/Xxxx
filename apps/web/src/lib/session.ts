import { auth } from "@/auth";

/** Return the signed-in user id or throw (for use in server actions). */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new Error("Not authenticated");
  return id;
}
