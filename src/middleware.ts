import {
	convexAuthNextjsMiddleware,
	createRouteMatcher,
	isAuthenticatedNextjs,
	nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server';

const isPublicPage = createRouteMatcher(['/auth']);

export default convexAuthNextjsMiddleware(request => {
	// REDIRECT TO AUTH PAGE IF USER TRY TO ACCESS ANY ROUTE OF APP
	if (!isPublicPage(request) && !isAuthenticatedNextjs()) {
		return nextjsMiddlewareRedirect(request, '/auth');
	}

	// REDIRECT TO HOME PAGE IF USER LOGING SUCCESS
	if (isPublicPage(request) && isAuthenticatedNextjs()) {
		return nextjsMiddlewareRedirect(request, '/');
	}
});

export const config = {
	// The following matcher runs middleware on all routes
	// except static assets.
	matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
