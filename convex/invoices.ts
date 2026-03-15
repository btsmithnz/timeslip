import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { authComponent } from "./auth";

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

function byNameAsc(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function validateDateRange(startAt: number, endAt: number) {
  if (!Number.isFinite(startAt)) {
    throw new Error("Start date is invalid.");
  }

  if (!Number.isFinite(endAt)) {
    throw new Error("End date is invalid.");
  }

  if (endAt < startAt) {
    throw new Error("End date must be on or after start date.");
  }
}

export const invoiceFormOptions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const clients = (
      await ctx.db
        .query("clients")
        .withIndex("by_user", (q) => q.eq("user", userId))
        .collect()
    )
      .filter((client) => !client.archived)
      .sort(byNameAsc);

    const projectsNested = await Promise.all(
      clients.map((client) =>
        ctx.db
          .query("projects")
          .withIndex("by_client", (q) => q.eq("client", client._id))
          .collect(),
      ),
    );

    const projects = projectsNested
      .flat()
      .filter((project) => !project.archived)
      .sort(byNameAsc);

    return {
      clients: clients.map((client) => ({
        _id: client._id,
        name: client.name,
      })),
      projects: projects.map((project) => ({
        _id: project._id,
        name: project.name,
        client: project.client,
      })),
    };
  },
});

export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const page = await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("user", userId))
      .order("desc")
      .paginate(args.paginationOpts);

    const pageWithRelations = await Promise.all(
      page.page.map(async (invoice) => {
        const client = await ctx.db.get(invoice.client);
        const project = invoice.project ? await ctx.db.get(invoice.project) : null;

        return {
          ...invoice,
          clientName:
            client && client.user === userId ? client.name : "Unknown client",
          projectName:
            project && project.client === invoice.client ? project.name : null,
        };
      }),
    );

    return {
      ...page,
      page: pageWithRelations,
    };
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    projectId: v.optional(v.id("projects")),
    startAt: v.number(),
    endAt: v.number(),
  },
  handler: async (ctx, args) => {
    validateDateRange(args.startAt, args.endAt);

    const userId = await requireUserId(ctx);
    const client = await requireOwnedClient(ctx, userId, args.clientId);

    let projectId: Id<"projects"> | undefined;
    if (args.projectId) {
      const { project } = await requireOwnedProject(ctx, userId, args.projectId);
      if (project.client !== client._id) {
        throw new Error("Project must belong to the selected client.");
      }
      projectId = project._id;
    }

    const paymentInstruction = await ctx.db
      .query("paymentInstructions")
      .withIndex("by_user", (q) => q.eq("user", userId))
      .first();

    const invoiceId = await ctx.db.insert("invoices", {
      user: userId,
      client: client._id,
      ...(projectId ? { project: projectId } : {}),
      startAt: args.startAt,
      endAt: args.endAt,
      amount: 0,
      ...(paymentInstruction
        ? { paymentInstruction: paymentInstruction._id }
        : {}),
    });

    return await ctx.db.get(invoiceId);
  },
});
