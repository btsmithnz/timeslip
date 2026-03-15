import { v } from "convex/values";

import { Doc, Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { authComponent } from "./auth";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type UserLike = {
  userId?: unknown;
  id?: unknown;
  subject?: unknown;
  tokenIdentifier?: unknown;
  user?: {
    id?: unknown;
    userId?: unknown;
  };
} | null;

function extractUserId(value: UserLike): string | null {
  if (!value) {
    return null;
  }

  if (typeof value.userId === "string") {
    return value.userId;
  }

  if (typeof value.id === "string") {
    return value.id;
  }

  if (value.user) {
    if (typeof value.user.userId === "string") {
      return value.user.userId;
    }

    if (typeof value.user.id === "string") {
      return value.user.id;
    }
  }

  return null;
}

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity?.subject) {
    return identity.subject;
  }

  const authUser = (await authComponent.getAuthUser(ctx)) as UserLike;
  const userId = extractUserId(authUser);

  if (!userId && typeof authUser?.subject === "string") {
    return authUser.subject;
  }

  if (!userId && typeof authUser?.tokenIdentifier === "string") {
    return authUser.tokenIdentifier;
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

async function requireOwnedClient(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  clientId: Id<"clients">,
) {
  const client = await ctx.db.get(clientId);

  if (!client) {
    throw new Error("Client not found.");
  }

  if (client.user !== userId) {
    throw new Error("You do not have access to this client.");
  }

  return client;
}

async function requireOwnedProject(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const client = await requireOwnedClient(ctx, userId, project.client);
  return { project, client };
}

async function requireOwnedTask(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  taskId: Id<"tasks">,
) {
  const task = await ctx.db.get(taskId);

  if (!task) {
    throw new Error("Task not found.");
  }

  const { project, client } = await requireOwnedProject(ctx, userId, task.project);
  return { task, project, client };
}

function normalizeOptionalText(value?: string) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeRequiredText(value: string, fieldName: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} is required.`);
  }
  return trimmed;
}

function validateTaskTimes(startAt: number, endAt?: number) {
  if (!Number.isFinite(startAt)) {
    throw new Error("Start time is invalid.");
  }

  if (endAt !== undefined) {
    if (!Number.isFinite(endAt)) {
      throw new Error("End time is invalid.");
    }

    if (endAt <= startAt) {
      throw new Error("End time must be after start time.");
    }
  }
}

function byNameAsc(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

export const homepageWeek = query({
  args: {
    weekAnchorMs: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const weekStart = args.weekAnchorMs;
    const weekEnd = weekStart + WEEK_MS;

    const clients = (
      await ctx.db
        .query("clients")
        .withIndex("by_user", (q) => q.eq("user", userId))
        .collect()
    ).sort(byNameAsc);

    const projectsNested = await Promise.all(
      clients.map((client) =>
        ctx.db
          .query("projects")
          .withIndex("by_client", (q) => q.eq("client", client._id))
          .collect(),
      ),
    );
    const projects = projectsNested.flat().sort(byNameAsc);

    const weekTasksNested = await Promise.all(
      projects.map((project) =>
        ctx.db
          .query("tasks")
          .withIndex("by_project_startAt", (q) =>
            q.eq("project", project._id).gte("startAt", weekStart).lt("startAt", weekEnd),
          )
          .collect(),
      ),
    );
    const tasks = weekTasksNested
      .flat()
      .sort((a, b) => a.startAt - b.startAt);

    const allProjectTasksNested = await Promise.all(
      projects.map((project) =>
        ctx.db
          .query("tasks")
          .withIndex("by_project_startAt", (q) => q.eq("project", project._id))
          .collect(),
      ),
    );
    const activeTasks = allProjectTasksNested
      .flat()
      .filter((task) => task.endAt === undefined)
      .sort((a, b) => a.startAt - b.startAt);

    return {
      weekStart,
      weekEnd,
      clients,
      projects,
      tasks,
      activeTasks,
    };
  },
});

export const createClientInline = mutation({
  args: {
    name: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    zip: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const name = normalizeRequiredText(args.name, "Client name");

    const client: Omit<Doc<"clients">, "_id" | "_creationTime"> = {
      name,
      user: userId,
      archived: false,
      ...(normalizeOptionalText(args.address) ? { address: normalizeOptionalText(args.address) } : {}),
      ...(normalizeOptionalText(args.city) ? { city: normalizeOptionalText(args.city) } : {}),
      ...(normalizeOptionalText(args.country) ? { country: normalizeOptionalText(args.country) } : {}),
      ...(normalizeOptionalText(args.zip) ? { zip: normalizeOptionalText(args.zip) } : {}),
      ...(normalizeOptionalText(args.email) ? { email: normalizeOptionalText(args.email) } : {}),
      ...(normalizeOptionalText(args.phone) ? { phone: normalizeOptionalText(args.phone) } : {}),
      ...(normalizeOptionalText(args.website) ? { website: normalizeOptionalText(args.website) } : {}),
    };

    const clientId = await ctx.db.insert("clients", client);
    return await ctx.db.get(clientId);
  },
});

export const createProjectInline = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const client = await requireOwnedClient(ctx, userId, args.clientId);
    const name = normalizeRequiredText(args.name, "Project name");

    const projectId = await ctx.db.insert("projects", {
      name,
      client: client._id,
      archived: false,
    });

    return await ctx.db.get(projectId);
  },
});

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    startAt: v.number(),
    endAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireOwnedProject(ctx, userId, args.projectId);

    const title = normalizeRequiredText(args.title, "Task title");
    const description = normalizeOptionalText(args.description);
    validateTaskTimes(args.startAt, args.endAt);

    const taskId = await ctx.db.insert("tasks", {
      title,
      ...(description ? { description } : {}),
      project: args.projectId,
      startAt: args.startAt,
      ...(args.endAt !== undefined ? { endAt: args.endAt } : {}),
    });

    return await ctx.db.get(taskId);
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    startAt: v.number(),
    endAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const { task } = await requireOwnedTask(ctx, userId, args.taskId);

    if (task.invoice) {
      throw new Error("Invoiced tasks cannot be modified.");
    }

    await requireOwnedProject(ctx, userId, args.projectId);

    const title = normalizeRequiredText(args.title, "Task title");
    const description = normalizeOptionalText(args.description);
    validateTaskTimes(args.startAt, args.endAt);

    const replacement: Omit<Doc<"tasks">, "_id" | "_creationTime"> = {
      title,
      ...(description ? { description } : {}),
      project: args.projectId,
      startAt: args.startAt,
      ...(args.endAt !== undefined ? { endAt: args.endAt } : {}),
    };

    await ctx.db.replace(args.taskId, replacement);
    return await ctx.db.get(args.taskId);
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const { task } = await requireOwnedTask(ctx, userId, args.taskId);

    if (task.invoice) {
      throw new Error("Invoiced tasks cannot be deleted.");
    }

    await ctx.db.delete(args.taskId);
    return { deletedTaskId: task._id };
  },
});
