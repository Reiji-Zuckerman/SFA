import { prisma } from "@/lib/prisma";
import { createAccount } from "@/lib/actions";
import { FormField, SubmitButton } from "@/components/FormField";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewAccountPage() {
  const users = await prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/accounts" className="text-blue-600 hover:underline text-sm">&larr; 企業一覧</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">企業を新規作成</h1>
        <form action={createAccount} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="企業名" name="name" required placeholder="株式会社○○" />
            <FormField label="企業名（カナ）" name="nameKana" placeholder="カブシキガイシャ○○" />
            <FormField label="業種" name="industry" placeholder="IT・通信" />
            <FormField label="企業属性" name="companyType" options={[
              { value: "事業会社", label: "事業会社" },
              { value: "SIer", label: "SIer" },
              { value: "コンサルファーム", label: "コンサルファーム" },
              { value: "その他", label: "その他" },
            ]} />
            <FormField label="Tier" name="tier" options={[
              { value: "S", label: "S" }, { value: "A", label: "A" },
              { value: "B", label: "B" }, { value: "C", label: "C" },
            ]} />
            <FormField label="契約ステータス" name="contractStatus" options={[
              { value: "未契約", label: "未契約" },
              { value: "交渉中", label: "交渉中" },
              { value: "締結済", label: "締結済" },
            ]} />
            <FormField label="メインオーナー" name="mainOwnerId" options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.department})` }))} />
            <FormField label="従業員数" name="employeeCount" type="number" />
            <FormField label="年間売上" name="annualRevenue" placeholder="100億円" />
            <FormField label="所在地" name="address" placeholder="東京都渋谷区..." />
            <FormField label="URL" name="url" placeholder="https://..." />
          </div>
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="slsNeed" className="h-4 w-4" /> SLS ニーズ</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="permNeed" className="h-4 w-4" /> PERM ニーズ</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="itssNeed" className="h-4 w-4" /> ITSS ニーズ</label>
          </div>
          <FormField label="備考" name="notes" type="textarea" />
          <div className="flex items-center gap-3 pt-4">
            <SubmitButton label="作成" />
            <Link href="/accounts" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
