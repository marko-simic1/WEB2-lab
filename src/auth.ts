import { requiresAuth } from "express-openid-connect";
export const requireLogin = requiresAuth();
import { auth as oidcAuth } from "express-openid-connect";
import { auth as jwtAuth, requiredScopes } from "express-oauth2-jwt-bearer";

export const oidc = oidcAuth({
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: process.env.SESSION_SECRET,
});

export const jwtCheck = jwtAuth({
    audience: process.env.AUTH0_AUDIENCE as string,
    issuerBaseURL: (process.env.AUTH0_ISSUER_BASE_URL || process.env.ISSUER_BASE_URL) as string,
});

export const requireManage = requiredScopes("rounds:manage");
