import { prisma } from "@/lib/prisma";
import { createOpportunity } from "@/lib/actions";
import { FormField, SubmitButton } from "@/components/FormField";
import Link from "next/link";

export const dynamic = "force-dynamic";

const phaseOptions: Record<string, string[]> = {
  IS_LEAD: ["リード登録", "架電中", "アポ取得"],
  FS_DEAL: ["初回商談", "ニーズ確認", "基本契約交渉", "契約締結", "トスアップ済"],
  SLS_PROJECT: ["提案準備", "提案済", "交渉中", "受注", "失注"],
  PERM_JOB: ["ヒアリング", "求人獲得", "紹介中", "成約", "失注"],
  ITSS_PROJECT: ["企画中", "進行中", "完了"],
  ITSS_JOB: ["ヒアリング", "求人獲得", "人選中", "稼働開始", "契約終了", "失注"],
};

export default async function NewOpportunityPage({ searchParams }: { searchParams: Promise<{ accountId?: string; parentId?: string; recordType?: string }> }) {
  const { accountId, parentId, recordType } = await searchParams;
  const [accounts, users, departments, contacts, parentOpp] = await Promise.all([
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.clientDepartment.findMany({ include: { account: true }, orderBy: { name: "asc" } }),
    prisma.contact.findMany({ include: { account: true }, orderBy: { lastName: "asc" } }),
    parentId ? prisma.opportunity.findUnique({ where: { id: parentId } }) : null,
  ]);

  const allPhases = Object.entries(phaseOptions).flatMap(([type, phases]) =>
    phases.map((p) => ({ value: `${type}::${p}`, label: `[${type}] ${p}` }))
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/opportunities" className="text-blue-600 hover:underline text-sm">&larr; 商談一覧</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">商談を新規作成</h1>
        {parentOpp && (
          <p className="text-sm text-gray-500 mb-4">親商談: {parentOpp.name}</p>
        )}
        <form action={createOpportunity} className="space-y-4">
          {parentId && <input type="hidden" name="parentOpportunityId" value={parentId} />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="商談名" name="name" required placeholder="〇〇案件" />
            <FormField label="企業" name="accountId" required defaultValue={accountId || parentOpp?.accountId} options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
            <FormField label="レコードタイプ" name="recordType" required defaultValue={recordType} options={[
              { value: "IS_LEAD", label: "IS リード" },
              { value: "FS_DEAL", label: "FS 商談" },
              { value: "SLS_PROJECT", label: "SLS 案件" },
              { value: "PERM_JOB", label: "PERM 求人" },
              { value: "ITSS_PROJECT", label: "ITSS PJ" },
              { value: "ITSS_JOB", label: "ITSS 求人" },
            ]} />
            <FormField label="フェーズ" name="phase" required options={allPhases.filter(p => !recordType || p.value.startsWith(recordType)).map(p => ({ value: p.value.split("::")[1], label: p.value.split("::")[1] }))} />
            <FormField label="事業部" name="clientDepartmentId" options={departments.map((d) => ({ value: d.id, label: `${d.account.name} / ${d.name}` }))} />
            <FormField label="コンタクト" name="contactId" options={contacts.map((c) => ({ value: c.id, label: `${c.lastName} ${c.firstName} (${c.account.name})` }))} />
            <FormField label="チャネル" name="channel" placeholder="紹介 / 広告 / 架電" />
            <FormField label="IS担当" name="isOwnerId" options={users.filter(u => u.department === "IS").map((u) => ({ value: u.id, label: u.name }))} />
            <FormField label="FS担当" name="fsOwnerId" options={users.filter(u => u.department === "FS").map((u) => ({ value: u.id, label: u.name }))} />
            <FormField label="事業部担当" name="buOwnerId" options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.department})` }))} />
            <FormField label="想定金額" name="expectedAmount" type="number" />
            <FormField label="受注予定日" name="expectedCloseDate" type="date" />
            <FormField label="パワーエイジレスURL" name="powerAgelessUrl" />
          </div>
          <FormField label="備考" name="notes" type="textarea" />
          <div className="flex items-center gap-3 pt-4">
            <SubmitButton label="作成" />
            <Link href="/opportunities" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
