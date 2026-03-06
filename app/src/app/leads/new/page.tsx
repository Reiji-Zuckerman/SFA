import { prisma } from "@/lib/prisma";
import { createLead } from "@/lib/actions";
import { FormField, SubmitButton } from "@/components/FormField";
import Link from "next/link";

export const dynamic = "force-dynamic";

const phaseOptions = ["リード登録", "架電中", "アポ取得", "初回商談", "ニーズ確認", "基本契約交渉", "契約締結"];

export default async function NewLeadPage({ searchParams }: { searchParams: Promise<{ accountId?: string }> }) {
  const { accountId } = await searchParams;
  const [accounts, users] = await Promise.all([
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/leads" className="text-blue-600 hover:underline text-sm">&larr; リード一覧</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">リードを新規作成</h1>
        <form action={createLead} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="リード名" name="name" required placeholder="〇〇社 新規開拓" />
            <FormField label="企業" name="accountId" required defaultValue={accountId} options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
            <FormField label="フェーズ" name="phase" required options={phaseOptions.map((p) => ({ value: p, label: p }))} />
            <FormField label="チャネル" name="channel" placeholder="展示会 / 広告 / 紹介 / HP問合せ / 自社開拓" />
            <FormField label="IS担当" name="isOwnerId" options={users.filter(u => u.department === "IS").map((u) => ({ value: u.id, label: u.name }))} />
            <FormField label="FS担当" name="fsOwnerId" options={users.filter(u => u.department === "FS").map((u) => ({ value: u.id, label: u.name }))} />
          </div>
          <FormField label="備考" name="notes" type="textarea" />
          <div className="flex items-center gap-3 pt-4">
            <SubmitButton label="作成" />
            <Link href="/leads" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
