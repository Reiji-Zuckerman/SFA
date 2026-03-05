import { prisma } from "@/lib/prisma";
import { createContact } from "@/lib/actions";
import { FormField, SubmitButton } from "@/components/FormField";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewContactPage({ searchParams }: { searchParams: Promise<{ accountId?: string }> }) {
  const { accountId } = await searchParams;
  const [accounts, departments] = await Promise.all([
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.clientDepartment.findMany({ include: { account: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/contacts" className="text-blue-600 hover:underline text-sm">&larr; 担当者一覧</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">担当者を新規作成</h1>
        <form action={createContact} className="space-y-4">
          {accountId && <input type="hidden" name="returnTo" value={`/accounts/${accountId}`} />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="企業" name="accountId" required defaultValue={accountId} options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
            <FormField label="事業部" name="clientDepartmentId" options={departments.map((d) => ({ value: d.id, label: `${d.account.name} / ${d.name}` }))} />
            <FormField label="姓" name="lastName" required placeholder="山田" />
            <FormField label="名" name="firstName" required placeholder="太郎" />
            <FormField label="姓（カナ）" name="lastNameKana" placeholder="ヤマダ" />
            <FormField label="名（カナ）" name="firstNameKana" placeholder="タロウ" />
            <FormField label="部署" name="department" placeholder="人事部" />
            <FormField label="役職" name="title" placeholder="部長" />
            <FormField label="キーマン役割" name="keyPersonRole" options={[
              { value: "決裁者", label: "決裁者" },
              { value: "推進者", label: "推進者" },
              { value: "情報収集窓口", label: "情報収集窓口" },
            ]} />
            <FormField label="メール" name="email" type="email" />
            <FormField label="電話" name="phone" type="tel" />
          </div>
          <FormField label="備考" name="notes" type="textarea" />
          <div className="flex items-center gap-3 pt-4">
            <SubmitButton label="作成" />
            <Link href="/contacts" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
