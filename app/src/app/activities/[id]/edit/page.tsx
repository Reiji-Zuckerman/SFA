import { prisma } from "@/lib/prisma";
import { updateActivity } from "@/lib/actions";
import { FormField, SubmitButton } from "@/components/FormField";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [activity, accounts, opportunities, contacts, users] = await Promise.all([
    prisma.activity.findUnique({ where: { id } }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.opportunity.findMany({ include: { account: true }, orderBy: { name: "asc" } }),
    prisma.contact.findMany({ include: { account: true }, orderBy: { lastName: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!activity) return notFound();

  const updateWithId = updateActivity.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/activities" className="text-blue-600 hover:underline text-sm">&larr; 活動履歴</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">活動を編集</h1>
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="件名" name="subject" required defaultValue={activity.subject} />
            <FormField label="活動種別" name="activityType" required defaultValue={activity.activityType} options={[
              { value: "架電", label: "架電" },
              { value: "WebMTG", label: "WebMTG" },
              { value: "往訪", label: "往訪" },
              { value: "メール", label: "メール" },
              { value: "その他", label: "その他" },
            ]} />
            <FormField label="活動日" name="activityDate" type="date" required defaultValue={new Date(activity.activityDate).toISOString().split("T")[0]} />
            <FormField label="実施者" name="actorId" required defaultValue={activity.actorId} options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.department})` }))} />
            <FormField label="企業" name="accountId" defaultValue={activity.accountId} options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
            <FormField label="商談" name="opportunityId" defaultValue={activity.opportunityId} options={opportunities.map((o) => ({ value: o.id, label: `${o.name} (${o.account.name})` }))} />
            <FormField label="コンタクト" name="contactId" defaultValue={activity.contactId} options={contacts.map((c) => ({ value: c.id, label: `${c.lastName} ${c.firstName} (${c.account.name})` }))} />
          </div>
          <FormField label="内容" name="content" type="textarea" defaultValue={activity.content} />
          <div className="flex items-center gap-3 pt-4">
            <SubmitButton label="更新" />
            <Link href="/activities" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
