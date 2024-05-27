/**
 * This error is thrown when a query to the api returns a 404 status code.
 */
export class NotFoundError extends Error {}

/**
 * This error is thrown when an api calls returns a 401 status code.
 */
export class UnauthorizedError extends Error {}

/**
 * This error is thrown when the user is not authorized to view the requested resource.
 */
export class ForbiddenError extends Error {}

export class AuthenticationError extends Error {}
