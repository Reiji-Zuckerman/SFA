import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const activities = await prisma.activity.findMany({
    include: {
      account: true,
      contact: true,
      opportunity: true,
      actor: true,
    },
    orderBy: { activityDate: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">活動履歴</h1>
        <span className="text-sm text-gray-500">{activities.length}件</span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y">
          {activities.map((a) => (
            <div key={a.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm text-gray-400 w-24 shrink-0">
                  {new Date(a.activityDate).toLocaleDateString("ja-JP")}
                </span>
                <Badge value={a.activityType} />
                <span className="font-medium text-sm">{a.subject}</span>
                <span className="ml-auto text-xs text-gray-500">{a.actor.name}</span>
              </div>
              <div className="flex items-center gap-3 ml-24 text-xs text-gray-500">
                {a.account && (
                  <Link href={`/accounts/${a.account.id}`} className="text-blue-600 hover:underline">
                    {a.account.name}
                  </Link>
                )}
                {a.opportunity && (
                  <>
                    <span>/</span>
                    <Link href={`/opportunities/${a.opportunity.id}`} className="text-blue-600 hover:underline">
                      {a.opportunity.name}
                    </Link>
                  </>
                )}
                {a.contact && (
                  <>
                    <span>/</span>
                    <span>{a.contact.lastName} {a.contact.firstName}</span>
                  </>
                )}
              </div>
              {a.content && (
                <p className="ml-24 mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">{a.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
