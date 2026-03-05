import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const phaseFlows: Record<string, string[]> = {
  IS_LEAD: ["リード登録", "架電中", "アポ取得"],
  FS_DEAL: ["初回商談", "ニーズ確認", "基本契約交渉", "契約締結", "トスアップ済"],
  SLS_PROJECT: ["提案準備", "提案済", "交渉中", "受注", "失注"],
  PERM_JOB: ["ヒアリング", "求人獲得", "紹介中", "成約", "失注"],
  ITSS_PROJECT: ["企画中", "進行中", "完了"],
  ITSS_JOB: ["ヒアリング", "求人獲得", "人選中", "稼働開始", "契約終了", "失注"],
};

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const opp = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      account: true,
      contact: true,
      clientDepartment: true,
      isOwner: true,
      fsOwner: true,
      buOwner: true,
      parentOpportunity: true,
      childOpportunities: {
        include: { buOwner: true, clientDepartment: true },
      },
      tasks: { include: { owner: true }, orderBy: { dueDate: "asc" } },
      activities: {
        include: { actor: true, contact: true },
        orderBy: { activityDate: "desc" },
      },
    },
  });

  if (!opp) return notFound();

  const phases = phaseFlows[opp.recordType] || [];
  const currentPhaseIdx = phases.indexOf(opp.phase);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/opportunities" className="text-blue-600 hover:underline text-sm">&larr; 商談一覧</Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge value={opp.recordType} />
              <h1 className="text-2xl font-bold">{opp.name}</h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Link href={`/accounts/${opp.accountId}`} className="text-blue-600 hover:underline">
                {opp.account.name}
              </Link>
              {opp.clientDepartment && <span>/ {opp.clientDepartment.name}</span>}
              {opp.parentOpportunity && (
                <span>
                  (元商談: <Link href={`/opportunities/${opp.parentOpportunity.id}`} className="text-blue-600 hover:underline">{opp.parentOpportunity.name}</Link>)
                </span>
              )}
            </div>
          </div>
          {opp.powerAgelessUrl && (
            <a href={opp.powerAgelessUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">
              パワーエイジレス &rarr;
            </a>
          )}
        </div>

        {/* Phase Progress */}
        {phases.length > 0 && (
          <div className="flex items-center gap-1 mb-4">
            {phases.map((p, i) => (
              <div key={p} className="flex items-center">
                <div className={`px-3 py-1 rounded text-xs font-medium ${
                  i === currentPhaseIdx
                    ? "bg-blue-600 text-white"
                    : i < currentPhaseIdx
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {p}
                </div>
                {i < phases.length - 1 && <span className="text-gray-300 mx-0.5">&rarr;</span>}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem label="フェーズ" value={opp.phase} />
          <InfoItem label="チャネル" value={opp.channel} />
          <InfoItem label="想定金額" value={opp.expectedAmount ? `¥${opp.expectedAmount.toLocaleString()}` : null} />
          <InfoItem label="受注予定日" value={opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString("ja-JP") : null} />
          <InfoItem label="IS担当" value={opp.isOwner?.name} />
          <InfoItem label="FS担当" value={opp.fsOwner?.name} />
          <InfoItem label="事業部担当" value={opp.buOwner?.name} />
          <InfoItem label="コンタクト" value={opp.contact ? `${opp.contact.lastName} ${opp.contact.firstName}` : null} />
          {opp.reapproachDate && (
            <InfoItem label="再アプローチ予定日" value={new Date(opp.reapproachDate).toLocaleDateString("ja-JP")} />
          )}
          {opp.lostReason && <InfoItem label="失注理由" value={opp.lostReason} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Child Opportunities */}
        {opp.childOpportunities.length > 0 && (
          <section className="bg-white rounded-lg shadow p-5">
            <h2 className="font-bold text-lg mb-4">子商談 ({opp.childOpportunities.length})</h2>
            <div className="space-y-2">
              {opp.childOpportunities.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Badge value={c.recordType} />
                    <Link href={`/opportunities/${c.id}`} className="text-blue-600 hover:underline">
                      {c.name}
                    </Link>
                    {c.clientDepartment && (
                      <span className="text-xs text-gray-400">{c.clientDepartment.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge value={c.phase} />
                    <span className="text-xs text-gray-500">{c.buOwner?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tasks */}
        {(opp.tasks.length > 0 || opp.recordType === "SLS_PROJECT") && (
          <section className="bg-white rounded-lg shadow p-5">
            <h2 className="font-bold text-lg mb-4">タスク ({opp.tasks.length})</h2>
            <div className="space-y-2">
              {opp.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className={t.status === "完了" ? "text-green-600" : "text-gray-400"}>
                      {t.status === "完了" ? "✓" : "□"}
                    </span>
                    <span className={t.status === "完了" ? "line-through text-gray-400" : ""}>{t.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge value={t.status} />
                    <Badge value={t.priority} />
                    {t.dueDate && (
                      <span className="text-xs text-gray-500">{new Date(t.dueDate).toLocaleDateString("ja-JP")}</span>
                    )}
                    <span className="text-xs text-gray-500">{t.owner.name}</span>
                  </div>
                </div>
              ))}
              {opp.tasks.length === 0 && (
                <p className="text-gray-500 text-sm">タスクはありません</p>
              )}
            </div>
          </section>
        )}

        {/* Activities */}
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-bold text-lg mb-4">活動履歴 ({opp.activities.length})</h2>
          <div className="space-y-2">
            {opp.activities.map((a) => (
              <div key={a.id} className="border-b pb-2 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">
                    {new Date(a.activityDate).toLocaleDateString("ja-JP")}
                  </span>
                  <Badge value={a.activityType} />
                  <span className="font-medium">{a.subject}</span>
                  <span className="text-xs text-gray-500 ml-auto">{a.actor.name}</span>
                </div>
                {a.content && <p className="text-gray-500 text-xs ml-4">{a.content}</p>}
              </div>
            ))}
            {opp.activities.length === 0 && (
              <p className="text-gray-500 text-sm">活動履歴はありません</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}
