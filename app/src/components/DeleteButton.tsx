"use client";

import { useTransition } from "react";

export function DeleteButton({ action, label }: { action: () => Promise<void>; label?: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50"
      disabled={isPending}
      onClick={() => {
        if (confirm("本当に削除しますか？関連データも削除されます。")) {
          startTransition(() => action());
        }
      }}
    >
      {isPending ? "削除中..." : label || "削除"}
    </button>
  );
}
