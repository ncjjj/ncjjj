import { NextResponse } from "next/server";
import { getDb } from "../../../../db/index";
import { users, documents, consultationRequests } from "../../../../db/schema";
import { getAdminSessionFromRequest } from "../../../../lib/adminRequestSession";
import { decodeServiceAccess } from "../../../../lib/serviceAccess";
import { getFinancialYearLabel } from "../../../../lib/yearlyDocumentTypes";
import { resolveSupabaseObjectUrl } from "../../../../lib/supabaseStorage";
import { getDatabaseErrorMessage, getDatabaseErrorStatus } from "../../../../lib/dbErrors";
import { and, eq, like } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const adminSession = await getAdminSessionFromRequest(request);

  if (!adminSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    // 1. Get all registered users to compute service user counts
    const allUsers = await db.select({
      id: users.id,
      serviceAccess: users.serviceAccess,
    }).from(users);

    const totalRegisteredUsers = allUsers.length;
    let totalGstUsers = 0;
    let totalTdsUsers = 0;
    let totalIncomeTaxUsers = 0;

    for (const u of allUsers) {
      const decoded = decodeServiceAccess(u.serviceAccess);
      if (decoded.includes("gst")) {
        totalGstUsers++;
      }
      if (decoded.includes("tds")) {
        totalTdsUsers++;
      }
      if (decoded.includes("income-tax")) {
        totalIncomeTaxUsers++;
      }
    }

    // 2. Get Income Tax return filing documents for the current financial year (specifically for legacy backward compatibility if needed)
    const currentFY = getFinancialYearLabel();

    // 3. Query all service-related documents and consultation requests
    // A. Service Documents (those starting with 'service:')
    const rawAllDocs = await db.select({
      id: documents.id,
      userId: documents.userId,
      documentType: documents.documentType,
      documentSlot: documents.documentSlot,
      documentYear: documents.documentYear,
      fileName: documents.fileName,
      storagePath: documents.storagePath,
      createdAt: documents.createdAt,
      uploadStatus: documents.uploadStatus,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.mobileNumber,
    })
    .from(documents)
    .innerJoin(users, eq(documents.userId, users.id))
    .where(like(documents.documentType, "service:%"));

    const resolvedDocs = await Promise.all(
      rawAllDocs.map(async (doc) => {
        let signedUrl: string | null = null;
        if (doc.storagePath) {
          try {
            const resolved = await resolveSupabaseObjectUrl({
              path: doc.storagePath,
              expiresIn: 1800,
            });
            signedUrl = resolved.avatarUrl;
          } catch (err) {
            console.warn("Failed to resolve URL for due doc", doc.id, err);
          }
        }
        return {
          id: doc.id,
          userId: doc.userId,
          type: "document",
          userName: doc.userName,
          userEmail: doc.userEmail,
          userPhone: doc.userPhone,
          documentType: doc.documentType,
          documentYear: doc.documentYear,
          financialYear: doc.documentSlot,
          fileName: doc.fileName,
          fileUrl: signedUrl,
          createdAt: doc.createdAt,
          status: doc.uploadStatus,
        };
      })
    );

    // B. Consultation Requests
    const rawConsultations = await db.select({
      id: consultationRequests.id,
      userId: users.id,
      serviceName: consultationRequests.serviceName,
      note: consultationRequests.note,
      createdAt: consultationRequests.createdAt,
      status: consultationRequests.status,
      userName: consultationRequests.fullName,
      userEmail: consultationRequests.email,
      userPhone: consultationRequests.phone,
    })
    .from(consultationRequests)
    .leftJoin(users, eq(users.email, consultationRequests.email));

    const consultations = rawConsultations.map((req) => ({
      id: req.id,
      type: "consultation",
      userId: req.userId || null,
      userName: req.userName,
      userEmail: req.userEmail,
      userPhone: req.userPhone,
      serviceName: req.serviceName,
      note: req.note,
      createdAt: req.createdAt,
      status: req.status,
    }));

    // Categorize and sort
    const dueTasksList = [
      ...resolvedDocs.filter((d) => d.status === "uploaded"),
      ...consultations.filter((c) => c.status === "pending"),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const wipTasksList = [
      ...resolvedDocs.filter((d) => d.status === "verified"),
      ...consultations.filter((c) => c.status === "seen"),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const completeTasksList = [
      ...resolvedDocs.filter((d) => d.status === "completed"),
      ...consultations.filter((c) => c.status === "contacted"),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      totalRegisteredUsers,
      totalGstUsers,
      totalTdsUsers,
      totalIncomeTaxUsers,
      currentFinancialYear: currentFY,
      incomeTaxPendency: {
        due: dueTasksList.length,
        wip: wipTasksList.length,
        complete: completeTasksList.length,
      },
      totalDueTasks: dueTasksList.length,
      totalWipTasks: wipTasksList.length,
      totalCompleteTasks: completeTasksList.length,
      dueTasksList,
      wipTasksList,
      completeTasksList,
    });
  } catch (error) {
    console.error("[api/admin/dashboard-stats] GET failed", error);
    return NextResponse.json(
      { message: getDatabaseErrorMessage(error) || "Unable to load dashboard statistics." },
      { status: getDatabaseErrorStatus(error) }
    );
  }
}
