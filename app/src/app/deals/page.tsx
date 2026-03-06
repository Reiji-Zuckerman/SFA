import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const deals = await prisma.deal.findMany({
    include: {
      lead: true,
      account: true,
      owner: true,
      _count: { select: { opportunities: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商談一覧</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{deals.length}件</span>
          <Link href="/deals/new" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">+ 新規作成</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b text-left text-gray-500">
              <th className="py-3 px-4">商談名</th>
              <th className="py-3 px-4">企業</th>
              <th className="py-3 px-4">リード</th>
              <th className="py-3 px-4">担当者</th>
              <th className="py-3 px-4">案件数</th>
              <th className="py-3 px-4">更新日</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <Link href={`/deals/${d.id}`} className="text-blue-600 hover:underline font-medium">
                    {d.name}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <Link href={`/accounts/${d.accountId}`} className="text-blue-600 hover:underline">
                    {d.account.name}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <Link href={`/leads/${d.leadId}`} className="text-blue-600 hover:underline">
                    {d.lead.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-gray-500">{d.owner?.name || "-"}</td>
                <td className="py-3 px-4 text-gray-500">{d._count.opportunities}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">
                  {new Date(d.updatedAt).toLocaleDateString("ja-JP")}
                </td>
                <td className="py-3 px-4">
                  <Link href={`/deals/${d.id}/edit`} className="text-blue-600 hover:underline text-xs">編集</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {deals.length === 0 && (
          <p className="text-gray-500 text-sm p-6 text-center">商談はありません</p>
        )}
      </div>
    </div>
  );
}
