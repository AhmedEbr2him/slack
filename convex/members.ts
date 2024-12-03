import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { query, QueryCtx } from './_generated/server';
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
