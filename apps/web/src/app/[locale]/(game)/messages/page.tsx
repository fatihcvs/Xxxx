import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { sendMessageAction } from "@/app/actions/game";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const me = await prisma.character.findFirst({
    where: { userId: session.user.id, isAlive: true },
    include: { relationsFrom: { include: { to: true }, orderBy: { level: "desc" } } },
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("messages");

  const inbox = await prisma.message.findMany({
    where: { toId: me.id },
    orderBy: { sentAt: "desc" },
    take: 30,
    include: { from: true },
  });

  // Mark unread received messages as read on view.
  const unreadIds = inbox.filter((m) => !m.readAt).map((m) => m.id);
  if (unreadIds.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unreadIds } },
      data: { readAt: new Date() },
    });
  }

  // Recipients: people in the address book plus others in the current city.
  const cityPeople = await prisma.character.findMany({
    where: { currentCityId: me.currentCityId, isAlive: true, id: { not: me.id } },
    take: 30,
  });
  const recipients = new Map<string, string>();
  for (const r of me.relationsFrom) recipients.set(r.to.id, `${r.to.firstName} ${r.to.lastName}`);
  for (const p of cityPeople) recipients.set(p.id, `${p.firstName} ${p.lastName}`);

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("compose")}</div>
        <div className="panel-body">
          {recipients.size === 0 ? (
            <p className="text-sm text-ink/50">{t("noRecipients")}</p>
          ) : (
            <form action={sendMessageAction} className="space-y-2">
              <input type="hidden" name="locale" value={locale} />
              <select name="toId" className="field" required>
                {[...recipients.entries()].map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <textarea name="body" required maxLength={1000} rows={3} className="field" placeholder={t("placeholder")} />
              <button className="btn">{t("send")}</button>
            </form>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("inbox")}</div>
        <div className="panel-body">
          {inbox.length === 0 ? (
            <p className="text-sm text-ink/50">{t("empty")}</p>
          ) : (
            <ul className="divide-y divide-black/5 text-sm">
              {inbox.map((m) => (
                <li key={m.id} className="py-2">
                  <div className="flex justify-between text-xs text-ink/50">
                    <span>
                      {m.from.firstName} {m.from.lastName}
                    </span>
                    <span>{m.sentAt.toLocaleString(locale)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
