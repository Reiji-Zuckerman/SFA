import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    include: { account: true, clientDepartment: true },
    orderBy: [{ accountId: "asc" }, { lastName: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">担当者一覧</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{contacts.length}件</span>
          <Link href="/contacts/new" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">+ 新規作成</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b text-left text-gray-500">
              <th className="py-3 px-4">氏名</th>
              <th className="py-3 px-4">企業</th>
              <th className="py-3 px-4">部署</th>
              <th className="py-3 px-4">役職</th>
              <th className="py-3 px-4">キーマン役割</th>
              <th className="py-3 px-4">事業部</th>
              <th className="py-3 px-4">メール</th>
              <th className="py-3 px-4">電話</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{c.lastName} {c.firstName}</td>
                <td className="py-3 px-4">
                  <Link href={`/accounts/${c.accountId}`} className="text-blue-600 hover:underline">
                    {c.account.name}
                  </Link>
                </td>
                <td className="py-3 px-4">{c.department || "-"}</td>
                <td className="py-3 px-4">{c.title || "-"}</td>
                <td className="py-3 px-4"><Badge value={c.keyPersonRole} /></td>
                <td className="py-3 px-4 text-gray-500">{c.clientDepartment?.name || "-"}</td>
                <td className="py-3 px-4 text-gray-500">{c.email || "-"}</td>
                <td className="py-3 px-4 text-gray-500">{c.phone || "-"}</td>
                <td className="py-3 px-4">
                  <Link href={`/contacts/${c.id}/edit`} className="text-blue-600 hover:underline text-xs">編集</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
