import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../index";
import {
  adminActions,
  payments,
  serviceDocuments,
  serviceRequests,
  users,
} from "../schema";
import type {
  PaymentStatus,
  ServiceRequestDocument,
  ServiceRequestStatus,
  ServiceRequestView,
} from "../../types/domain";

interface GroupedRow {
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceId: string;
  pan: string | null;
  aadhaar: string | null;
  gstNumber: string | null;
  status: ServiceRequestStatus;
  createdAt: Date;
  adminRemarks: string | null;
  paymentStatus: PaymentStatus | null;
  paymentAmount: string | null;
  paymentNote: string | null;
  documentId: string | null;
  documentType: string | null;
  documentPath: string | null;
}

interface CreateServiceRequestInput {
  userId: string;
  serviceId: string;
  pan: string;
  aadhaar: string;
  gstNumber: string | null;
  documents: Array<Pick<ServiceRequestDocument, "type" | "filePath">>;
}

interface UpdateServiceRequestInput {
  requestId: string;
  status: Exclude<ServiceRequestStatus, "pending">;
  remarks?: string | null;
  paymentStatus?: PaymentStatus;
  paymentNote?: string | null;
}

interface UpdateServiceRequestPaymentInput {
  requestId: string;
  paymentStatus: PaymentStatus;
  paymentNote?: string | null;
}

function groupRows(rows: GroupedRow[]): ServiceRequestView[] {
  const map = new Map<string, ServiceRequestView>();

  for (const row of rows) {
    const requestId = row.requestId;

    if (!map.has(requestId)) {
      map.set(requestId, {
        id: requestId,
        userId: row.userId,
        userName: row.userName,
        userEmail: row.userEmail,
        userPhone: row.userPhone,
        serviceId: row.serviceId,
        pan: row.pan,
        aadhaar: row.aadhaar,
        gstNumber: row.gstNumber,
        status: row.status,
        createdAt: row.createdAt,
        adminRemarks: row.adminRemarks,
        paymentStatus: row.paymentStatus || "pending",
        paymentAmount: row.paymentAmount || "0",
        paymentNote: row.paymentNote || "",
        documents: [],
      });
    }

    if (row.documentId && row.documentType && row.documentPath) {
      const existing = map.get(requestId);
      if (existing) {
        existing.documents.push({
          id: row.documentId,
          type: row.documentType,
          filePath: row.documentPath,
        });
      }
    }
  }

  return Array.from(map.values());
}

export async function createServiceRequestWithDocuments({
  userId,
  serviceId,
  pan,
  aadhaar,
  gstNumber,
  documents,
}: CreateServiceRequestInput) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [request] = await tx
      .insert(serviceRequests)
      .values({
        userId,
        serviceId,
        pan,
        aadhaar,
        gstNumber,
        status: "pending",
      })
      .returning({
        id: serviceRequests.id,
        userId: serviceRequests.userId,
        serviceId: serviceRequests.serviceId,
        status: serviceRequests.status,
        createdAt: serviceRequests.createdAt,
      });

    if (!request) {
      throw new Error("Failed to create service request.");
    }

    if (documents.length > 0) {
      await tx.insert(serviceDocuments).values(
        documents.map((doc) => ({
          requestId: request.id,
          type: doc.type,
          fileUrl: doc.filePath,
          filePath: doc.filePath,
        }))
      );
    }

    await tx.insert(adminActions).values({
      requestId: request.id,
      action: "pending",
      remarks: "Submitted by user",
    });

    await tx.insert(payments).values({
      requestId: request.id,
      amount: "0",
      status: "pending",
      note: "Awaiting admin update",
    });

    return request;
  });
}

export async function listServiceRequestsForUser(userId: string): Promise<ServiceRequestView[]> {
  const db = getDb();

  const rows = await db
    .select({
      requestId: serviceRequests.id,
      userId: serviceRequests.userId,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.mobileNumber,
      serviceId: serviceRequests.serviceId,
      pan: serviceRequests.pan,
      aadhaar: serviceRequests.aadhaar,
      gstNumber: serviceRequests.gstNumber,
      status: serviceRequests.status,
      createdAt: serviceRequests.createdAt,
      adminRemarks: adminActions.remarks,
      paymentStatus: payments.status,
      paymentAmount: payments.amount,
      paymentNote: payments.note,
      documentId: serviceDocuments.id,
      documentType: serviceDocuments.type,
      documentPath: serviceDocuments.filePath,
    })
    .from(serviceRequests)
    .innerJoin(users, eq(users.id, serviceRequests.userId))
    .leftJoin(serviceDocuments, eq(serviceDocuments.requestId, serviceRequests.id))
    .leftJoin(adminActions, eq(adminActions.requestId, serviceRequests.id))
    .leftJoin(payments, eq(payments.requestId, serviceRequests.id))
    .where(eq(serviceRequests.userId, userId))
    .orderBy(desc(serviceRequests.createdAt));

  return groupRows(rows as GroupedRow[]);
}

export async function listAllServiceRequestsForAdmin(): Promise<ServiceRequestView[]> {
  const db = getDb();

  const rows = await db
    .select({
      requestId: serviceRequests.id,
      userId: serviceRequests.userId,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.mobileNumber,
      serviceId: serviceRequests.serviceId,
      pan: serviceRequests.pan,
      aadhaar: serviceRequests.aadhaar,
      gstNumber: serviceRequests.gstNumber,
      status: serviceRequests.status,
      createdAt: serviceRequests.createdAt,
      adminRemarks: adminActions.remarks,
      paymentStatus: payments.status,
      paymentAmount: payments.amount,
      paymentNote: payments.note,
      documentId: serviceDocuments.id,
      documentType: serviceDocuments.type,
      documentPath: serviceDocuments.filePath,
    })
    .from(serviceRequests)
    .innerJoin(users, eq(users.id, serviceRequests.userId))
    .leftJoin(serviceDocuments, eq(serviceDocuments.requestId, serviceRequests.id))
    .leftJoin(adminActions, eq(adminActions.requestId, serviceRequests.id))
    .leftJoin(payments, eq(payments.requestId, serviceRequests.id))
    .orderBy(desc(serviceRequests.createdAt));

  return groupRows(rows as GroupedRow[]);
}

export async function updateServiceRequestStatus({
  requestId,
  status,
  remarks,
  paymentStatus,
  paymentNote,
}: UpdateServiceRequestInput) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [currentRequest] = await tx
      .select({
        id: serviceRequests.id,
        userId: serviceRequests.userId,
        status: serviceRequests.status,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId))
      .limit(1);

    if (!currentRequest) {
      return null;
    }

    if (currentRequest.status !== "pending") {
      return null;
    }

    const [updatedRequest] = await tx
      .update(serviceRequests)
      .set({ status })
      .where(and(eq(serviceRequests.id, requestId), eq(serviceRequests.status, "pending")))
      .returning({
        id: serviceRequests.id,
        userId: serviceRequests.userId,
        serviceId: serviceRequests.serviceId,
        status: serviceRequests.status,
      });

    if (!updatedRequest) {
      return null;
    }

    const existingAction = await tx
      .select({ id: adminActions.id })
      .from(adminActions)
      .where(eq(adminActions.requestId, requestId))
      .limit(1);

    if (existingAction.length > 0) {
      await tx
        .update(adminActions)
        .set({
          action: status,
          remarks: remarks || null,
          updatedAt: new Date(),
        })
        .where(eq(adminActions.requestId, requestId));
    } else {
      await tx
        .insert(adminActions)
        .values({
          requestId,
          action: status,
          remarks: remarks || null,
        });
    }

    const [existingPayment] = await tx
      .select({
        id: payments.id,
        status: payments.status,
        note: payments.note,
      })
      .from(payments)
      .where(eq(payments.requestId, requestId))
      .limit(1);

    if (existingPayment) {
      const shouldUpdatePayment =
        typeof paymentStatus === "string" || typeof paymentNote === "string";

      if (shouldUpdatePayment) {
        const nextPaymentStatus = paymentStatus ?? existingPayment.status ?? "pending";
        const nextPaymentNote = paymentNote ?? existingPayment.note ?? null;

        await tx
          .update(payments)
          .set({
            status: nextPaymentStatus,
            note: nextPaymentNote,
          })
          .where(eq(payments.requestId, requestId));
      }
    } else {
      const nextPaymentStatus = paymentStatus ?? "pending";
      const nextPaymentNote = paymentNote ?? null;

      await tx
        .insert(payments)
        .values({
        requestId,
        amount: "0",
        status: nextPaymentStatus,
        note: nextPaymentNote,
      });
    }

    const [finalPayment] = await tx
      .select({
        status: payments.status,
        note: payments.note,
      })
      .from(payments)
      .where(eq(payments.requestId, requestId))
      .limit(1);

    return {
      ...updatedRequest,
      adminRemarks: remarks || null,
      paymentStatus: finalPayment?.status || "pending",
      paymentNote: finalPayment?.note || null,
    };
  });
}

export async function updateServiceRequestPayment({
  requestId,
  paymentStatus,
  paymentNote,
}: UpdateServiceRequestPaymentInput) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [request] = await tx
      .select({
        id: serviceRequests.id,
        userId: serviceRequests.userId,
        status: serviceRequests.status,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId))
      .limit(1);

    if (!request) {
      return null;
    }

    const existingPayment = await tx
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.requestId, requestId))
      .limit(1);

    if (existingPayment.length > 0) {
      await tx
        .update(payments)
        .set({
          status: paymentStatus,
          note: paymentNote || null,
        })
        .where(eq(payments.requestId, requestId));
    } else {
      await tx.insert(payments).values({
        requestId,
        amount: "0",
        status: paymentStatus,
        note: paymentNote || null,
      });
    }

    return request;
  });
}

export async function findServiceRequestByIdForUser(
  requestId: string,
  userId: string
) {
  const db = getDb();

  const [request] = await db
    .select({
      id: serviceRequests.id,
      userId: serviceRequests.userId,
      serviceId: serviceRequests.serviceId,
      status: serviceRequests.status,
    })
    .from(serviceRequests)
    .where(and(eq(serviceRequests.id, requestId), eq(serviceRequests.userId, userId)))
    .limit(1);

  return request ?? null;
}
