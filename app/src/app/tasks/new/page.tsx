import { prisma } from "@/lib/prisma";
import { createTask } from "@/lib/actions";
import { FormField, SubmitButton } from "@/components/FormField";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewTaskPage({ searchParams }: { searchParams: Promise<{ opportunityId?: string }> }) {
  const { opportunityId } = await searchParams;
  const [opportunities, users] = await Promise.all([
    prisma.opportunity.findMany({ include: { account: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tasks" className="text-blue-600 hover:underline text-sm">&larr; タスク一覧</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">タスクを新規作成</h1>
        <form action={createTask} className="space-y-4">
          {opportunityId && <input type="hidden" name="returnTo" value={`/opportunities/${opportunityId}`} />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="タスク名" name="name" required placeholder="提案書作成" />
            <FormField label="商談" name="opportunityId" required defaultValue={opportunityId} options={opportunities.map((o) => ({ value: o.id, label: `${o.name} (${o.account.name})` }))} />
            <FormField label="担当者" name="ownerId" required options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.department})` }))} />
            <FormField label="ステータス" name="status" defaultValue="未着手" options={[
              { value: "未着手", label: "未着手" },
              { value: "進行中", label: "進行中" },
              { value: "完了", label: "完了" },
            ]} />
            <FormField label="優先度" name="priority" options={[
              { value: "高", label: "高" },
              { value: "中", label: "中" },
              { value: "低", label: "低" },
            ]} />
            <FormField label="期限" name="dueDate" type="date" />
          </div>
          <FormField label="説明" name="description" type="textarea" />
          <FormField label="備考" name="notes" type="textarea" />
          <div className="flex items-center gap-3 pt-4">
            <SubmitButton label="作成" />
            <Link href="/tasks" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
