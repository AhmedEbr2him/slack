import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { mutation, query, QueryCtx } from './_generated/server';
import { auth } from './auth';

const populatedUser = (ctx: QueryCtx, id: Id<'users'>) => {
	return ctx.db.get(id);
};

export const getById = query({
	args: { id: v.id("members") },
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);

		if (!userId) {
			return null;
		};

		const member = await ctx.db.get(args.id);

		if (!member) {
			return null;
		};

		// ensuring current user is already a part of this workspace
		const currentMember = await ctx.db
			.query("members")
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', member.workspaceId).eq('userId', userId)
			);

		if (!currentMember) {
			return null;
		};

		const user = await populatedUser(ctx, member.userId);

		if (!user) {
			return null;
		};

		return {
			...member,
			user
		};
	}
})
export const get = query({
	args: { workspaceId: v.id('workspaces') },

	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);

		if (!userId) {
			return [];
		}

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', q =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member) return [];

		// get worksspace that has a worksapace + members
		const data = await ctx.db
			.query('members')
			.withIndex('by_workspace_id', q => q.eq('workspaceId', args.workspaceId))
			.collect();

		// load our members that is inside the workspace it created first time
		const members = [];

		for (const member of data) {
			const user = await populatedUser(ctx, member.userId);

			if (user) {
				// push old member plus new member
				members.push({
					...member,
					user,
				});
			}
		}

		return members;
	},
});

export const current = query({
	args: { workspaceId: v.id('workspaces') },
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);

		if (!userId) {
			return null;
		}

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', q =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member) return null;

		return member;
	},
});

export const update = mutation({
	args: {
		id: v.id("members"),
		role: v.union(v.literal("admin"), v.literal("member")),
	},
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);

		if (!userId) {
			throw new Error("Unauthorized");
		};

		const member = await ctx.db.get(args.id);

		if (!member) {
			throw new Error("Member not found");
		};

		const currentMember = await ctx.db
			.query("members")
			.withIndex('by_workspace_id_user_id', q =>
				q.eq('workspaceId', member.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!currentMember || currentMember.role !== 'admin') {
			throw new Error("Unauthorized");
		};

		await ctx.db.patch(args.id, {
			role: args.role,
		});

		return args.id;
	}
});


export const remove = mutation({
	args: {
		id: v.id("members"),
	},
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);

		if (!userId) {
			throw new Error("Unauthorized");
		};

		const member = await ctx.db.get(args.id);

		if (!member) {
			throw new Error("Member not found");
		};

		const currentMember = await ctx.db
			.query("members")
			.withIndex('by_workspace_id_user_id', q =>
				q.eq('workspaceId', member.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!currentMember) {
			throw new Error("Unauthorized");
		};

		if (member.role === 'admin') {
			throw new Error("Admin can not be removed");
		};

		// try to remove ourselfs from workspace
		if (currentMember._id === args.id && currentMember.role === 'admin') {
			throw new Error("Cannot remove self is an admin");
		};

		// remove all relations for this member to workspace or channel
		const [messages, reactions, conversations] = await Promise.all([
			ctx.db
				.query('messages')
				.withIndex('by_member_id', q => q.eq('memberId', member._id))
				.collect(),
			ctx.db
				.query('reactions')
				.withIndex('by_member_id', q => q.eq('memberId', member._id))
				.collect(),
			ctx.db
				.query('conversations')
				.filter((q) => q.or(
					q.eq(q.field('memberOneId'), member._id),
					q.eq(q.field('memberTwoId'), member._id)
				))
				.collect(),
		]);

		for (const message of messages) {
			await ctx.db.delete(message._id);
		};

		for (const reaction of reactions) {
			await ctx.db.delete(reaction._id);
		};

		for (const conversation of conversations) {
			await ctx.db.delete(conversation._id);
		};

		await ctx.db.delete(args.id);

		return args.id;
	}
})