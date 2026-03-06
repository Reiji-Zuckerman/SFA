import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const recordTypeLabels: Record<string, string> = {
  SLS_PROJECT: "SLS 案件",
  PERM_JOB: "PERM 求人",
  ITSS_PROJECT: "ITSS PJ",
  ITSS_JOB: "ITSS 求人",
};

export default async function OpportunitiesPage() {
  const opportunities = await prisma.opportunity.findMany({
    include: {
      account: true,
      deal: true,
      buOwner: true,
      contact: true,
      clientDepartment: true,
      parentOpportunity: true,
      _count: { select: { childOpportunities: true, tasks: true, activities: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const grouped = Object.entries(
    opportunities.reduce((acc, o) => {
      (acc[o.recordType] = acc[o.recordType] || []).push(o);
      return acc;
    }, {} as Record<string, typeof opportunities>)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">案件一覧</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{opportunities.length}件</span>
          <Link href="/opportunities/new" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">+ 新規作成</Link>
        </div>
      </div>

      {grouped.map(([type, opps]) => (
        <section key={type} className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Badge value={type} />
            <span>{recordTypeLabels[type] || type}</span>
            <span className="text-sm text-gray-400 font-normal">({opps.length}件)</span>
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b text-left text-gray-500">
                  <th className="py-3 px-4">案件名</th>
                  <th className="py-3 px-4">企業</th>
                  <th className="py-3 px-4">担当者</th>
                  <th className="py-3 px-4">事業部</th>
                  <th className="py-3 px-4">フェーズ</th>
                  <th className="py-3 px-4">金額</th>
                  <th className="py-3 px-4">BU担当</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {opps.map((o) => (
                  <tr key={o.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link href={`/opportunities/${o.id}`} className="text-blue-600 hover:underline font-medium">
                        {o.name}
                      </Link>
                      {o.deal && (
                        <span className="text-xs text-gray-400 ml-1">
                          (商談: {o.deal.name})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/accounts/${o.accountId}`} className="text-blue-600 hover:underline">
                        {o.account.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {o.contact ? (
                        <Link href={`/contacts/${o.contact.id}`} className="text-blue-600 hover:underline">
                          {o.contact.lastName} {o.contact.firstName}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {o.clientDepartment ? (
                        <span className="text-sm">{o.clientDepartment.name}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4"><Badge value={o.phase} /></td>
                    <td className="py-3 px-4">
                      {o.expectedAmount ? `¥${o.expectedAmount.toLocaleString()}` : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{o.buOwner?.name || "-"}</td>
                    <td className="py-3 px-4">
                      <Link href={`/opportunities/${o.id}/edit`} className="text-blue-600 hover:underline text-xs">編集</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
