import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale routing only. Auth is enforced in server layouts (Node runtime) so we
// can use Prisma/bcrypt without Edge-runtime constraints.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
