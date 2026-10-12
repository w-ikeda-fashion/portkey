import Link from "next/link";
import Logo from "./_components/pk/Logo";
import { ButtonLink } from "./_components/pk/Button";
import ContributionGraph from "./_components/pk/ContributionGraph";
import EntryItem from "./_components/pk/EntryItem";
import { DEMO_DAYS, DEMO_ENTRIES, DEMO_STREAK, DEMO_TOOLS, DEMO_TOTAL } from "./_components/demoData";

const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 sm:px-8";
const H2 = "text-[clamp(30px,3.6vw,44px)] font-bold leading-[1.35] tracking-[-0.01em] text-pk-ink";

const STATS = [
  { num: "2,841", label: "公開ポートフォリオ" },
  { num: "18k", label: "記録されたAI活用" },
  { num: "94", label: "対応ツール" },
];

const FEATURES = [
  {
    name: "コントリビューショングラフ",
    desc: "AIを使った日を草グラフで1年分並べます。頻度と継続が、ひと目で伝わります。",
  },
  {
    name: "ツール別インサイト",
    desc: "Claude、ChatGPT、Cursor、Runwayなど94のツールを横断して、何をどれだけ使ったかをまとめます。",
  },
  {
    name: "成果インパクト記録",
    desc: "削減した工数や節約したコストをエントリーに紐付け。使った量だけでなく、得られたものを残せます。",
  },
];

const FOOTER_LINKS = ["プライバシー", "利用規約", "ドキュメント", "GitHub"];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col text-pk-ink">
      {/* ヘッダー */}
      <header className={`${CONTAINER} flex items-center justify-between gap-4 py-5`}>
        <Logo />
        <nav aria-label="メイン" className="flex items-center gap-5 text-[15px] text-pk-ink-2 sm:gap-7">
          <Link href="#features" className="hidden hover:text-pk-ink md:inline">機能</Link>
          <Link href="/@demo" className="hidden hover:text-pk-ink md:inline">デモを見る</Link>
          <Link href="/auth" className="hover:text-pk-ink">ログイン</Link>
          <ButtonLink href="/auth" variant="dark" size="sm">無料で始める</ButtonLink>
        </nav>
      </header>

      <main className="flex-1">
        {/* ヒーロー */}
        <section className={`${CONTAINER} pb-20 pt-14 sm:pt-20`}>
          <p className="mb-6 font-display text-[14px] font-semibold tracking-[0.02em] text-pk-ink-2">
            <span aria-hidden className="mr-2 inline-block size-2 rounded-full bg-pk-accent align-middle" />
            v0.9 — Public beta
          </p>
          <h1 className="max-w-[14em] break-keep text-[clamp(40px,6vw,80px)] font-bold leading-[1.2] tracking-[-0.02em]">
            AIと<wbr />積み重ねた<wbr />日々を、<wbr />
            <span className="text-pk-accent">見せられる<wbr />実績</span>に。
          </h1>
          <p className="mt-7 max-w-[34em] text-[17px] leading-[1.9] text-pk-ink-2 sm:text-[18px]">
            どのツールを、どれくらい、何のために使ったか。そして何が得られたか。
            AIとの作業を毎日の記録として残し、採用やクライアントに見せられるポートフォリオにします。
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/auth" variant="primary">無料で始める</ButtonLink>
            <ButtonLink href="/@demo" variant="secondary">デモを見る</ButtonLink>
          </div>

          <div className="mt-16">
            <ContributionGraph
              variant="hero"
              days={DEMO_DAYS}
              total={DEMO_TOTAL}
              streak={DEMO_STREAK}
              tools={DEMO_TOOLS}
            />
          </div>
        </section>

        {/* 数字 */}
        <section aria-label="Portkeyの数字" className={CONTAINER}>
          <dl className="grid grid-cols-1 border-t-[3px] border-pk-ink sm:grid-cols-3">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`py-7 sm:py-9 ${i > 0 ? "border-t border-pk-rule sm:border-t-0 sm:border-l sm:pl-8" : ""}`}
              >
                <dt className="text-[14px] text-pk-ink-2">{s.label}</dt>
                <dd className="pk-num mt-1 text-[48px] leading-none text-pk-ink sm:text-[56px]">{s.num}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 機能 */}
        <section id="features" className={`${CONTAINER} scroll-mt-8 py-24 sm:py-32`}>
          <h2 className={`${H2} break-keep`}>
            AIとの<wbr />作業を、<wbr />ちゃんと<wbr />記録に残す。
          </h2>
          <ol className="mt-12 border-t border-pk-rule">
            {FEATURES.map((f, i) => (
              <li
                key={f.name}
                className="grid gap-x-8 gap-y-2 border-b border-pk-rule py-8 md:grid-cols-[88px_minmax(0,1fr)_minmax(0,1.4fr)] md:items-baseline"
              >
                <span className="pk-num text-[28px] text-pk-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-[22px] font-bold leading-snug">{f.name}</h3>
                <p className="text-[16px] leading-[1.9] text-pk-ink-2">{f.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* プレビュー */}
        <section id="preview" className={`${CONTAINER} scroll-mt-8 pb-24 sm:pb-32`}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
            <div className="lg:sticky lg:top-10">
              <h2 className={H2}>
                使った量だけでなく、
                <br className="hidden sm:inline" />
                得られたものまで。
              </h2>
              <p className="mt-6 text-[17px] leading-[1.9] text-pk-ink-2">
                ひとつひとつのエントリーに、使ったツールと成果のインパクトを記録します。
                portkey.app/@username のURLひとつで、あなたのAI活用を伝えられます。
              </p>
              <Link
                href="/@sample"
                className="mt-8 inline-flex min-h-11 items-center gap-2 text-[16px] font-bold text-pk-ink underline decoration-pk-accent decoration-2 underline-offset-[6px] hover:text-pk-accent-deep"
              >
                公開サンプルを見る <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="rounded-3xl border border-pk-border bg-pk-surface p-6 sm:p-9">
              {DEMO_ENTRIES.map((e) => (
                <EntryItem key={e.title} {...e} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA帯 */}
        <section className="bg-pk-night text-pk-night-ink">
          <div className={`${CONTAINER} py-20 sm:py-24`}>
            <h2 className="text-[clamp(30px,3.6vw,44px)] font-bold leading-[1.35]">
              あなたのAI活用を、記録しはじめよう。
            </h2>
            <p className="mt-5 max-w-[36em] text-[17px] leading-[1.9] text-pk-night-ink-2">
              登録は無料です。今日の作業をひとつ記録するところから始められます。
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/auth" variant="night-primary">無料で始める</ButtonLink>
              <ButtonLink href="/@sample" variant="night-secondary">公開サンプルを見る</ButtonLink>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-pk-night text-pk-night-ink-2">
        <div className={CONTAINER}>
          <div className="flex flex-col gap-6 border-t border-pk-night-ink-2/20 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Logo tone="night" />
              <span className="text-[13px]">© 2026 portkey</span>
            </div>
            <nav aria-label="フッター" className="flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
              {FOOTER_LINKS.map((l) => (
                <Link key={l} href="#" className="hover:text-pk-night-ink">{l}</Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
