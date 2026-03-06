import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: {
      account: true,
      isOwner: true,
      fsOwner: true,
      _count: { select: { deals: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">リード一覧</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{leads.length}件</span>
          <Link href="/leads/new" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">+ 新規作成</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b text-left text-gray-500">
              <th className="py-3 px-4">リード名</th>
              <th className="py-3 px-4">企業</th>
              <th className="py-3 px-4">フェーズ</th>
              <th className="py-3 px-4">チャネル</th>
              <th className="py-3 px-4">IS担当</th>
              <th className="py-3 px-4">FS担当</th>
              <th className="py-3 px-4">商談数</th>
              <th className="py-3 px-4">更新日</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <Link href={`/leads/${l.id}`} className="text-blue-600 hover:underline font-medium">
                    {l.name}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <Link href={`/accounts/${l.accountId}`} className="text-blue-600 hover:underline">
                    {l.account.name}
                  </Link>
                </td>
                <td className="py-3 px-4"><Badge value={l.phase} /></td>
                <td className="py-3 px-4 text-gray-500">{l.channel || "-"}</td>
                <td className="py-3 px-4 text-gray-500">{l.isOwner?.name || "-"}</td>
                <td className="py-3 px-4 text-gray-500">{l.fsOwner?.name || "-"}</td>
                <td className="py-3 px-4 text-gray-500">{l._count.deals}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">
                  {new Date(l.updatedAt).toLocaleDateString("ja-JP")}
                </td>
                <td className="py-3 px-4">
                  <Link href={`/leads/${l.id}/edit`} className="text-blue-600 hover:underline text-xs">編集</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <p className="text-gray-500 text-sm p-6 text-center">リードはありません</p>
        )}
      </div>
    </div>
  );
}
