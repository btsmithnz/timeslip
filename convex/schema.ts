import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    country: v.string(),
    zip: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    user: v.string(), // Who owns the client
    archived: v.boolean(),
  }),
  projects: defineTable({
    name: v.string(),
    client: v.id("clients"),
    archived: v.boolean(),
  }),
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    project: v.id("projects"),
    invoice: v.optional(v.id("invoices")),
    startAt: v.number(),
    endAt: v.optional(v.number()),
  }),
  invoices: defineTable({
    amount: v.number(),
    paidAt: v.optional(v.number()),
    paymentInstruction: v.id("paymentInstructions"),
  }),
  paymentInstructions: defineTable({
    instructions: v.string(),
    name: v.string(),
    address: v.string(),
    city: v.string(),
    country: v.string(),
    zip: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    user: v.string(), // Who owns the payment instruction
  }),
});
