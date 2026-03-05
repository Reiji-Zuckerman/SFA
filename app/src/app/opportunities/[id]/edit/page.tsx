import { prisma } from "@/lib/prisma";
import { updateOpportunity } from "@/lib/actions";
import { FormField, SubmitButton } from "@/components/FormField";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const phaseOptions: Record<string, string[]> = {
  IS_LEAD: ["リード登録", "架電中", "アポ取得"],
  FS_DEAL: ["初回商談", "ニーズ確認", "基本契約交渉", "契約締結", "トスアップ済"],
  SLS_PROJECT: ["提案準備", "提案済", "交渉中", "受注", "失注"],
  PERM_JOB: ["ヒアリング", "求人獲得", "紹介中", "成約", "失注"],
  ITSS_PROJECT: ["企画中", "進行中", "完了"],
  ITSS_JOB: ["ヒアリング", "求人獲得", "人選中", "稼働開始", "契約終了", "失注"],
};

export default async function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [opp, accounts, users, departments, contacts] = await Promise.all([
    prisma.opportunity.findUnique({ where: { id } }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.clientDepartment.findMany({ include: { account: true }, orderBy: { name: "asc" } }),
    prisma.contact.findMany({ include: { account: true }, orderBy: { lastName: "asc" } }),
  ]);
  if (!opp) return notFound();

  const updateWithId = updateOpportunity.bind(null, id);
  const phases = phaseOptions[opp.recordType] || [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/opportunities/${id}`} className="text-blue-600 hover:underline text-sm">&larr; 商談詳細</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">商談を編集</h1>
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="商談名" name="name" required defaultValue={opp.name} />
            <FormField label="企業" name="accountId" required defaultValue={opp.accountId} options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
            <FormField label="レコードタイプ" name="recordType" required defaultValue={opp.recordType} options={[
              { value: "IS_LEAD", label: "IS リード" },
              { value: "FS_DEAL", label: "FS 商談" },
              { value: "SLS_PROJECT", label: "SLS 案件" },
              { value: "PERM_JOB", label: "PERM 求人" },
              { value: "ITSS_PROJECT", label: "ITSS PJ" },
              { value: "ITSS_JOB", label: "ITSS 求人" },
            ]} />
            <FormField label="フェーズ" name="phase" required defaultValue={opp.phase} options={phases.map((p) => ({ value: p, label: p }))} />
            <FormField label="事業部" name="clientDepartmentId" defaultValue={opp.clientDepartmentId} options={departments.map((d) => ({ value: d.id, label: `${d.account.name} / ${d.name}` }))} />
            <FormField label="コンタクト" name="contactId" defaultValue={opp.contactId} options={contacts.map((c) => ({ value: c.id, label: `${c.lastName} ${c.firstName} (${c.account.name})` }))} />
            <FormField label="チャネル" name="channel" defaultValue={opp.channel} />
            <FormField label="IS担当" name="isOwnerId" defaultValue={opp.isOwnerId} options={users.filter(u => u.department === "IS").map((u) => ({ value: u.id, label: u.name }))} />
            <FormField label="FS担当" name="fsOwnerId" defaultValue={opp.fsOwnerId} options={users.filter(u => u.department === "FS").map((u) => ({ value: u.id, label: u.name }))} />
            <FormField label="事業部担当" name="buOwnerId" defaultValue={opp.buOwnerId} options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.department})` }))} />
            <FormField label="想定金額" name="expectedAmount" type="number" defaultValue={opp.expectedAmount} />
            <FormField label="受注予定日" name="expectedCloseDate" type="date" defaultValue={opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toISOString().split("T")[0] : null} />
            <FormField label="再アプローチ予定日" name="reapproachDate" type="date" defaultValue={opp.reapproachDate ? new Date(opp.reapproachDate).toISOString().split("T")[0] : null} />
            <FormField label="失注理由" name="lostReason" defaultValue={opp.lostReason} />
            <FormField label="パワーエイジレスURL" name="powerAgelessUrl" defaultValue={opp.powerAgelessUrl} />
          </div>
          <FormField label="備考" name="notes" type="textarea" defaultValue={opp.notes} />
          <div className="flex items-center gap-3 pt-4">
            <SubmitButton label="更新" />
            <Link href={`/opportunities/${id}`} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
