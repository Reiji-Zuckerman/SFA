import { prisma } from "@/lib/prisma";
import { Badge, NeedDot } from "@/components/Badge";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      mainOwner: true,
      contacts: { include: { clientDepartment: true } },
      clientDepartments: {
        include: {
          primaryContact: true,
          opportunities: { include: { buOwner: true } },
        },
      },
      opportunities: {
        include: {
          isOwner: true,
          fsOwner: true,
          buOwner: true,
          parentOpportunity: true,
          childOpportunities: true,
          tasks: { include: { owner: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      activities: {
        include: { actor: true, contact: true, opportunity: true },
        orderBy: { activityDate: "desc" },
      },
    },
  });

  if (!account) return notFound();

  const rootOpps = account.opportunities.filter((o) => !o.parentOpportunityId);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/accounts" className="text-blue-600 hover:underline text-sm">&larr; 企業一覧</Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{account.name}</h1>
            {account.nameKana && <p className="text-sm text-gray-400 mb-3">{account.nameKana}</p>}
          </div>
          <Badge value={account.contractStatus} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <InfoItem label="業種" value={account.industry} />
          <InfoItem label="企業属性" value={account.companyType} />
          <InfoItem label="Tier" value={account.tier} />
          <InfoItem label="従業員数" value={account.employeeCount ? `${account.employeeCount}名` : null} />
          <InfoItem label="年間売上" value={account.annualRevenue} />
          <InfoItem label="所在地" value={account.address} />
          <InfoItem label="メインオーナー" value={account.mainOwner?.name} />
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <NeedDot active={account.slsNeed} />
            <span className="text-sm">SLS</span>
          </div>
          <div className="flex items-center gap-2">
            <NeedDot active={account.permNeed} />
            <span className="text-sm">PERM</span>
          </div>
          <div className="flex items-center gap-2">
            <NeedDot active={account.itssNeed} />
            <span className="text-sm">ITSS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts */}
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-bold text-lg mb-4">担当者 ({account.contacts.length})</h2>
          <div className="space-y-3">
            {account.contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b pb-2 text-sm">
                <div>
                  <span className="font-medium">{c.lastName} {c.firstName}</span>
                  {c.department && <span className="ml-2 text-gray-500">{c.department}</span>}
                  {c.title && <span className="ml-1 text-gray-400">/ {c.title}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge value={c.keyPersonRole} />
                  {c.clientDepartment && (
                    <span className="text-xs text-gray-400">{c.clientDepartment.name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Client Departments */}
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-bold text-lg mb-4">事業部 ({account.clientDepartments.length})</h2>
          <div className="space-y-3">
            {account.clientDepartments.map((d) => (
              <div key={d.id} className="border-b pb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{d.name}</span>
                  {d.primaryContact && (
                    <span className="text-gray-500">キーマン: {d.primaryContact.lastName} {d.primaryContact.firstName}</span>
                  )}
                </div>
                {d.opportunities.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {d.opportunities.map((o) => (
                      <Link key={o.id} href={`/opportunities/${o.id}`} className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded">
                        {o.name} ({o.phase})
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {account.clientDepartments.length === 0 && (
              <p className="text-gray-500 text-sm">事業部は未登録です</p>
            )}
          </div>
        </section>
      </div>

      {/* Opportunities Tree */}
      <section className="bg-white rounded-lg shadow p-5 mt-6">
        <h2 className="font-bold text-lg mb-4">商談 ({account.opportunities.length})</h2>
        <div className="space-y-3">
          {rootOpps.map((o) => (
            <OpportunityTree key={o.id} opp={o} allOpps={account.opportunities} depth={0} />
          ))}
          {rootOpps.length === 0 && (
            <p className="text-gray-500 text-sm">商談はありません</p>
          )}
        </div>
      </section>

      {/* Activities */}
      <section className="bg-white rounded-lg shadow p-5 mt-6">
        <h2 className="font-bold text-lg mb-4">活動履歴 ({account.activities.length})</h2>
        <div className="space-y-2">
          {account.activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3 text-sm border-b pb-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(a.activityDate).toLocaleDateString("ja-JP")}
              </span>
              <Badge value={a.activityType} />
              <div className="flex-1">
                <span className="font-medium">{a.subject}</span>
                {a.content && <p className="text-gray-500 mt-0.5 text-xs">{a.content}</p>}
              </div>
              <span className="text-xs text-gray-500">{a.actor.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

type OppWithRelations = {
  id: string;
  parentOpportunityId: string | null;
  name: string;
  recordType: string;
  phase: string;
  expectedAmount: number | null;
  isOwner: { name: string } | null;
  fsOwner: { name: string } | null;
  buOwner: { name: string } | null;
  tasks: { id: string; name: string; status: string; owner: { name: string }; dueDate: Date | null }[];
};

function OpportunityTree({ opp, allOpps, depth }: { opp: OppWithRelations; allOpps: OppWithRelations[]; depth: number }) {
  const children = allOpps.filter((o) => o.parentOpportunityId === opp.id);
  const owner = opp.buOwner || opp.fsOwner || opp.isOwner;

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-gray-200 pl-4" : ""}>
      <div className="flex items-center justify-between text-sm py-1">
        <div className="flex items-center gap-2">
          <Badge value={opp.recordType} />
          <Link href={`/opportunities/${opp.id}`} className="text-blue-600 hover:underline font-medium">
            {opp.name}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Badge value={opp.phase} />
          {opp.expectedAmount && (
            <span className="text-xs text-gray-500">¥{opp.expectedAmount.toLocaleString()}</span>
          )}
          {owner && <span className="text-xs text-gray-400">{owner.name}</span>}
        </div>
      </div>
      {opp.tasks.length > 0 && (
        <div className="ml-4 space-y-1 mb-2">
          {opp.tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-xs text-gray-600">
              <span>{t.status === "完了" ? "✓" : "□"}</span>
              <span>{t.name}</span>
              <Badge value={t.status} />
              {t.dueDate && <span className="text-gray-400">{new Date(t.dueDate).toLocaleDateString("ja-JP")}</span>}
              <span className="text-gray-400">{t.owner.name}</span>
            </div>
          ))}
        </div>
      )}
      {children.map((child) => (
        <OpportunityTree key={child.id} opp={child} allOpps={allOpps} depth={depth + 1} />
      ))}
    </div>
  );
}
