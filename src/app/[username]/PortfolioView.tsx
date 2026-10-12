import Link from "next/link";
import ShareButtons from "./ShareButtons";
import ViewTracker from "./ViewTracker";
import Logo, { LogoMark } from "../_components/pk/Logo";
import { ButtonLink } from "../_components/pk/Button";
import { Chip, ToolChip } from "../_components/pk/Chip";
import ContributionGraph from "../_components/pk/ContributionGraph";
import EntryItem from "../_components/pk/EntryItem";
import { buildCalendar, streaks, toJstDate } from "../_components/pk/calendar";
import { toolColor, toToolShares } from "../_components/pk/tools";

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
const SECTION_TITLE = "text-[24px] font-bold leading-snug text-pk-ink";

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
  const toolShares = toToolShares(toolCounts);
  const topTools = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]);
  const totalToolUses = topTools.reduce((sum, [, c]) => sum + c, 0);
  const outcomes = entries.filter((a) => a.outcome);

  const summary = [
    { label: "AI活用回数", value: totalToolUses.toLocaleString("ja-JP"), unit: "回" },
    { label: "最長連続記録", value: String(longest), unit: "日" },
    { label: "プロジェクト数", value: entries.length.toLocaleString("ja-JP"), unit: "件" },
    // 金額の構造化データは未実装。アウトカム軸が入るまでは「—」を出す
    { label: "推定削減額", value: "—", unit: "", warm: true },
  ];

  const tabHref = (key: TabKey) => (key === "overview" ? `/${username}` : `/${username}?tab=${key}`);

  const entryList = (list: Achievement[]) =>
    list.length === 0 ? (
      <p className="text-[15px] text-pk-ink-2">まだ公開されている実績はありません。</p>
    ) : (
      <div>
        {list.map((a) => (
          <EntryItem
            key={a.id}
            date={toJstDate(a.created_at).replaceAll("-", ".")}
            title={a.title}
            description={a.description}
            tools={a.ai_tools ?? []}
            tags={[a.category && (CATEGORY_LABEL[a.category] ?? a.category), a.domain].filter(
              (t): t is string => Boolean(t)
            )}
            impact={a.outcome}
            link={
              a.url && (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[13px] font-bold text-pk-ink underline decoration-pk-accent underline-offset-4"
                >
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
            s.warm ? "border-transparent bg-pk-surface-warm" : "border-pk-border bg-pk-surface"
          }`}
        >
          <p className={`text-[13px] font-bold ${s.warm ? "text-pk-accent-deep" : "text-pk-ink-2"}`}>{s.label}</p>
          <p className={`mt-2 leading-none ${s.warm ? "text-pk-accent-deep" : "text-pk-ink"}`}>
            <span className="pk-num text-[40px] sm:text-[48px]">{s.value}</span>
            {s.unit && <span className="ml-1 text-[15px] font-bold">{s.unit}</span>}
          </p>
        </div>
      ))}
    </section>
  );

  const graph = (
    <section aria-labelledby="activity-title">
      <h2 id="activity-title" className={`${SECTION_TITLE} mb-5`}>この1年の活動</h2>
      <ContributionGraph days={calendar} total={yearTotal} streak={current} tools={toolShares} />
    </section>
  );

  const toolsCard = (limit?: number) => {
    const list = limit ? topTools.slice(0, limit) : topTools;
    const max = list[0]?.[1] ?? 0;
    return (
      <section aria-labelledby="tools-title" className="rounded-3xl border border-pk-border bg-pk-surface p-6 sm:p-8">
        <h2 id="tools-title" className="text-[18px] font-bold">よく使うツール</h2>
        {list.length === 0 ? (
          <p className="mt-4 text-[15px] text-pk-ink-2">まだ記録がありません。</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-4">
            {list.map(([name, count]) => (
              <li key={name}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px]">
                  <span className="inline-flex items-center gap-2 font-bold text-pk-ink">
                    <span aria-hidden className="size-2 rounded-[2px]" style={{ background: toolColor(name) }} />
                    {name}
                  </span>
                  <span className="font-display text-pk-ink-3">{count}回</span>
                </div>
                <div aria-hidden className="h-2.5 overflow-hidden rounded-full bg-pk-g0">
                  <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: toolColor(name) }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  };

  const gainsCard = (
    <section aria-labelledby="gains-title" className="rounded-3xl bg-pk-night p-6 text-pk-night-ink sm:p-8">
      <h2 id="gains-title" className="text-[18px] font-bold">AIで得られたもの</h2>
      <dl className="mt-5 divide-y divide-pk-night-ink-2/20">
        {[
          { label: "削減した工数", value: "—" },
          { label: "節約したコスト", value: "—" },
        ].map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 py-3.5">
            <dt className="text-[14px] text-pk-night-ink-2">{row.label}</dt>
            <dd className="pk-num text-[24px]">{row.value}</dd>
          </div>
        ))}
        <div className="py-3.5">
          <dt className="text-[14px] text-pk-night-ink-2">新しくできたこと</dt>
          <dd className="mt-2 text-[15px] leading-[1.8]">
            {outcomes.length === 0 ? (
              <span className="pk-num text-[24px]">—</span>
            ) : (
              <>
                <span className="line-clamp-3">{outcomes[0].outcome}</span>
                {outcomes.length > 1 && (
                  <span className="mt-1 block text-[13px] text-pk-night-ink-2">ほか {outcomes.length - 1}件の成果</span>
                )}
              </>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );

  return (
    <div className="flex min-h-screen flex-col text-pk-ink">
      <ViewTracker username={username} />

      {/* ヘッダー */}
      <header className={`${CONTAINER} flex items-center justify-between gap-3 py-5`}>
        <Logo />
        <ButtonLink href="/auth" variant="secondary" size="sm">
          <span>
            <span className="hidden sm:inline">自分の</span>ポートフォリオを作る
          </span>
        </ButtonLink>
      </header>

      <main className={`${CONTAINER} flex-1 pb-20`}>
        {/* プロフィール */}
        <section className="flex flex-col gap-6 pt-8 sm:pt-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={displayName}
                className="size-28 shrink-0 rounded-[32px] object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="flex size-28 shrink-0 items-center justify-center rounded-[32px] bg-pk-accent font-display text-[48px] font-bold text-pk-on-accent"
              >
                {displayName[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] break-words sm:text-[40px]">
                {displayName}
              </h1>
              <p className="mt-1.5 text-[15px] text-pk-ink-2">
                <span className="font-display">@{username}</span>
                {domains.length > 0 && <> · {domains.join(" / ")}</>}
              </p>
              {user.bio && <p className="mt-3 max-w-[36em] text-[16px] leading-[1.9] text-pk-ink-2">{user.bio}</p>}
              {(profileTools.length > 0 || domains.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profileTools.map((t) => <ToolChip key={t} name={t} />)}
                  {domains.map((d) => <Chip key={d}>{d}</Chip>)}
                </div>
              )}
            </div>
          </div>
          {/* シェア — #31 #42 */}
          <ShareButtons url={pageUrl} name={displayName} />
        </section>

        {/* タブ */}
        <nav aria-label="ポートフォリオ" className="mt-10 overflow-x-auto border-b border-pk-rule">
          <ul className="flex gap-1">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <li key={t.key}>
                  <Link
                    href={tabHref(t.key)}
                    aria-current={active ? "page" : undefined}
                    className={`-mb-px inline-flex min-h-12 items-center whitespace-nowrap border-b-[3px] px-4 text-[15px] font-bold ${
                      active ? "border-pk-accent text-pk-ink" : "border-transparent text-pk-ink-2 hover:text-pk-ink"
                    }`}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-10 flex flex-col gap-14">
          {tab === "overview" && (
            <>
              {summaryCards}
              {graph}
              <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
                <section aria-labelledby="recent-title">
                  <h2 id="recent-title" className={`${SECTION_TITLE} mb-6`}>最近のエントリー</h2>
                  {entryList(entries.slice(0, 3))}
                  {entries.length > 3 && (
                    <Link
                      href={tabHref("entries")}
                      className="mt-6 inline-flex min-h-11 items-center gap-2 text-[15px] font-bold text-pk-ink underline decoration-pk-accent decoration-2 underline-offset-[6px] hover:text-pk-accent-deep"
                    >
                      すべてのエントリーを見る <span aria-hidden>→</span>
                    </Link>
                  )}
                </section>
                <div className="flex flex-col gap-5">
                  {toolsCard(5)}
                  {gainsCard}
                </div>
              </div>
            </>
          )}

          {tab === "entries" && (
            <section aria-labelledby="entries-title" className="max-w-[760px]">
              <h2 id="entries-title" className={`${SECTION_TITLE} mb-6`}>
                エントリー <span className="pk-num ml-1 text-pk-ink-3">{entries.length}</span>
              </h2>
              {entryList(entries)}
            </section>
          )}

          {tab === "tools" && (
            <div className="grid gap-5 lg:grid-cols-2">
              {toolsCard()}
              {gainsCard}
            </div>
          )}

          {tab === "stats" && (
            <>
              {summaryCards}
              {graph}
            </>
          )}
        </div>
      </main>

      {/* Powered by Portkey バッジ */}
      <footer className={CONTAINER}>
        <div className="flex flex-col items-center gap-4 border-t border-pk-rule py-12 text-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-pk-border bg-pk-surface px-5 text-[14px] text-pk-ink-2 hover:border-pk-rule hover:text-pk-ink"
          >
            <LogoMark size="sm" />
            Powered by <span className="font-display font-bold text-pk-ink">portkey</span>
          </Link>
          <p className="text-[14px] text-pk-ink-2">
            あなたもAI活用の実績を記録して、見せられる形にしませんか？{" "}
            <Link href="/auth" className="font-bold text-pk-ink underline decoration-pk-accent underline-offset-4">
              無料で始める <span aria-hidden>→</span>
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
