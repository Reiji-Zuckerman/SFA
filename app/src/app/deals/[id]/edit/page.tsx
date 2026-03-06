import { prisma } from "@/lib/prisma";
import { updateDeal } from "@/lib/actions";
import { FormField, SubmitButton } from "@/components/FormField";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [deal, leads, accounts, users] = await Promise.all([
    prisma.deal.findUnique({ where: { id } }),
    prisma.lead.findMany({ include: { account: true }, orderBy: { name: "asc" } }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!deal) return notFound();

  const updateWithId = updateDeal.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/deals/${id}`} className="text-blue-600 hover:underline text-sm">&larr; 商談詳細</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">商談を編集</h1>
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="商談名" name="name" required defaultValue={deal.name} />
            <FormField label="リード" name="leadId" required defaultValue={deal.leadId} options={leads.map((l) => ({ value: l.id, label: `${l.name} (${l.account.name})` }))} />
            <FormField label="企業" name="accountId" required defaultValue={deal.accountId} options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
            <FormField label="担当者" name="ownerId" defaultValue={deal.ownerId} options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.department})` }))} />
            <FormField label="商談内容" name="content" defaultValue={deal.content} />
          </div>
          <FormField label="備考" name="notes" type="textarea" defaultValue={deal.notes} />
          <div className="flex items-center gap-3 pt-4">
            <SubmitButton label="更新" />
            <Link href={`/deals/${id}`} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
