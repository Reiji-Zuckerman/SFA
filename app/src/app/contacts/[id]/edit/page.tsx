import { prisma } from "@/lib/prisma";
import { updateContact } from "@/lib/actions";
import { FormField, SubmitButton } from "@/components/FormField";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [contact, accounts, departments] = await Promise.all([
    prisma.contact.findUnique({ where: { id } }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.clientDepartment.findMany({ include: { account: true }, orderBy: { name: "asc" } }),
  ]);
  if (!contact) return notFound();

  const updateWithId = updateContact.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/contacts" className="text-blue-600 hover:underline text-sm">&larr; 担当者一覧</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">担当者を編集</h1>
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="企業" name="accountId" required defaultValue={contact.accountId} options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
            <FormField label="事業部" name="clientDepartmentId" defaultValue={contact.clientDepartmentId} options={departments.map((d) => ({ value: d.id, label: `${d.account.name} / ${d.name}` }))} />
            <FormField label="姓" name="lastName" required defaultValue={contact.lastName} />
            <FormField label="名" name="firstName" required defaultValue={contact.firstName} />
            <FormField label="姓（カナ）" name="lastNameKana" defaultValue={contact.lastNameKana} />
            <FormField label="名（カナ）" name="firstNameKana" defaultValue={contact.firstNameKana} />
            <FormField label="部署" name="department" defaultValue={contact.department} />
            <FormField label="役職" name="title" defaultValue={contact.title} />
            <FormField label="キーマン役割" name="keyPersonRole" defaultValue={contact.keyPersonRole} options={[
              { value: "決裁者", label: "決裁者" },
              { value: "推進者", label: "推進者" },
              { value: "情報収集窓口", label: "情報収集窓口" },
            ]} />
            <FormField label="メール" name="email" type="email" defaultValue={contact.email} />
            <FormField label="電話" name="phone" type="tel" defaultValue={contact.phone} />
          </div>
          <FormField label="備考" name="notes" type="textarea" defaultValue={contact.notes} />
          <div className="flex items-center gap-3 pt-4">
            <SubmitButton label="更新" />
            <Link href="/contacts" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
