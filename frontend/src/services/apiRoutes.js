export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
  },

  STUDENTS: {
    ALL: "/api/students",
    AUTO_ALLOCATE: "/api/students/auto-allocate-all",
  },

  ROOMS: {
    ALL: "/api/rooms",
  },

  FEES: {
    ALL: "/api/fees",
    BULK_GENERATE: "/api/fees/bulk-generate",
  },

  COMPLAINTS: {
    ALL: "/api/complaints",
    BY_ID: (id) => `/api/complaints/${id}`,
  },
};