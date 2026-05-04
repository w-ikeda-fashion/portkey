/**
 * Supabase のエラーを安全なユーザー向けメッセージに変換する。
 * 内部のテーブル名・カラム名・SQL文は絶対に表示しない。
 */
export function toUserMessage(error: { message?: string; code?: string } | null): string {
  if (!error) return "不明なエラーが発生しました";

  const msg = error.message ?? "";
  const code = error.code ?? "";

  // unique 制約違反
  if (code === "23505" || msg.includes("unique")) {
    if (msg.includes("username")) return "このユーザーIDはすでに使われています";
    return "すでに登録済みの値です";
  }

  // not-null 制約違反
  if (code === "23502" || msg.includes("null value")) {
    return "必須項目が入力されていません";
  }

  // check 制約違反（username_format など）
  if (code === "23514" || msg.includes("violates check constraint")) {
    return "入力値の形式が正しくありません";
  }

  // 認証エラー
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
    return "メールアドレスまたはパスワードが正しくありません";
  }
  if (msg.includes("Email not confirmed")) {
    return "メールアドレスの確認が完了していません。確認メールをご確認ください";
  }
  if (msg.includes("User already registered")) {
    return "このメールアドレスはすでに登録されています";
  }

  // 権限エラー（RLS）
  if (code === "42501" || msg.includes("permission denied") || msg.includes("row-level security")) {
    return "この操作を実行する権限がありません";
  }

  // レートリミット
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "しばらく時間をおいてから再度お試しください";
  }

  // ネットワーク・タイムアウト
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("timeout")) {
    return "通信エラーが発生しました。再度お試しください";
  }

  // デフォルト：詳細は隠してログには残す
  console.error("[Supabase error]", { code, message: msg });
  return "処理に失敗しました。しばらくしてから再度お試しください";
}
