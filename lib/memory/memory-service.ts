/**
 * Project Memory Service
 * Manages project context and coding standards for AI assistant
 * MVP: Placeholder - ready for future enhancement with ML-based memory management
 */

import { prisma } from "@/lib/prisma";

export interface ProjectMemoryInput {
  userId: string;
  projectFingerprint: string;
  projectName: string;
  architectureSummary?: string;
  codingStandards?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  knownIssues?: Record<string, unknown>;
  importantDecisions?: Record<string, unknown>;
}

/**
 * Create or update project memory
 */
export async function saveProjectMemory(
  input: ProjectMemoryInput
): Promise<string> {
  try {
    const existing = await prisma.projectMemory.findUnique({
      where: {
        userId_projectFingerprint: {
          userId: input.userId,
          projectFingerprint: input.projectFingerprint,
        },
      },
    });

    if (existing) {
      await prisma.projectMemory.update({
        where: { id: existing.id },
        data: {
          projectName: input.projectName,
          architectureSummary: input.architectureSummary,
          codingStandardsJson: input.codingStandards
            ? JSON.stringify(input.codingStandards)
            : undefined,
          preferencesJson: input.preferences
            ? JSON.stringify(input.preferences)
            : undefined,
          knownIssuesJson: input.knownIssues
            ? JSON.stringify(input.knownIssues)
            : undefined,
          importantDecisionsJson: input.importantDecisions
            ? JSON.stringify(input.importantDecisions)
            : undefined,
        },
      });
      return existing.id;
    }

    const created = await prisma.projectMemory.create({
      data: {
        userId: input.userId,
        projectFingerprint: input.projectFingerprint,
        projectName: input.projectName,
        architectureSummary: input.architectureSummary,
        codingStandardsJson: input.codingStandards
          ? JSON.stringify(input.codingStandards)
          : null,
        preferencesJson: input.preferences
          ? JSON.stringify(input.preferences)
          : null,
        knownIssuesJson: input.knownIssues
          ? JSON.stringify(input.knownIssues)
          : null,
        importantDecisionsJson: input.importantDecisions
          ? JSON.stringify(input.importantDecisions)
          : null,
      },
    });

    return created.id;
  } catch (error) {
    console.error("Error saving project memory:", error);
    throw new Error("Failed to save project memory");
  }
}

/**
 * Get project memory by fingerprint
 */
export async function getProjectMemory(
  userId: string,
  projectFingerprint: string
) {
  try {
    const memory = await prisma.projectMemory.findUnique({
      where: {
        userId_projectFingerprint: {
          userId,
          projectFingerprint,
        },
      },
      include: {
        memoryEvents: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!memory) return null;

    return {
      id: memory.id,
      projectName: memory.projectName,
      architectureSummary: memory.architectureSummary,
      codingStandards: memory.codingStandardsJson
        ? JSON.parse(memory.codingStandardsJson)
        : null,
      preferences: memory.preferencesJson
        ? JSON.parse(memory.preferencesJson)
        : null,
      knownIssues: memory.knownIssuesJson
        ? JSON.parse(memory.knownIssuesJson)
        : null,
      importantDecisions: memory.importantDecisionsJson
        ? JSON.parse(memory.importantDecisionsJson)
        : null,
      recentEvents: memory.memoryEvents,
    };
  } catch (error) {
    console.error("Error getting project memory:", error);
    return null;
  }
}

/**
 * Add a memory event
 * MVP: Placeholder for ML-based importance calculation
 */
export async function addMemoryEvent(
  projectMemoryId: string,
  userId: string,
  type: string,
  content: string,
  importance: "low" | "medium" | "high" = "medium"
): Promise<void> {
  try {
    await prisma.memoryEvent.create({
      data: {
        projectMemoryId,
        userId,
        type,
        content,
        importance,
      },
    });
  } catch (error) {
    console.error("Error adding memory event:", error);
    throw new Error("Failed to add memory event");
  }
}

/**
 * Delete project memory
 */
export async function deleteProjectMemory(
  userId: string,
  projectFingerprint: string
): Promise<void> {
  try {
    await prisma.projectMemory.deleteMany({
      where: {
        userId,
        projectFingerprint,
      },
    });
  } catch (error) {
    console.error("Error deleting project memory:", error);
    throw new Error("Failed to delete project memory");
  }
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string) {
  try {
    const projects = await prisma.projectMemory.findMany({
      where: { userId },
      select: {
        id: true,
        projectFingerprint: true,
        projectName: true,
        updatedAt: true,
        _count: { select: { memoryEvents: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return projects;
  } catch (error) {
    console.error("Error getting user projects:", error);
    return [];
  }
}
