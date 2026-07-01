"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { prisma } from "@fameworld/db";
import { signIn, signOut } from "@/auth";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  locale: z.string().default("en"),
});

export type AuthActionState = { error?: string } | undefined;

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale") ?? "en",
  });
  if (!parsed.success) return { error: "invalid" };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "emailTaken" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { email, passwordHash, locale: parsed.data.locale },
  });

  // Sign the new user in and send them to character creation.
  await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirectTo: `/${parsed.data.locale}/create`,
  });
  return undefined;
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: `/${locale}/home`,
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "invalid" };
    throw error; // re-throw redirect
  }
  return undefined;
}

export async function logoutAction(locale: string): Promise<void> {
  await signOut({ redirectTo: `/${locale}/login` });
}
