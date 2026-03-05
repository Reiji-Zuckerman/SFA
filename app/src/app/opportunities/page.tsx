import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const recordTypeLabels: Record<string, string> = {
  IS_LEAD: "IS リード",
  FS_DEAL: "FS 商談",
  SLS_PROJECT: "SLS 案件",
  PERM_JOB: "PERM 求人",
  ITSS_PROJECT: "ITSS PJ",
  ITSS_JOB: "ITSS 求人",
};

export default async function OpportunitiesPage() {
  const opportunities = await prisma.opportunity.findMany({
    include: {
      account: true,
      isOwner: true,
      fsOwner: true,
      buOwner: true,
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
        <h1 className="text-2xl font-bold">商談一覧</h1>
        <span className="text-sm text-gray-500">{opportunities.length}件</span>
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
                  <th className="py-3 px-4">商談名</th>
                  <th className="py-3 px-4">企業</th>
                  <th className="py-3 px-4">フェーズ</th>
                  <th className="py-3 px-4">金額</th>
                  <th className="py-3 px-4">担当</th>
                  <th className="py-3 px-4">子商談</th>
                </tr>
              </thead>
              <tbody>
                {opps.map((o) => {
                  const owner = o.buOwner || o.fsOwner || o.isOwner;
                  return (
                    <tr key={o.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Link href={`/opportunities/${o.id}`} className="text-blue-600 hover:underline font-medium">
                          {o.name}
                        </Link>
                        {o.parentOpportunity && (
                          <span className="text-xs text-gray-400 ml-1">
                            (親: {o.parentOpportunity.name})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/accounts/${o.accountId}`} className="text-blue-600 hover:underline">
                          {o.account.name}
                        </Link>
                        {o.clientDepartment && (
                          <span className="text-xs text-gray-400 ml-1">{o.clientDepartment.name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4"><Badge value={o.phase} /></td>
                      <td className="py-3 px-4">
                        {o.expectedAmount ? `¥${o.expectedAmount.toLocaleString()}` : "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{owner?.name || "-"}</td>
                      <td className="py-3 px-4 text-center">
                        {o._count.childOpportunities > 0 && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{o._count.childOpportunities}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
