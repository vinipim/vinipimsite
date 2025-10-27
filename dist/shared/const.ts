/**
 * Shared constants used across client and server
 */

export const UNAUTHED_ERR_MSG = "UNAUTHORIZED" as const;

export const APP_NAME = "Vinipim Portfolio" as const;
export const APP_DESCRIPTION = "Personal portfolio and blog";
export const API_URL = process.env.VITE_API_URL || "/api";

export const NOT_ADMIN_ERR_MSG = "Not an admin";

export const COOKIE_NAME = "session";
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const DEFAULT_PAGE_SIZE = 20 as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
