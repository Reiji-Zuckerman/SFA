import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteDeal } from "@/lib/actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      lead: true,
      account: true,
      owner: true,
      opportunities: {
        include: {
          buOwner: true,
          contact: true,
          clientDepartment: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!deal) return notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/deals" className="text-blue-600 hover:underline text-sm">&larr; 商談一覧</Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{deal.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Link href={`/accounts/${deal.accountId}`} className="text-blue-600 hover:underline">
                {deal.account.name}
              </Link>
              <span>
                リード: <Link href={`/leads/${deal.leadId}`} className="text-blue-600 hover:underline">{deal.lead.name}</Link>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/deals/${id}/edit`} className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">編集</Link>
            <DeleteButton action={deleteDeal.bind(null, id)} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem label="担当者" value={deal.owner?.name} />
          <InfoItem label="商談内容" value={deal.content} />
        </div>
        {deal.notes && (
          <div className="mt-4">
            <p className="text-xs text-gray-500">備考</p>
            <p className="text-sm whitespace-pre-wrap">{deal.notes}</p>
          </div>
        )}
      </div>

      {/* Opportunities */}
      <section className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">案件 ({deal.opportunities.length})</h2>
          <Link href={`/opportunities/new?dealId=${id}&accountId=${deal.accountId}`} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ 追加</Link>
        </div>
        <div className="space-y-2">
          {deal.opportunities.map((o) => (
            <div key={o.id} className="flex items-center justify-between text-sm border-b pb-2">
              <div className="flex items-center gap-2">
                <Badge value={o.recordType} />
                <Link href={`/opportunities/${o.id}`} className="text-blue-600 hover:underline font-medium">
                  {o.name}
                </Link>
                {o.clientDepartment && (
                  <span className="text-xs text-gray-400">{o.clientDepartment.name}</span>
                )}
                {o.contact && (
                  <span className="text-xs text-gray-400">({o.contact.lastName} {o.contact.firstName})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge value={o.phase} />
                {o.expectedAmount && (
                  <span className="text-xs text-gray-500">¥{o.expectedAmount.toLocaleString()}</span>
                )}
                <span className="text-xs text-gray-500">{o.buOwner?.name || "-"}</span>
              </div>
            </div>
          ))}
          {deal.opportunities.length === 0 && (
            <p className="text-gray-500 text-sm">案件はありません</p>
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
