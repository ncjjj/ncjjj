import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { findUserById } from "../../../../db/queries/users";
import { listConsultationRequestsForEmail } from "../../../../db/queries/consultationRequests";

// Service task response type
export interface ServiceTask {
  id: string;
  serviceName: string;
  documentType?: string;
  status: "due" | "wip" | "complete";
  createdAt: string;
  updatedAt?: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await findUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const userRequests = await listConsultationRequestsForEmail(user.email);

    const serviceTasks: ServiceTask[] = userRequests.map((req) => ({
      id: req.id,
      serviceName: req.serviceName,
      status: mapConsultationStatusToTaskStatus(req.status),
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      serviceTasks,
    });
  } catch (error) {
    console.error("Error fetching service tasks:", error);
    return NextResponse.json(
      { message: "Failed to fetch service tasks" },
      { status: 500 }
    );
  }
}

/**
 * Map consultation request status to service task status
 */
function mapConsultationStatusToTaskStatus(status: string): "due" | "wip" | "complete" {
  switch (status) {
    case "pending":
      return "due";
    case "seen":
      return "wip";
    case "contacted":
      return "complete";
    default:
      return "due";
  }
}
