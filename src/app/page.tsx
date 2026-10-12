import Link from "next/link";
import Logo from "./_components/pk/Logo";
import { ButtonLink, TEXT_LINK } from "./_components/pk/Button";
import ContributionGraph from "./_components/pk/ContributionGraph";
import EntryItem from "./_components/pk/EntryItem";
import { DEMO_DAYS, DEMO_ENTRIES, DEMO_STREAK, DEMO_TOOLS, DEMO_TOTAL } from "./_components/demoData";

const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 sm:px-8";
const H2 = "text-[clamp(30px,3.6vw,44px)] font-bold leading-[1.35] tracking-[-0.01em] text-pk-ink break-keep";

const STATS = [
  { num: "2,841", label: "公開ポートフォリオ" },
  { num: "18k", label: "記録されたAI活用" },
  { num: "94", label: "対応ツール" },
];

const FEATURES = [
  {
    name: "コントリビューショングラフ",
    desc: "日々のAI活用の頻度と継続を、ひと目でわかるグラフに。続けてきたこと自体が、あなたの実績になります。",
  },
  {
    name: "ツール別インサイト",
    desc: "Claude・ChatGPT・Cursor・Runwayなど94のツールを横断して、どれを何に使っているかを分析します。",
  },
  {
    name: "成果インパクト記録",
    desc: "工数削減や収益貢献など、得られた成果をエントリーに紐付けて残します。「使った量」だけでなく「得たもの」まで。",
  },
];

const FOOTER_LINKS = ["プライバシー", "利用規約", "ドキュメント", "GitHub"];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col text-pk-ink">
      {/* ヘッダー */}
      <header className={`${CONTAINER} flex flex-wrap items-center justify-between gap-4 py-5 sm:py-7`}>
        <Logo />
        <nav aria-label="メイン" className="flex items-center gap-5 text-[15px] text-pk-ink-soft sm:gap-7">
          <Link href="#features" className="hidden hover:text-pk-ink md:inline">機能</Link>
          <Link href="#preview" className="hidden hover:text-pk-ink md:inline">デモを見る</Link>
          <Link href="/auth" className="hover:text-pk-ink">ログイン</Link>
          <ButtonLink href="/auth" variant="dark">無料で始める</ButtonLink>
        </nav>
      </header>

      <main className="flex-1">
        {/* ヒーロー */}
        <section className={`${CONTAINER} pb-8 pt-12 sm:pt-[72px]`}>
          <p className="mb-7 font-display text-[14px] tracking-[0.06em] text-pk-ink-3">v0.9 — Public beta</p>
          <h1 className="break-keep text-[clamp(40px,6vw,80px)] font-bold leading-[1.2] tracking-[-0.02em]">
            AIと<wbr />積み重ねた<wbr />日々を、
            <br />
            <span className="text-pk-accent">見せられる<wbr />実績</span>に。
          </h1>
          <p className="mt-8 max-w-[560px] text-[17px] leading-[1.9] text-pk-ink-2 sm:text-[18px]">
            どのツールを、何に使い、何が得られたか。
            <br />
            AIとの作業履歴を記録して、ポートフォリオとして共有できます。エンジニアにも、非エンジニアにも。
          </p>
          <div className="mt-10 flex flex-wrap gap-3.5">
            <ButtonLink href="/auth" variant="primary" size="lg">無料で始める</ButtonLink>
            <ButtonLink href="#preview" variant="secondary" size="lg">デモを見る</ButtonLink>
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
        <section aria-label="数字で見るPortkey" className={`${CONTAINER} py-14`}>
          <dl className="grid grid-cols-1 border-t-[1.5px] border-pk-ink sm:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col-reverse pr-6 pt-7">
                <dt className="mt-1 text-[15px] text-pk-ink-2">{s.label}</dt>
                <dd className="pk-num text-[48px] leading-tight sm:text-[56px]">{s.num}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 機能 */}
        <section id="features" className={`${CONTAINER} scroll-mt-8 py-16`}>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <h2 className={H2}>
              AIとの作業を、
              <br />
              ちゃんと<wbr />記録に残す。
            </h2>
            <p className="max-w-[380px] text-[16px] leading-[1.9] text-pk-ink-2">
              コミットログと同じ感覚で、AIとの作業履歴を記録し、公開できます。
            </p>
          </div>
          <ol>
            {FEATURES.map((f, i) => (
              <li
                key={f.name}
                className="flex flex-wrap gap-x-10 gap-y-4 border-t border-pk-rule py-8 last:border-b"
              >
                <span className="pk-num flex-[0_0_72px] text-[20px] text-pk-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="flex-[1_1_260px] text-[22px] font-bold leading-snug">{f.name}</h3>
                <p className="flex-[2_1_380px] text-[16px] leading-[1.9] text-pk-ink-2">{f.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* プレビュー */}
        <section id="preview" className={`${CONTAINER} flex scroll-mt-8 flex-wrap gap-12 pb-24 pt-16`}>
          <div className="flex-[1_1_300px]">
            <p className="mb-4 text-[14px] text-pk-ink-3">公開ポートフォリオ</p>
            <h2 className="break-keep text-[clamp(28px,3vw,38px)] font-bold leading-[1.4]">
              採用担当にも、
              <br />
              クライアントにも。
            </h2>
            <p className="mb-7 mt-5 text-[16px] leading-[1.9] text-pk-ink-2">
              portkey.app/@username で、あなたのAI活用の記録をそのままシェアできます。
            </p>
            <Link href="/@sample" className={`${TEXT_LINK} text-[16px]`}>
              公開サンプルを見る <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="min-w-0 flex-[2_1_560px] rounded-3xl border border-pk-border bg-pk-surface px-5 py-2 sm:px-8">
            {DEMO_ENTRIES.map((e) => (
              <EntryItem key={e.title} layout="card" {...e} />
            ))}
          </div>
        </section>

        {/* CTA帯 */}
        <section className="bg-pk-night text-pk-night-ink">
          <div className={`${CONTAINER} flex flex-wrap items-end justify-between gap-10 py-20 sm:py-24`}>
            <div className="flex-[1_1_520px]">
              <h2 className="break-keep text-[clamp(30px,4vw,52px)] font-bold leading-[1.3] tracking-[-0.01em]">
                あなたのAI活用を、
                <br />
                記録しはじめよう。
              </h2>
              <p className="mt-6 max-w-[520px] text-[16px] leading-[1.9] text-pk-night-ink-2">
                GitHubのプロフィールと同じように、AIを使いこなしてきた証拠を残せるポートフォリオを。
              </p>
            </div>
            <div className="flex flex-wrap gap-3.5">
              <ButtonLink href="/auth" variant="night-primary" size="lg">無料アカウントを作成</ButtonLink>
              <ButtonLink href="/@sample" variant="night-secondary" size="lg">公開サンプルを見る</ButtonLink>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t border-pk-night-rule bg-pk-night text-pk-night-ink-3">
        <div className={`${CONTAINER} flex flex-wrap justify-between gap-4 py-7 text-[14px]`}>
          <span className="font-display">portkey © 2026</span>
          <nav aria-label="フッター" className="flex flex-wrap gap-6">
            {FOOTER_LINKS.map((l) => (
              <Link key={l} href="#" className="text-pk-night-ink-2 hover:text-pk-night-ink">{l}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
