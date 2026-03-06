const colorMap: Record<string, string> = {
  S: "bg-red-100 text-red-800",
  A: "bg-orange-100 text-orange-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-gray-100 text-gray-800",
  "締結済": "bg-green-100 text-green-800",
  "交渉中": "bg-yellow-100 text-yellow-800",
  "未契約": "bg-gray-100 text-gray-600",
  SLS_PROJECT: "bg-blue-100 text-blue-800",
  PERM_JOB: "bg-emerald-100 text-emerald-800",
  ITSS_PROJECT: "bg-teal-100 text-teal-800",
  ITSS_JOB: "bg-cyan-100 text-cyan-800",
  "完了": "bg-green-100 text-green-800",
  "進行中": "bg-blue-100 text-blue-800",
  "未着手": "bg-gray-100 text-gray-600",
  "高": "bg-red-100 text-red-800",
  "中": "bg-yellow-100 text-yellow-800",
  "低": "bg-gray-100 text-gray-600",
  "受注": "bg-green-100 text-green-800",
  "成約": "bg-green-100 text-green-800",
  "稼働開始": "bg-green-100 text-green-800",
  "失注": "bg-red-100 text-red-800",
  // Lead phases
  "リード登録": "bg-gray-100 text-gray-600",
  "架電中": "bg-yellow-100 text-yellow-800",
  "アポ取得": "bg-orange-100 text-orange-800",
  "初回商談": "bg-blue-100 text-blue-800",
  "ニーズ確認": "bg-indigo-100 text-indigo-800",
  "基本契約交渉": "bg-purple-100 text-purple-800",
  "契約締結": "bg-green-100 text-green-800",
};

export function Badge({ value }: { value: string | null | undefined }) {
  if (!value) return null;
  const color = colorMap[value] || "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {value}
    </span>
  );
}

export function NeedDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`} />
  );
}
