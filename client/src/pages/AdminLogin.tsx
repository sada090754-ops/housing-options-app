import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import {
  hasAdminPasscode,
  saveAdminPasscode,
  setAdminAuthenticated,
  verifyAdminPasscode,
} from "@/lib/adminStorage";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const setupMode = useMemo(() => !hasAdminPasscode(), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedPasscode = passcode.trim();
    if (trimmedPasscode.length < 6) {
      setError("合言葉は6文字以上で入力してください。");
      return;
    }

    if (setupMode && trimmedPasscode !== confirmPasscode.trim()) {
      setError("確認用の合言葉が一致していません。");
      return;
    }

    setSubmitting(true);
    try {
      if (setupMode) {
        await saveAdminPasscode(trimmedPasscode);
        setAdminAuthenticated(true);
        navigate("/admin");
        return;
      }

      const ok = await verifyAdminPasscode(trimmedPasscode);
      if (!ok) {
        setError("合言葉が正しくありません。");
        return;
      }
      setAdminAuthenticated(true);
      navigate("/admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.004_80)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-5 inline-flex items-center gap-2 text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          お客様ページへ戻る
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gray-950 text-white px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                {setupMode ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[12px] text-white/55 font-medium">社内用</p>
                <h1 className="text-[20px] font-bold tracking-tight">
                  {setupMode ? "管理画面の初期設定" : "管理画面ログイン"}
                </h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-900">
              このログインはGitHub Pagesで動く簡易的な分離機能です。秘密情報をリポジトリに入れないため、合言葉はこのブラウザ内にハッシュ保存されます。
            </div>

            <label className="block">
              <span className="block text-[13px] font-semibold text-gray-700 mb-2">
                {setupMode ? "新しい合言葉" : "合言葉"}
              </span>
              <input
                type="password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                autoComplete={setupMode ? "new-password" : "current-password"}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all"
                placeholder="6文字以上で入力"
              />
            </label>

            {setupMode && (
              <label className="block">
                <span className="block text-[13px] font-semibold text-gray-700 mb-2">合言葉の確認</span>
                <input
                  type="password"
                  value={confirmPasscode}
                  onChange={(event) => setConfirmPasscode(event.target.value)}
                  autoComplete="new-password"
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all"
                  placeholder="同じ合言葉を再入力"
                />
              </label>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-gray-950 text-white text-[14px] font-bold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "確認中..." : setupMode ? "設定して管理画面へ" : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
