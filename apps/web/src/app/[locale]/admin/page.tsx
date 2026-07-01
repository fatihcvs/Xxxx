import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { Link } from "@/i18n/routing";
import { formatGameDate } from "@/lib/world";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="panel">
      <div className="panel-body">
        <div className="text-2xl font-bold text-brand">{value}</div>
        <div className="text-xs text-ink/60">{label}</div>
      </div>
    </div>
  );
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isAdmin = me?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="panel">
          <div className="panel-header">Admin</div>
          <div className="panel-body text-sm text-ink/60">
            <p>You do not have admin access.</p>
            <p className="mt-2">
              <Link href="/home" className="text-brand hover:underline">
                Back to game
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  const [users, characters, npcs, players, bands, releases, cities, elections, deaths] =
    await Promise.all([
      prisma.user.count(),
      prisma.character.count({ where: { isAlive: true } }),
      prisma.character.count({ where: { isAlive: true, userId: null, parentId: null } }),
      prisma.character.count({ where: { isAlive: true, userId: { not: null } } }),
      prisma.band.count(),
      prisma.release.count({ where: { active: true } }),
      prisma.city.count(),
      prisma.election.count({ where: { resolved: false } }),
      prisma.character.count({ where: { isAlive: false } }),
    ]);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin dashboard</h1>
        <div className="text-sm text-ink/60">World date: {formatGameDate()}</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Accounts" value={users} />
        <Stat label="Living characters" value={characters} />
        <Stat label="Player characters" value={players} />
        <Stat label="NPCs" value={npcs} />
        <Stat label="Bands" value={bands} />
        <Stat label="Active releases" value={releases} />
        <Stat label="Cities" value={cities} />
        <Stat label="Open elections" value={elections} />
        <Stat label="Deceased" value={deaths} />
      </div>
      <div className="panel">
        <div className="panel-header">Operations</div>
        <div className="panel-body text-sm text-ink/60 space-y-1">
          <p>Heartbeat: <code>pnpm --filter @fameworld/worker once</code> (or run the daemon).</p>
          <p>Top up the NPC world: <code>pnpm seed:npc</code>.</p>
          <p>Health probe: <code>/api/health</code>.</p>
        </div>
      </div>
      <p className="text-sm">
        <Link href="/home" className="text-brand hover:underline">
          Back to game
        </Link>
      </p>
    </main>
  );
}
