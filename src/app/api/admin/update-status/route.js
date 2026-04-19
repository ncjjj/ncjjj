import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../../../../lib/auth";
import {
  listAllServiceRequestsForAdmin,
  updateServiceRequestStatus,
} from "../../../../db/queries/serviceRequests";
import { sendServiceRequestStatusEmail } from "../../../../lib/email";
import { getServiceMeta } from "../../../../lib/serviceCatalog";
import { createSignedSupabaseObjectUrls } from "../../../../lib/supabaseStorage";

const updateSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
  remarks: z.string().trim().max(500).optional(),
  paymentStatus: z.enum(["pending", "received"]).optional(),
  paymentNote: z.string().trim().max(500).optional(),
});

function assertAdmin(session) {
  if (!session?.user?.id || session.user.role !== "admin") {
    return false;
  }

  return true;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!assertAdmin(session)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const requests = await listAllServiceRequestsForAdmin();
    const signedMap = await createSignedSupabaseObjectUrls(
      requests.flatMap((item) => item.documents.map((doc) => doc.filePath)),
      3600
    );

    return NextResponse.json({
      requests: requests.map((item) => ({
        ...item,
        documents: item.documents.map((doc) => {
          const normalizedPath = String(doc.filePath || "").replace(/^\/+/, "");
          return {
            ...doc,
            filePath: normalizedPath,
            signedUrl: signedMap[normalizedPath] || null,
          };
        }),
        serviceName: getServiceMeta(item.serviceId).name,
      })),
    });
  } catch (error) {
    console.error("[api/admin/update-status] GET failed", error);
    return NextResponse.json(
      { message: "Unable to load requests." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!assertAdmin(session)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const parsed = updateSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid update payload.";
      return NextResponse.json({ message: issue }, { status: 400 });
    }

    const updated = await updateServiceRequestStatus(parsed.data);

    if (!updated) {
      return NextResponse.json({ message: "Request not found." }, { status: 404 });
    }

    const allRequests = await listAllServiceRequestsForAdmin();
    const updatedRequest = allRequests.find((item) => item.id === parsed.data.requestId);

    if (updatedRequest?.userEmail) {
      try {
        await sendServiceRequestStatusEmail({
          to: updatedRequest.userEmail,
          name: updatedRequest.userName,
          serviceName: getServiceMeta(updatedRequest.serviceId).name,
          status: parsed.data.status,
          remarks: parsed.data.remarks,
        });
      } catch (mailError) {
        console.error("[api/admin/update-status] email failed", mailError);
      }
    }

    return NextResponse.json({
      updated: {
        id: updated.id,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("[api/admin/update-status] POST failed", error);
    return NextResponse.json(
      { message: "Unable to update request status." },
      { status: 500 }
    );
  }
}
