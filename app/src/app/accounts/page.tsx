import { prisma } from "@/lib/prisma";
import { Badge, NeedDot } from "@/components/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    include: {
      mainOwner: true,
      _count: { select: { opportunities: true, contacts: true, clientDepartments: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">企業一覧</h1>
        <span className="text-sm text-gray-500">{accounts.length}件</span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b text-left text-gray-500">
              <th className="py-3 px-4">企業名</th>
              <th className="py-3 px-4">業種</th>
              <th className="py-3 px-4">属性</th>
              <th className="py-3 px-4">Tier</th>
              <th className="py-3 px-4">契約</th>
              <th className="py-3 px-4 text-center">SLS</th>
              <th className="py-3 px-4 text-center">PERM</th>
              <th className="py-3 px-4 text-center">ITSS</th>
              <th className="py-3 px-4">担当者数</th>
              <th className="py-3 px-4">商談数</th>
              <th className="py-3 px-4">メインオーナー</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <Link href={`/accounts/${a.id}`} className="text-blue-600 hover:underline font-medium">
                    {a.name}
                  </Link>
                </td>
                <td className="py-3 px-4">{a.industry || "-"}</td>
                <td className="py-3 px-4">{a.companyType || "-"}</td>
                <td className="py-3 px-4"><Badge value={a.tier} /></td>
                <td className="py-3 px-4"><Badge value={a.contractStatus} /></td>
                <td className="py-3 px-4 text-center"><NeedDot active={a.slsNeed} /></td>
                <td className="py-3 px-4 text-center"><NeedDot active={a.permNeed} /></td>
                <td className="py-3 px-4 text-center"><NeedDot active={a.itssNeed} /></td>
                <td className="py-3 px-4 text-center">{a._count.contacts}</td>
                <td className="py-3 px-4 text-center">{a._count.opportunities}</td>
                <td className="py-3 px-4 text-gray-500">{a.mainOwner?.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
