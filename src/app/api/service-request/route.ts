import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../../../lib/auth";
import {
  createServiceRequestWithDocuments,
  listServiceRequestsForUser,
} from "../../../db/queries/serviceRequests";
import { findUserById } from "../../../db/queries/users";
import { getServiceMeta } from "../../../lib/serviceCatalog";
import { createSignedSupabaseObjectUrls } from "../../../lib/supabaseStorage";
import type { ServiceRequestView } from "../../../types/domain";

const documentSchema = z.object({
  type: z.string().trim().min(2),
  filePath: z.string().trim().min(1),
});

const serviceRequestSchema = z.object({
  serviceId: z.string().trim().min(2),
  name: z.string().trim().min(2),
  phone: z.string().trim().min(6).max(20),
  pan: z.string().trim().min(10).max(20),
  aadhaar: z.string().trim().min(12).max(20),
  gstNumber: z.string().trim().max(30).optional().or(z.literal("")),
  documents: z.array(documentSchema).min(4, "PAN, Aadhaar, photo and signature are required."),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId") || "";
    const scope = searchParams.get("scope") || "full";

    const [userResult, requestsResult] = await Promise.allSettled([
      findUserById(session.user.id),
      listServiceRequestsForUser(session.user.id),
    ]);

    const user = userResult.status === "fulfilled" ? userResult.value : null;
    const requests = requestsResult.status === "fulfilled" ? requestsResult.value : [];

    const latestForService = requests.find((item) => item.serviceId === serviceId);

    if (scope === "form") {
      return NextResponse.json({
        profile: {
          name: user?.name || session.user.name || "",
          phone: user?.mobileNumber || session.user.mobileNumber || "",
          email: user?.email || session.user.email || "",
        },
        defaults: {
          pan: latestForService?.pan || "",
          aadhaar: latestForService?.aadhaar || "",
          gstNumber: latestForService?.gstNumber || "",
        },
      });
    }

    const signedMap = await createSignedSupabaseObjectUrls(
      requests.flatMap((item) => item.documents.map((doc) => doc.filePath)),
      3600
    );

    return NextResponse.json({
      profile: {
        name: user?.name || session.user.name || "",
        phone: user?.mobileNumber || session.user.mobileNumber || "",
        email: user?.email || session.user.email || "",
      },
      defaults: {
        pan: latestForService?.pan || "",
        aadhaar: latestForService?.aadhaar || "",
        gstNumber: latestForService?.gstNumber || "",
      },
      requests: requests.map((item: ServiceRequestView) => ({
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
  } catch (error: unknown) {
    console.error("[api/service-request] GET failed", error);
    return NextResponse.json(
      { message: "Unable to load service request data." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = serviceRequestSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid service request details.";
      return NextResponse.json({ message: issue }, { status: 400 });
    }

    const requiredTypes = ["pan", "aadhaar", "photo", "signature"];
    const missingType = requiredTypes.find(
      (type) => !parsed.data.documents.some((doc) => doc.type === type)
    );

    if (missingType) {
      return NextResponse.json(
        { message: `${missingType.toUpperCase()} document is required.` },
        { status: 400 }
      );
    }

    const createdRequest = await createServiceRequestWithDocuments({
      userId: session.user.id,
      serviceId: parsed.data.serviceId,
      pan: parsed.data.pan,
      aadhaar: parsed.data.aadhaar,
      gstNumber: parsed.data.gstNumber || null,
      documents: parsed.data.documents,
    });

    return NextResponse.json(
      {
        request: {
          id: createdRequest.id,
          serviceId: createdRequest.serviceId,
          serviceName: getServiceMeta(createdRequest.serviceId).name,
          status: createdRequest.status,
          createdAt: createdRequest.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[api/service-request] POST failed", error);
    return NextResponse.json(
      { message: "Unable to submit your service request." },
      { status: 500 }
    );
  }
}
