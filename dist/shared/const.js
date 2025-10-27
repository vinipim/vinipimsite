const UNAUTHED_ERR_MSG = "UNAUTHORIZED";
const APP_NAME = "Vinipim Portfolio";
const APP_DESCRIPTION = "Personal portfolio and blog";
const API_URL = process.env.VITE_API_URL || "/api";
const NOT_ADMIN_ERR_MSG = "Not an admin";
const COOKIE_NAME = "session";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1e3;
const DEFAULT_PAGE_SIZE = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif"
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg"
];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];
export {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  API_URL,
  APP_DESCRIPTION,
  APP_NAME,
  COOKIE_NAME,
  DEFAULT_PAGE_SIZE,
  MAX_FILE_SIZE,
  NOT_ADMIN_ERR_MSG,
  ONE_YEAR_MS,
  UNAUTHED_ERR_MSG
};
