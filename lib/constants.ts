export type AuthType = "disabled" | "basic" | "google_oauth" | "oidc" | "saml";

export const INTERNAL_URL =  "https://backend-dev.folder.chat/api";
export const NEXT_PUBLIC_DISABLE_STREAMING =
  process.env.NEXT_PUBLIC_DISABLE_STREAMING?.toLowerCase() === "true";

export const GOOGLE_DRIVE_AUTH_IS_ADMIN_COOKIE_NAME =
  "google_drive_auth_is_admin";

export const SEARCH_TYPE_COOKIE_NAME = "search_type";
