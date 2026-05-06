import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          Portkey
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="transition-colors hover:opacity-80">
            ダッシュボード
          </Link>
          <Link href="/dashboard/report" className="transition-colors hover:opacity-80">
            レポート
          </Link>
          <Link href="/dashboard/insights" className="transition-colors hover:opacity-80">
            ツール分析
          </Link>
          <Link href="/dashboard/profile" className="transition-colors hover:opacity-80">
            プロフィール
          </Link>
          <Link href="/dashboard/sessions" className="transition-colors hover:opacity-80">
            セッション
          </Link>
          <Link href="/dashboard/settings/billing" className="transition-colors hover:opacity-80">
            プラン
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs px-3 py-1.5 rounded-md border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              ログアウト
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
