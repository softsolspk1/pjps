import { prisma } from "./prisma";

export type AuditAction = 
  | "ARTICLE_SUBMITTED"
  | "ARTICLE_STATUS_CHANGE"
  | "ARTICLE_UPDATE"
  | "DOI_ASSIGNED"
  | "USER_LOGIN"
  | "USER_ROLE_CHANGE"
  | "ISSUE_PUBLISHED"
  | "REVIEW_ASSIGNED"
  | "REVIEW_COMPLETED"
  | "TRACK_CHANGED";

export async function logAction(
  action: AuditAction,
  entityType: "ARTICLE" | "USER" | "ISSUE" | "REVIEW",
  entityId: string | null,
  userId: string | null,
  details?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        details: details || {},
      }
    });

    // Cleanup logic: Remove logs older than 30 days
    // This runs on every log creation as a simple maintenance task
    // alternatively, this could be a cron job
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
