import { prisma } from "@/lib/prisma";
import { Badge, NeedDot } from "@/components/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [accounts, leads, deals, opportunities, tasks, activities] = await Promise.all([
    prisma.account.findMany({ include: { mainOwner: true } }),
    prisma.lead.findMany({
      include: { account: true, isOwner: true, fsOwner: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.deal.findMany({
      include: { account: true, owner: true, _count: { select: { opportunities: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.opportunity.findMany({
      include: { account: true, buOwner: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      include: { opportunity: { include: { account: true } }, owner: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.activity.findMany({
      include: { account: true, actor: true, opportunity: true },
      orderBy: { activityDate: "desc" },
      take: 10,
    }),
  ]);

  const slsProjects = opportunities.filter((o) => o.recordType === "SLS_PROJECT");
  const permJobs = opportunities.filter((o) => o.recordType === "PERM_JOB");
  const itssProjects = opportunities.filter((o) => o.recordType === "ITSS_PROJECT");
  const itssJobs = opportunities.filter((o) => o.recordType === "ITSS_JOB");

  const activeTasks = tasks.filter((t) => t.status !== "完了");
  const reapproachOpps = opportunities.filter((o) => o.reapproachDate);

  const slsTotal = slsProjects.reduce((sum, o) => sum + (o.expectedAmount || 0), 0);
  const slsWon = slsProjects.filter((o) => o.phase === "受注").reduce((sum, o) => sum + (o.expectedAmount || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="リード数" value={leads.length} sub="件" />
        <KPICard label="商談数" value={deals.length} sub="件" />
        <KPICard label="SLS パイプライン" value={`¥${(slsTotal / 10000).toLocaleString()}万`} sub={`受注: ¥${(slsWon / 10000).toLocaleString()}万`} />
        <KPICard label="PERM/ITSS 求人" value={permJobs.length + itssJobs.length} sub="件" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline */}
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-bold text-lg mb-4">全社パイプライン</h2>
          <div className="space-y-3">
            <PipelineRow label="リード" items={leads} />
            <PipelineRow label="SLS 案件" items={slsProjects} />
            <PipelineRow label="PERM 求人" items={permJobs} />
            <PipelineRow label="ITSS PJ" items={itssProjects} />
            <PipelineRow label="ITSS 求人" items={itssJobs} />
          </div>
        </section>

        {/* Tasks */}
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-bold text-lg mb-4">未完了タスク</h2>
          {activeTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">未完了タスクはありません</p>
          ) : (
            <div className="space-y-2">
              {activeTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div>
                    <Link href={`/opportunities/${t.opportunityId}`} className="text-blue-600 hover:underline">
                      {t.opportunity.account.name}
                    </Link>
                    <span className="mx-1 text-gray-400">/</span>
                    <span>{t.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge value={t.status} />
                    <Badge value={t.priority} />
                    {t.dueDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(t.dueDate).toLocaleDateString("ja-JP")}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{t.owner.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activities */}
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-bold text-lg mb-4">直近の活動</h2>
          <div className="space-y-2">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm border-b pb-2">
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(a.activityDate).toLocaleDateString("ja-JP")}
                </span>
                <Badge value={a.activityType} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{a.account?.name}</span>
                  <span className="mx-1 text-gray-400">-</span>
                  <span>{a.subject}</span>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{a.actor.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Re-approach */}
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-bold text-lg mb-4">再アプローチ予定</h2>
          {reapproachOpps.length === 0 ? (
            <p className="text-gray-500 text-sm">再アプローチ予定はありません</p>
          ) : (
            <div className="space-y-2">
              {reapproachOpps.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div>
                    <Link href={`/opportunities/${o.id}`} className="text-blue-600 hover:underline">
                      {o.account.name} - {o.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge value={o.phase} />
                    <span className="text-xs text-gray-500">
                      {o.reapproachDate && new Date(o.reapproachDate).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Account Overview */}
      <section className="bg-white rounded-lg shadow p-5 mt-6">
        <h2 className="font-bold text-lg mb-4">企業ニーズ一覧</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 px-3">企業名</th>
                <th className="py-2 px-3">業種</th>
                <th className="py-2 px-3">Tier</th>
                <th className="py-2 px-3">契約</th>
                <th className="py-2 px-3 text-center">SLS</th>
                <th className="py-2 px-3 text-center">PERM</th>
                <th className="py-2 px-3 text-center">ITSS</th>
                <th className="py-2 px-3">担当</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <Link href={`/accounts/${a.id}`} className="text-blue-600 hover:underline font-medium">
                      {a.name}
                    </Link>
                  </td>
                  <td className="py-2 px-3">{a.industry}</td>
                  <td className="py-2 px-3"><Badge value={a.tier} /></td>
                  <td className="py-2 px-3"><Badge value={a.contractStatus} /></td>
                  <td className="py-2 px-3 text-center"><NeedDot active={a.slsNeed} /></td>
                  <td className="py-2 px-3 text-center"><NeedDot active={a.permNeed} /></td>
                  <td className="py-2 px-3 text-center"><NeedDot active={a.itssNeed} /></td>
                  <td className="py-2 px-3 text-gray-500">{a.mainOwner?.name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KPICard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function PipelineRow({ label, items }: { label: string; items: { phase: string }[] }) {
  const phases = items.reduce((acc, o) => {
    acc[o.phase] = (acc[o.phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium w-24 shrink-0">{label}</span>
      <div className="flex-1 flex flex-wrap gap-1.5">
        {Object.entries(phases).map(([phase, count]) => (
          <span key={phase} className="inline-flex items-center gap-1 text-xs bg-gray-100 rounded px-2 py-1">
            {phase} <span className="font-bold">{count}</span>
          </span>
        ))}
      </div>
      <span className="text-sm font-bold text-gray-600">{items.length}件</span>
    </div>
  );
}
