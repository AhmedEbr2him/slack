import { v } from 'convex/values';

import { auth } from './auth';
import { mutation, type QueryCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) => {
  return ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();

}
export const create = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    };

    const member = await getMember(ctx, args.workspaceId, userId);

    if (!member) {
      throw new Error("Unauthorized");
    };

    // conversation id we can't gets it from other way
    let _conversationId = args.conversationId;

    // only possible if we are replying in a thread in 1:1 conversation
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);

      if (!parentMessage) {
        throw new Error("Parent message not found");
      };

      _conversationId = parentMessage.conversationId;
    }

    const messageId = await ctx.db
      .insert("messages", {
        memberId: member._id,
        workspaceId: args.workspaceId,
        channelId: args.channelId,
        parentMessageId: args.parentMessageId,
        conversationId: _conversationId,
        body: args.body,
        image: args.image,
        updatedAt: Date.now(),
      });

    return messageId;
  }
})