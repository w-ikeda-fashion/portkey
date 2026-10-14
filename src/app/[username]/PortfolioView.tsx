import Link from "next/link";
import ShareButtons from "./ShareButtons";
import ViewTracker from "./ViewTracker";
import Logo, { LogoMark } from "../_components/pk/Logo";
import { ButtonLink, TEXT_LINK } from "../_components/pk/Button";
import { Chip } from "../_components/pk/Chip";
import ContributionGraph from "../_components/pk/ContributionGraph";
import EntryItem from "../_components/pk/EntryItem";
import { buildCalendar, streaks, toJstDate } from "../_components/pk/calendar";
import { toolColor } from "../_components/pk/tools";

const CATEGORY_LABEL: Record<string, string> = {
  webapp: "Webアプリ",
  business: "業務効率化",
};

export const TABS = [
  { key: "overview", label: "概要" },
  { key: "entries", label: "エントリー" },
  { key: "tools", label: "ツール" },
  { key: "stats", label: "統計" },
] as const;
export type TabKey = (typeof TABS)[number]["key"];

const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 sm:px-8";

export type PortfolioUser = {
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  ai_tools: string[] | null;
  domains: string[] | null;
};

export type Achievement = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  domain: string | null;
  ai_tools: string[] | null;
  outcome: string | null;
  url: string | null;
  created_at: string;
};

type Props = {
  username: string;
  user: PortfolioUser;
  entries: Achievement[];
  tab: TabKey;
  pageUrl: string;
  now?: Date;
};

/** 公開ポートフォリオの表示層。データ取得は page.tsx が担う */
export default function PortfolioView({ username, user, entries, tab, pageUrl, now = new Date() }: Props) {
  const displayName = user.name ?? username;
  const domains = (user.domains ?? []) as string[];
  const profileTools = (user.ai_tools ?? []) as string[];

  // ── 表示用の集計（取得済みの公開エントリーのみから算出） ──
  const today = toJstDate(now);
  const dayCounts: Record<string, number> = {};
  const toolCounts: Record<string, number> = {};
  for (const a of entries) {
    const d = toJstDate(a.created_at);
    dayCounts[d] = (dayCounts[d] ?? 0) + 1;
    for (const t of a.ai_tools ?? []) toolCounts[t] = (toolCounts[t] ?? 0) + 1;
  }
  const calendar = buildCalendar(today, dayCounts);
  const yearTotal = calendar.reduce((sum, d) => sum + (d.future ? 0 : d.count), 0);
  const { longest, current } = streaks(Object.keys(dayCounts), today);
  const topTools = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]);
  const totalToolUses = topTools.reduce((sum, [, c]) => sum + c, 0);
  const outcomeCount = entries.filter((a) => a.outcome).length;

  const summary = [
    { label: "AI活用回数", value: totalToolUses.toLocaleString("ja-JP") },
    { label: "最長連続記録", value: String(longest), unit: "日" },
    { label: "プロジェクト", value: entries.length.toLocaleString("ja-JP") },
    // 金額の構造化データは未実装。アウトカム軸が入るまでは「—」を出す
    { label: "推定削減額", value: "—", warm: true },
  ];

  const tabHref = (key: TabKey) => (key === "overview" ? `/${username}` : `/${username}?tab=${key}`);

  const entryList = (list: Achievement[]) =>
    list.length === 0 ? (
      <p className="py-7 text-[15px] text-pk-ink-2">まだ公開されている実績はありません。</p>
    ) : (
      <div>
        {list.map((a) => (
          <EntryItem
            key={a.id}
            date={toJstDate(a.created_at)}
            title={a.title}
            description={a.description}
            tools={a.ai_tools ?? []}
            tags={[a.category && (CATEGORY_LABEL[a.category] ?? a.category), a.domain].filter(
              (t): t is string => Boolean(t)
            )}
            impact={a.outcome}
            link={
              a.url && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className={`${TEXT_LINK} min-h-0 text-[13px]`}>
                  リンク <span aria-hidden>→</span>
                </a>
              )
            }
          />
        ))}
      </div>
    );

  const summaryCards = (
    <section aria-label="サマリー" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {summary.map((s) => (
        <div
          key={s.label}
          className={`rounded-[20px] border p-5 sm:p-6 ${
            s.warm ? "border-pk-border-warm bg-pk-surface-warm text-pk-accent-deep" : "border-pk-border bg-pk-surface"
          }`}
        >
          <p className={`text-[13px] ${s.warm ? "" : "text-pk-ink-3"}`}>{s.label}</p>
          <p className="pk-num mt-2 text-[34px] leading-tight sm:text-[40px]">
            {s.value}
            {s.unit && <span className="ml-1 font-sans text-[18px] font-medium tracking-normal">{s.unit}</span>}
          </p>
        </div>
      ))}
    </section>
  );

  const graph = (
    <ContributionGraph title="この1年の活動" days={calendar} total={yearTotal} streak={current} />
  );

  const toolsCard = (limit?: number) => {
    const list = limit ? topTools.slice(0, limit) : topTools;
    return (
      <section aria-labelledby="tools-title" className="rounded-3xl border border-pk-border bg-pk-surface p-6 sm:p-7">
        <h2 id="tools-title" className="mb-5 text-[17px] font-bold">よく使うツール</h2>
        {list.length === 0 ? (
          <p className="text-[15px] text-pk-ink-2">まだ記録がありません。</p>
        ) : (
          <ul className="flex flex-col gap-[18px]">
            {list.map(([name, count]) => {
              // そのツールを使ったエントリーの割合
              const pct = `${Math.round((count / entries.length) * 100)}%`;
              return (
                <li key={name}>
                  <div className="mb-2 flex justify-between gap-3 text-[14px]">
                    <span>{name}</span>
                    <span className="font-display text-pk-ink-2">{pct}</span>
                  </div>
                  <div aria-hidden className="h-2 overflow-hidden rounded-full bg-pk-chip">
                    <div className="h-full rounded-full" style={{ width: pct, background: toolColor(name) }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  };

  const gainsCard = (
    <section aria-labelledby="gains-title" className="rounded-3xl bg-pk-night p-6 text-pk-night-ink sm:p-7">
      <h2 id="gains-title" className="mb-4 text-[17px] font-bold">AIで得られたもの</h2>
      <dl className="flex flex-col gap-3.5 text-[15px]">
        {[
          // 工数・コストは構造化データが入るまで「—」
          { label: "削減した工数", value: "—" },
          { label: "節約したコスト", value: "—" },
          { label: "新しくできたこと", value: outcomeCount > 0 ? `${outcomeCount}件` : "—" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between gap-3">
            <dt className="text-pk-night-ink-2">{row.label}</dt>
            <dd className="font-display font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div className="flex min-h-screen flex-col text-pk-ink">
      <ViewTracker username={username} />

      {/* ヘッダー */}
      <header className={`${CONTAINER} flex flex-wrap items-center justify-between gap-4 py-6`}>
        <Logo size="sm" />
        <ButtonLink href="/auth" variant="secondary" size="sm">自分のポートフォリオを作る</ButtonLink>
      </header>

      <main className="flex-1">
        {/* プロフィール＋タブ */}
        <section className={`${CONTAINER} pt-8 sm:pt-12`}>
          <div className="flex flex-wrap items-end justify-between gap-7">
            <div className="flex flex-wrap items-center gap-7">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={displayName} className="size-28 shrink-0 rounded-[32px] object-cover" />
              ) : (
                <div
                  aria-hidden
                  className="flex size-28 shrink-0 items-center justify-center rounded-[32px] bg-pk-accent font-display text-[40px] font-bold tracking-[-0.02em] text-pk-on-accent"
                >
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="break-words text-[32px] font-bold leading-tight tracking-[-0.01em] sm:text-[40px]">
                  {displayName}
                </h1>
                <p className="mb-3.5 mt-1.5 text-[16px] text-pk-ink-2">
                  <span className="font-display">@{username}</span>
                  {domains.length > 0 && <> · {domains.join(" / ")}</>}
                </p>
                {user.bio && <p className="mb-3.5 max-w-[36em] text-[15px] leading-[1.9] text-pk-ink-2">{user.bio}</p>}
                {profileTools.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileTools.map((t) => <Chip key={t}>{t}</Chip>)}
                  </div>
                )}
              </div>
            </div>
            {/* シェア — #31 #42 */}
            <ShareButtons url={pageUrl} name={displayName} />
          </div>

          <nav aria-label="ポートフォリオ" className="mt-10 flex flex-wrap gap-1 border-b border-pk-rule">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <Link
                  key={t.key}
                  href={tabHref(t.key)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-12 items-center px-[18px] text-[15px] ${
                    active
                      ? "font-bold text-pk-ink shadow-[inset_0_-2.5px_0_var(--pk-accent)]"
                      : "text-pk-ink-2 hover:text-pk-ink"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </section>

        <div className={`${CONTAINER} pb-24 pt-10`}>
          {(tab === "overview" || tab === "stats") && (
            <div className="flex flex-col gap-6">
              {summaryCards}
              {graph}
            </div>
          )}

          {tab === "overview" && (
            <div className="mt-12 flex flex-wrap gap-10">
              <section aria-labelledby="recent-title" className="min-w-0 flex-[999_1_560px]">
                <h2 id="recent-title" className="mb-2 text-[22px] font-bold">最近のエントリー</h2>
                {entryList(entries.slice(0, 3))}
                {entries.length > 3 && (
                  <Link href={tabHref("entries")} className={`${TEXT_LINK} mt-4 text-[15px]`}>
                    すべてのエントリーを見る <span aria-hidden>→</span>
                  </Link>
                )}
              </section>
              <aside className="flex flex-[1_1_300px] flex-col gap-5">
                {toolsCard(4)}
                {gainsCard}
              </aside>
            </div>
          )}

          {tab === "entries" && (
            <section aria-labelledby="entries-title" className="max-w-[760px]">
              <h2 id="entries-title" className="mb-2 text-[22px] font-bold">
                エントリー <span className="pk-num ml-1 text-pk-ink-3">{entries.length}</span>
              </h2>
              {entryList(entries)}
            </section>
          )}

          {tab === "tools" && (
            <div className="flex flex-wrap gap-5">
              <div className="min-w-0 flex-[2_1_480px]">{toolsCard()}</div>
              <div className="flex-[1_1_300px]">{gainsCard}</div>
            </div>
          )}
        </div>
      </main>

      {/* Powered by Portkey バッジ */}
      <footer className="border-t border-pk-rule">
        <div className={`${CONTAINER} flex justify-center py-6`}>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-pk-chip px-4 text-[13px] text-pk-ink-soft hover:text-pk-ink"
          >
            <LogoMark size="xs" />
            Powered by portkey
          </Link>
        </div>
      </footer>
    </div>
  );
}
