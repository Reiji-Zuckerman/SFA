import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: {
      opportunity: { include: { account: true } },
      owner: true,
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const statusOrder = ["進行中", "未着手", "完了"];
  const sorted = [...tasks].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">タスク一覧</h1>
        <span className="text-sm text-gray-500">{tasks.length}件</span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b text-left text-gray-500">
              <th className="py-3 px-4 w-8"></th>
              <th className="py-3 px-4">タスク名</th>
              <th className="py-3 px-4">商談</th>
              <th className="py-3 px-4">企業</th>
              <th className="py-3 px-4">ステータス</th>
              <th className="py-3 px-4">優先度</th>
              <th className="py-3 px-4">期限</th>
              <th className="py-3 px-4">担当</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.id} className={`border-b hover:bg-gray-50 ${t.status === "完了" ? "opacity-50" : ""}`}>
                <td className="py-3 px-4 text-center">
                  <span className={t.status === "完了" ? "text-green-600" : "text-gray-300"}>
                    {t.status === "完了" ? "✓" : "□"}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">
                  <span className={t.status === "完了" ? "line-through" : ""}>{t.name}</span>
                </td>
                <td className="py-3 px-4">
                  <Link href={`/opportunities/${t.opportunityId}`} className="text-blue-600 hover:underline">
                    {t.opportunity.name}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <Link href={`/accounts/${t.opportunity.accountId}`} className="text-blue-600 hover:underline">
                    {t.opportunity.account.name}
                  </Link>
                </td>
                <td className="py-3 px-4"><Badge value={t.status} /></td>
                <td className="py-3 px-4"><Badge value={t.priority} /></td>
                <td className="py-3 px-4">
                  {t.dueDate ? (
                    <span className={new Date(t.dueDate) < new Date() && t.status !== "完了" ? "text-red-600 font-medium" : ""}>
                      {new Date(t.dueDate).toLocaleDateString("ja-JP")}
                    </span>
                  ) : "-"}
                </td>
                <td className="py-3 px-4 text-gray-500">{t.owner.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
