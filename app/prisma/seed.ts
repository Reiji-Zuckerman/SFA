import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import BetterSqlite3 from "better-sqlite3";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

// Create tables from migration SQL if DB doesn't have them yet
const dbPath = join(process.cwd(), "dev.db");
const isNew = !existsSync(dbPath);
const sqliteDb = new BetterSqlite3(dbPath);
if (isNew) {
  const migrationDir = join(process.cwd(), "prisma/migrations");
  const migrations = readdirSync(migrationDir)
    .filter((d) => !d.startsWith(".") && d !== "migration_lock.toml")
    .sort();
  for (const migration of migrations) {
    const sqlPath = join(migrationDir, migration, "migration.sql");
    if (existsSync(sqlPath)) {
      sqliteDb.exec(readFileSync(sqlPath, "utf-8"));
    }
  }
  console.log("Database tables created.");
}
sqliteDb.close();

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Users
  const yamada = await prisma.user.create({
    data: { id: "u1", name: "山田太郎", email: "yamada@example.com", department: "SLS", role: "MEMBER" },
  });
  const suzuki = await prisma.user.create({
    data: { id: "u2", name: "鈴木一郎", email: "suzuki@example.com", department: "IS", role: "MEMBER" },
  });
  const sato = await prisma.user.create({
    data: { id: "u3", name: "佐藤花子", email: "sato@example.com", department: "FS", role: "MEMBER" },
  });
  const takahashi = await prisma.user.create({
    data: { id: "u4", name: "高橋健一", email: "takahashi@example.com", department: "ITSS", role: "MEMBER" },
  });
  const tanaka = await prisma.user.create({
    data: { id: "u5", name: "田中美咲", email: "tanaka@example.com", department: "PERM", role: "MEMBER" },
  });
  const watanabe = await prisma.user.create({
    data: { id: "u6", name: "渡辺部長", email: "watanabe@example.com", department: "MGMT", role: "MANAGER" },
  });
  const ito = await prisma.user.create({
    data: { id: "u7", name: "伊藤社長", email: "ito@example.com", department: "MGMT", role: "VIEWER" },
  });

  // Accounts
  const acc1 = await prisma.account.create({
    data: {
      id: "a1", name: "株式会社テックイノベーション", nameKana: "カブシキガイシャテックイノベーション",
      industry: "IT", companyType: "事業会社", tier: "S", contractStatus: "締結済",
      mainOwnerId: yamada.id, slsNeed: true, permNeed: true, itssNeed: false,
      address: "東京都渋谷区神宮前1-2-3", employeeCount: 500, annualRevenue: "100億円",
    },
  });
  const acc2 = await prisma.account.create({
    data: {
      id: "a2", name: "グローバル商事株式会社", nameKana: "グローバルショウジカブシキガイシャ",
      industry: "商社", companyType: "事業会社", tier: "A", contractStatus: "交渉中",
      mainOwnerId: sato.id, slsNeed: false, permNeed: true, itssNeed: true,
      address: "東京都千代田区丸の内1-1-1", employeeCount: 2000, annualRevenue: "500億円",
    },
  });
  const acc3 = await prisma.account.create({
    data: {
      id: "a3", name: "フューチャーシステムズ株式会社", nameKana: "フューチャーシステムズカブシキガイシャ",
      industry: "IT", companyType: "SIer", tier: "B", contractStatus: "未契約",
      mainOwnerId: suzuki.id, slsNeed: true, permNeed: false, itssNeed: false,
      address: "東京都港区六本木3-4-5", employeeCount: 300, annualRevenue: "50億円",
    },
  });
  const acc4 = await prisma.account.create({
    data: {
      id: "a4", name: "サクラコンサルティング株式会社", nameKana: "サクラコンサルティングカブシキガイシャ",
      industry: "コンサルティング", companyType: "コンサルファーム", tier: "A", contractStatus: "締結済",
      mainOwnerId: yamada.id, slsNeed: true, permNeed: true, itssNeed: true,
      address: "東京都中央区銀座5-6-7", employeeCount: 800, annualRevenue: "200億円",
    },
  });
  const acc5 = await prisma.account.create({
    data: {
      id: "a5", name: "ネクストウェーブ株式会社", nameKana: "ネクストウェーブカブシキガイシャ",
      industry: "製造", companyType: "メーカー", tier: "C", contractStatus: "未契約",
      mainOwnerId: null, slsNeed: false, permNeed: false, itssNeed: false,
      address: "大阪府大阪市北区梅田1-2-3", employeeCount: 150, annualRevenue: "30億円",
    },
  });

  // Contacts
  const ct1 = await prisma.contact.create({
    data: { id: "c1", accountId: acc1.id, lastName: "田中", firstName: "部長", department: "開発部", title: "部長", keyPersonRole: "決裁者", email: "tanaka-b@techinno.co.jp", phone: "03-1234-5678" },
  });
  const ct2 = await prisma.contact.create({
    data: { id: "c2", accountId: acc1.id, lastName: "鈴木", firstName: "課長", department: "インフラ部", title: "課長", keyPersonRole: "推進者", email: "suzuki-k@techinno.co.jp", phone: "03-1234-5679" },
  });
  const ct3 = await prisma.contact.create({
    data: { id: "c3", accountId: acc2.id, lastName: "佐藤", firstName: "室長", department: "DX推進室", title: "室長", keyPersonRole: "決裁者", email: "sato-s@global-shoji.co.jp", phone: "03-2345-6789" },
  });
  const ct4 = await prisma.contact.create({
    data: { id: "c4", accountId: acc2.id, lastName: "山本", firstName: "主任", department: "情報システム部", title: "主任", keyPersonRole: "情報収集窓口", email: "yamamoto@global-shoji.co.jp", phone: "03-2345-6790" },
  });
  const ct5 = await prisma.contact.create({
    data: { id: "c5", accountId: acc3.id, lastName: "中村", firstName: "取締役", department: "経営企画", title: "取締役", keyPersonRole: "決裁者", email: "nakamura@future-sys.co.jp", phone: "03-3456-7890" },
  });
  const ct6 = await prisma.contact.create({
    data: { id: "c6", accountId: acc4.id, lastName: "小林", firstName: "マネージャー", department: "戦略コンサル部", title: "マネージャー", keyPersonRole: "推進者", email: "kobayashi@sakura-con.co.jp", phone: "03-4567-8901" },
  });
  const ct7 = await prisma.contact.create({
    data: { id: "c7", accountId: acc5.id, lastName: "加藤", firstName: "課長", department: "製造部", title: "課長", keyPersonRole: "情報収集窓口", email: "kato@nextwave.co.jp", phone: "06-1234-5678" },
  });

  // ClientDepartments
  const dept1 = await prisma.clientDepartment.create({
    data: { id: "d1", accountId: acc1.id, name: "開発部", primaryContactId: ct1.id },
  });
  const dept2 = await prisma.clientDepartment.create({
    data: { id: "d2", accountId: acc1.id, name: "インフラ部", primaryContactId: ct2.id },
  });
  const dept3 = await prisma.clientDepartment.create({
    data: { id: "d3", accountId: acc2.id, name: "DX推進室", primaryContactId: ct3.id },
  });
  const dept4 = await prisma.clientDepartment.create({
    data: { id: "d4", accountId: acc4.id, name: "戦略コンサル部", primaryContactId: ct6.id },
  });

  // Leads (旧 IS_LEAD/FS_DEAL → Lead に統合)
  const lead1 = await prisma.lead.create({
    data: {
      id: "l1", accountId: acc1.id, name: "テックイノベーション 新規開拓",
      phase: "契約締結", channel: "展示会",
      isOwnerId: suzuki.id, fsOwnerId: sato.id,
      createdAt: new Date("2026-01-15"),
    },
  });
  const lead2 = await prisma.lead.create({
    data: {
      id: "l2", accountId: acc2.id, name: "グローバル商事 新規開拓",
      phase: "基本契約交渉", channel: "紹介",
      isOwnerId: suzuki.id, fsOwnerId: sato.id,
      createdAt: new Date("2026-02-01"),
    },
  });
  const lead3 = await prisma.lead.create({
    data: {
      id: "l3", accountId: acc3.id, name: "フューチャーシステムズ 新規リード",
      phase: "架電中", channel: "広告",
      isOwnerId: suzuki.id,
    },
  });
  const lead4 = await prisma.lead.create({
    data: {
      id: "l4", accountId: acc5.id, name: "ネクストウェーブ 展示会リード",
      phase: "リード登録", channel: "展示会",
      isOwnerId: suzuki.id,
    },
  });

  // Deals (商談)
  const deal1 = await prisma.deal.create({
    data: {
      id: "deal1", leadId: lead1.id, accountId: acc1.id,
      name: "2026年度 基幹システム刷新",
      content: "基幹システム刷新に伴うSLS案件+PERM求人",
      ownerId: sato.id,
    },
  });
  const deal2 = await prisma.deal.create({
    data: {
      id: "deal2", leadId: lead2.id, accountId: acc2.id,
      name: "グローバル商事 DX推進",
      content: "DX推進PJに伴うITSS人材派遣",
      ownerId: sato.id,
    },
  });
  const deal3 = await prisma.deal.create({
    data: {
      id: "deal3", leadId: lead1.id, accountId: acc4.id,
      name: "サクラコンサル 人材採用支援",
      content: "SLS+PERM+ITSS全てのニーズあり",
      ownerId: sato.id,
    },
  });

  // Opportunities (案件: SLS_PROJECT / PERM_JOB / ITSS_PROJECT / ITSS_JOB のみ)
  const opp2 = await prisma.opportunity.create({
    data: {
      id: "o2", dealId: deal1.id, accountId: acc1.id, contactId: ct1.id,
      recordType: "SLS_PROJECT", name: "基幹システム刷新PJ", phase: "交渉中",
      buOwnerId: yamada.id,
      expectedAmount: 12000000, expectedCloseDate: new Date("2026-04-15"),
    },
  });
  const opp3 = await prisma.opportunity.create({
    data: {
      id: "o3", dealId: deal1.id, accountId: acc1.id,
      clientDepartmentId: dept1.id, contactId: ct1.id,
      recordType: "PERM_JOB", name: "開発部 シニアエンジニア求人", phase: "紹介中",
      buOwnerId: tanaka.id,
      expectedAmount: 3000000, powerAgelessUrl: "https://power-ageless.example.com/jobs/101",
    },
  });

  const opp5 = await prisma.opportunity.create({
    data: {
      id: "o5", dealId: deal2.id, accountId: acc2.id,
      clientDepartmentId: dept3.id, contactId: ct3.id,
      recordType: "ITSS_PROJECT", name: "DX推進プロジェクト", phase: "進行中",
      buOwnerId: takahashi.id,
    },
  });
  const opp6 = await prisma.opportunity.create({
    data: {
      id: "o6", parentOpportunityId: opp5.id, dealId: deal2.id, accountId: acc2.id,
      clientDepartmentId: dept3.id,
      recordType: "ITSS_JOB", name: "SE求人（Java/3名）", phase: "人選中",
      buOwnerId: takahashi.id, expectedAmount: 15000000,
      powerAgelessUrl: "https://power-ageless.example.com/jobs/201",
    },
  });
  const opp7 = await prisma.opportunity.create({
    data: {
      id: "o7", parentOpportunityId: opp5.id, dealId: deal2.id, accountId: acc2.id,
      clientDepartmentId: dept3.id,
      recordType: "ITSS_JOB", name: "PM求人（1名）", phase: "ヒアリング",
      buOwnerId: takahashi.id, expectedAmount: 8000000,
    },
  });

  // PERM失注→リサイクル
  const opp11 = await prisma.opportunity.create({
    data: {
      id: "o11", dealId: deal1.id, accountId: acc1.id,
      clientDepartmentId: dept2.id, contactId: ct2.id,
      recordType: "PERM_JOB", name: "インフラ部 インフラエンジニア求人", phase: "失注",
      buOwnerId: tanaka.id, lostReason: "候補者のスキルマッチが難しく見送り",
      reapproachDate: new Date("2026-06-01"),
    },
  });

  // Tasks (SLS PJ)
  await prisma.task.createMany({
    data: [
      { id: "t1", opportunityId: opp2.id, name: "提案書 初版作成", ownerId: yamada.id, status: "完了", dueDate: new Date("2026-03-01"), priority: "高" },
      { id: "t2", opportunityId: opp2.id, name: "技術検証", ownerId: suzuki.id, status: "完了", dueDate: new Date("2026-03-05"), priority: "高" },
      { id: "t3", opportunityId: opp2.id, name: "見積もり修正", ownerId: sato.id, status: "進行中", dueDate: new Date("2026-03-10"), priority: "高" },
      { id: "t4", opportunityId: opp2.id, name: "提案書 修正版送付", ownerId: yamada.id, status: "未着手", dueDate: new Date("2026-03-12"), priority: "中" },
      { id: "t5", opportunityId: opp2.id, name: "契約書ドラフト作成", ownerId: yamada.id, status: "未着手", dueDate: new Date("2026-03-20"), priority: "低" },
    ],
  });

  // Activities
  await prisma.activity.createMany({
    data: [
      { id: "act1", opportunityId: opp2.id, accountId: acc1.id, contactId: ct1.id, activityType: "架電", activityDate: new Date("2026-02-15"), subject: "アポ取得", content: "アポ取得。2/20に初回商談設定", actorId: suzuki.id },
      { id: "act2", opportunityId: opp2.id, accountId: acc1.id, contactId: ct1.id, activityType: "WebMTG", activityDate: new Date("2026-02-20"), subject: "初回商談・ニーズ確認", content: "ニーズ確認。SLSで提案方針決定", actorId: sato.id },
      { id: "act3", opportunityId: opp2.id, accountId: acc1.id, contactId: ct1.id, activityType: "往訪", activityDate: new Date("2026-02-28"), subject: "提案実施", content: "提案実施。好感触。予算確認中", actorId: yamada.id },
      { id: "act4", opportunityId: opp2.id, accountId: acc1.id, contactId: ct1.id, activityType: "WebMTG", activityDate: new Date("2026-03-04"), subject: "価格交渉ミーティング", content: "予算は1,200万で承認を得ている。スコープについて一部縮小の要望あり。来週月曜までに修正提案書を送付する約束", actorId: yamada.id },
      { id: "act5", accountId: acc2.id, contactId: ct3.id, activityType: "架電", activityDate: new Date("2026-02-01"), subject: "紹介経由 初回コール", content: "紹介元の○○氏経由。DX推進のニーズあり", actorId: suzuki.id },
      { id: "act6", opportunityId: opp5.id, accountId: acc2.id, contactId: ct3.id, activityType: "往訪", activityDate: new Date("2026-02-10"), subject: "初回商談", content: "ITSS人材派遣のニーズ確認。DX推進PJにSE3名+PM1名希望", actorId: sato.id },
      { id: "act7", accountId: acc3.id, contactId: ct5.id, activityType: "架電", activityDate: new Date("2026-03-03"), subject: "初回架電", content: "広告経由。まだ検討段階。来週再度架電予定", actorId: suzuki.id },
      { id: "act8", accountId: acc4.id, contactId: ct6.id, activityType: "WebMTG", activityDate: new Date("2026-03-02"), subject: "初回商談", content: "SLS+PERM+ITSS全てのニーズあり。規模が大きい。次回詳細ヒアリング予定", actorId: sato.id },
      { id: "act9", accountId: acc5.id, contactId: ct7.id, activityType: "架電", activityDate: new Date("2026-03-05"), subject: "展示会フォロー架電", content: "展示会で名刺交換。まだ具体ニーズなし。3ヶ月後に再架電", actorId: suzuki.id },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
