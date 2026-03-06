import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteLead } from "@/lib/actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const phases = ["リード登録", "架電中", "アポ取得", "初回商談", "ニーズ確認", "基本契約交渉", "契約締結"];

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      account: true,
      isOwner: true,
      fsOwner: true,
      deals: {
        include: {
          owner: true,
          _count: { select: { opportunities: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!lead) return notFound();

  const currentPhaseIdx = phases.indexOf(lead.phase);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/leads" className="text-blue-600 hover:underline text-sm">&larr; リード一覧</Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{lead.name}</h1>
            <Link href={`/accounts/${lead.accountId}`} className="text-sm text-blue-600 hover:underline">
              {lead.account.name}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/leads/${id}/edit`} className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">編集</Link>
            <DeleteButton action={deleteLead.bind(null, id)} />
          </div>
        </div>

        {/* Phase Progress */}
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem label="フェーズ" value={lead.phase} />
          <InfoItem label="チャネル" value={lead.channel} />
          <InfoItem label="IS担当" value={lead.isOwner?.name} />
          <InfoItem label="FS担当" value={lead.fsOwner?.name} />
          {lead.reapproachDate && (
            <InfoItem label="再アプローチ予定日" value={new Date(lead.reapproachDate).toLocaleDateString("ja-JP")} />
          )}
          {lead.lostReason && <InfoItem label="失注理由" value={lead.lostReason} />}
        </div>
        {lead.notes && (
          <div className="mt-4">
            <p className="text-xs text-gray-500">備考</p>
            <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}
      </div>

      {/* Deals */}
      <section className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">商談 ({lead.deals.length})</h2>
          <Link href={`/deals/new?leadId=${id}&accountId=${lead.accountId}`} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ 追加</Link>
        </div>
        <div className="space-y-2">
          {lead.deals.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm border-b pb-2">
              <div className="flex items-center gap-2">
                <Link href={`/deals/${d.id}`} className="text-blue-600 hover:underline font-medium">
                  {d.name}
                </Link>
                {d.owner && (
                  <span className="text-xs text-gray-400">({d.owner.name})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">案件 {d._count.opportunities}件</span>
              </div>
            </div>
          ))}
          {lead.deals.length === 0 && (
            <p className="text-gray-500 text-sm">商談はありません</p>
          )}
        </div>
      </section>
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
