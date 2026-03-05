"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ========== Account ==========

export async function createAccount(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    nameKana: (formData.get("nameKana") as string) || null,
    industry: (formData.get("industry") as string) || null,
    companyType: (formData.get("companyType") as string) || null,
    tier: (formData.get("tier") as string) || null,
    contractStatus: (formData.get("contractStatus") as string) || "未契約",
    mainOwnerId: (formData.get("mainOwnerId") as string) || null,
    slsNeed: formData.get("slsNeed") === "on",
    permNeed: formData.get("permNeed") === "on",
    itssNeed: formData.get("itssNeed") === "on",
    address: (formData.get("address") as string) || null,
    url: (formData.get("url") as string) || null,
    employeeCount: formData.get("employeeCount") ? parseInt(formData.get("employeeCount") as string) : null,
    annualRevenue: (formData.get("annualRevenue") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
  const account = await prisma.account.create({ data });
  redirect(`/accounts/${account.id}`);
}

export async function updateAccount(id: string, formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    nameKana: (formData.get("nameKana") as string) || null,
    industry: (formData.get("industry") as string) || null,
    companyType: (formData.get("companyType") as string) || null,
    tier: (formData.get("tier") as string) || null,
    contractStatus: (formData.get("contractStatus") as string) || "未契約",
    mainOwnerId: (formData.get("mainOwnerId") as string) || null,
    slsNeed: formData.get("slsNeed") === "on",
    permNeed: formData.get("permNeed") === "on",
    itssNeed: formData.get("itssNeed") === "on",
    address: (formData.get("address") as string) || null,
    url: (formData.get("url") as string) || null,
    employeeCount: formData.get("employeeCount") ? parseInt(formData.get("employeeCount") as string) : null,
    annualRevenue: (formData.get("annualRevenue") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
  await prisma.account.update({ where: { id }, data });
  redirect(`/accounts/${id}`);
}

export async function deleteAccount(id: string) {
  await prisma.activity.deleteMany({ where: { accountId: id } });
  const opps = await prisma.opportunity.findMany({ where: { accountId: id }, select: { id: true } });
  const oppIds = opps.map((o) => o.id);
  await prisma.task.deleteMany({ where: { opportunityId: { in: oppIds } } });
  await prisma.activity.deleteMany({ where: { opportunityId: { in: oppIds } } });
  await prisma.opportunity.deleteMany({ where: { parentOpportunityId: { in: oppIds } } });
  await prisma.opportunity.deleteMany({ where: { accountId: id } });
  await prisma.contact.deleteMany({ where: { accountId: id } });
  await prisma.clientDepartment.deleteMany({ where: { accountId: id } });
  await prisma.account.delete({ where: { id } });
  redirect("/accounts");
}

// ========== Contact ==========

export async function createContact(formData: FormData) {
  const data = {
    accountId: formData.get("accountId") as string,
    clientDepartmentId: (formData.get("clientDepartmentId") as string) || null,
    lastName: formData.get("lastName") as string,
    firstName: formData.get("firstName") as string,
    lastNameKana: (formData.get("lastNameKana") as string) || null,
    firstNameKana: (formData.get("firstNameKana") as string) || null,
    department: (formData.get("department") as string) || null,
    title: (formData.get("title") as string) || null,
    keyPersonRole: (formData.get("keyPersonRole") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
  await prisma.contact.create({ data });
  const returnTo = formData.get("returnTo") as string;
  revalidatePath(returnTo || "/contacts");
  redirect(returnTo || "/contacts");
}

export async function updateContact(id: string, formData: FormData) {
  const data = {
    accountId: formData.get("accountId") as string,
    clientDepartmentId: (formData.get("clientDepartmentId") as string) || null,
    lastName: formData.get("lastName") as string,
    firstName: formData.get("firstName") as string,
    lastNameKana: (formData.get("lastNameKana") as string) || null,
    firstNameKana: (formData.get("firstNameKana") as string) || null,
    department: (formData.get("department") as string) || null,
    title: (formData.get("title") as string) || null,
    keyPersonRole: (formData.get("keyPersonRole") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
  await prisma.contact.update({ where: { id }, data });
  const returnTo = formData.get("returnTo") as string;
  revalidatePath(returnTo || "/contacts");
  redirect(returnTo || "/contacts");
}

export async function deleteContact(id: string) {
  await prisma.activity.deleteMany({ where: { contactId: id } });
  await prisma.opportunity.updateMany({ where: { contactId: id }, data: { contactId: null } });
  await prisma.clientDepartment.updateMany({ where: { primaryContactId: id }, data: { primaryContactId: null } });
  await prisma.contact.delete({ where: { id } });
  revalidatePath("/contacts");
  redirect("/contacts");
}

// ========== Opportunity ==========

export async function createOpportunity(formData: FormData) {
  const data = {
    accountId: formData.get("accountId") as string,
    parentOpportunityId: (formData.get("parentOpportunityId") as string) || null,
    clientDepartmentId: (formData.get("clientDepartmentId") as string) || null,
    contactId: (formData.get("contactId") as string) || null,
    recordType: formData.get("recordType") as string,
    name: formData.get("name") as string,
    phase: formData.get("phase") as string,
    channel: (formData.get("channel") as string) || null,
    isOwnerId: (formData.get("isOwnerId") as string) || null,
    fsOwnerId: (formData.get("fsOwnerId") as string) || null,
    buOwnerId: (formData.get("buOwnerId") as string) || null,
    expectedAmount: formData.get("expectedAmount") ? parseInt(formData.get("expectedAmount") as string) : null,
    expectedCloseDate: formData.get("expectedCloseDate") ? new Date(formData.get("expectedCloseDate") as string) : null,
    powerAgelessUrl: (formData.get("powerAgelessUrl") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
  const opp = await prisma.opportunity.create({ data });
  redirect(`/opportunities/${opp.id}`);
}

export async function updateOpportunity(id: string, formData: FormData) {
  const data = {
    accountId: formData.get("accountId") as string,
    parentOpportunityId: (formData.get("parentOpportunityId") as string) || null,
    clientDepartmentId: (formData.get("clientDepartmentId") as string) || null,
    contactId: (formData.get("contactId") as string) || null,
    recordType: formData.get("recordType") as string,
    name: formData.get("name") as string,
    phase: formData.get("phase") as string,
    channel: (formData.get("channel") as string) || null,
    isOwnerId: (formData.get("isOwnerId") as string) || null,
    fsOwnerId: (formData.get("fsOwnerId") as string) || null,
    buOwnerId: (formData.get("buOwnerId") as string) || null,
    expectedAmount: formData.get("expectedAmount") ? parseInt(formData.get("expectedAmount") as string) : null,
    expectedCloseDate: formData.get("expectedCloseDate") ? new Date(formData.get("expectedCloseDate") as string) : null,
    reapproachDate: formData.get("reapproachDate") ? new Date(formData.get("reapproachDate") as string) : null,
    lostReason: (formData.get("lostReason") as string) || null,
    powerAgelessUrl: (formData.get("powerAgelessUrl") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
  await prisma.opportunity.update({ where: { id }, data });
  redirect(`/opportunities/${id}`);
}

export async function deleteOpportunity(id: string) {
  await prisma.task.deleteMany({ where: { opportunityId: id } });
  await prisma.activity.deleteMany({ where: { opportunityId: id } });
  await prisma.opportunity.updateMany({ where: { parentOpportunityId: id }, data: { parentOpportunityId: null } });
  await prisma.opportunity.delete({ where: { id } });
  redirect("/opportunities");
}

// ========== Task ==========

export async function createTask(formData: FormData) {
  const data = {
    opportunityId: formData.get("opportunityId") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    ownerId: formData.get("ownerId") as string,
    status: (formData.get("status") as string) || "未着手",
    dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
    priority: (formData.get("priority") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
  await prisma.task.create({ data });
  const returnTo = formData.get("returnTo") as string;
  revalidatePath(returnTo || "/tasks");
  redirect(returnTo || "/tasks");
}

export async function updateTask(id: string, formData: FormData) {
  const data = {
    opportunityId: formData.get("opportunityId") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    ownerId: formData.get("ownerId") as string,
    status: (formData.get("status") as string) || "未着手",
    dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
    priority: (formData.get("priority") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
  await prisma.task.update({ where: { id }, data });
  const returnTo = formData.get("returnTo") as string;
  revalidatePath(returnTo || "/tasks");
  redirect(returnTo || "/tasks");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  redirect("/tasks");
}

// ========== Activity ==========

export async function createActivity(formData: FormData) {
  const data = {
    accountId: (formData.get("accountId") as string) || null,
    opportunityId: (formData.get("opportunityId") as string) || null,
    contactId: (formData.get("contactId") as string) || null,
    activityType: formData.get("activityType") as string,
    activityDate: new Date(formData.get("activityDate") as string),
    subject: formData.get("subject") as string,
    content: (formData.get("content") as string) || null,
    actorId: formData.get("actorId") as string,
  };
  await prisma.activity.create({ data });
  const returnTo = formData.get("returnTo") as string;
  revalidatePath(returnTo || "/activities");
  redirect(returnTo || "/activities");
}

export async function updateActivity(id: string, formData: FormData) {
  const data = {
    accountId: (formData.get("accountId") as string) || null,
    opportunityId: (formData.get("opportunityId") as string) || null,
    contactId: (formData.get("contactId") as string) || null,
    activityType: formData.get("activityType") as string,
    activityDate: new Date(formData.get("activityDate") as string),
    subject: formData.get("subject") as string,
    content: (formData.get("content") as string) || null,
    actorId: formData.get("actorId") as string,
  };
  await prisma.activity.update({ where: { id }, data });
  const returnTo = formData.get("returnTo") as string;
  revalidatePath(returnTo || "/activities");
  redirect(returnTo || "/activities");
}

export async function deleteActivity(id: string) {
  await prisma.activity.delete({ where: { id } });
  revalidatePath("/activities");
  redirect("/activities");
}
