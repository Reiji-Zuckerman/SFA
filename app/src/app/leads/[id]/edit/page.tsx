import { prisma } from "@/lib/prisma";
import { updateLead } from "@/lib/actions";
import { FormField, SubmitButton } from "@/components/FormField";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const phaseOptions = ["リード登録", "架電中", "アポ取得", "初回商談", "ニーズ確認", "基本契約交渉", "契約締結"];

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lead, accounts, users] = await Promise.all([
    prisma.lead.findUnique({ where: { id } }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!lead) return notFound();

  const updateWithId = updateLead.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/leads/${id}`} className="text-blue-600 hover:underline text-sm">&larr; リード詳細</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">リードを編集</h1>
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="リード名" name="name" required defaultValue={lead.name} />
            <FormField label="企業" name="accountId" required defaultValue={lead.accountId} options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
            <FormField label="フェーズ" name="phase" required defaultValue={lead.phase} options={phaseOptions.map((p) => ({ value: p, label: p }))} />
            <FormField label="チャネル" name="channel" defaultValue={lead.channel} placeholder="展示会 / 広告 / 紹介 / HP問合せ / 自社開拓" />
            <FormField label="IS担当" name="isOwnerId" defaultValue={lead.isOwnerId} options={users.filter(u => u.department === "IS").map((u) => ({ value: u.id, label: u.name }))} />
            <FormField label="FS担当" name="fsOwnerId" defaultValue={lead.fsOwnerId} options={users.filter(u => u.department === "FS").map((u) => ({ value: u.id, label: u.name }))} />
            <FormField label="再アプローチ予定日" name="reapproachDate" type="date" defaultValue={lead.reapproachDate ? new Date(lead.reapproachDate).toISOString().split("T")[0] : null} />
            <FormField label="失注理由" name="lostReason" defaultValue={lead.lostReason} />
          </div>
          <FormField label="備考" name="notes" type="textarea" defaultValue={lead.notes} />
          <div className="flex items-center gap-3 pt-4">
            <SubmitButton label="更新" />
            <Link href={`/leads/${id}`} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
