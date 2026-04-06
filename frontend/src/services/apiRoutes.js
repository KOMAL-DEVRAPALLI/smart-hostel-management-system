export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
  },

  STUDENTS: {
    ALL: "/api/students",
    ME:"/api/students/me",
    AUTO_ALLOCATE: "/api/students/auto-allocate-all",
  },

  ROOMS: {
    ALL: "/api/rooms",
  },

  FEES: {
    ALL: "/api/fees",
    BULK_GENERATE: "/api/fees/bulk-generate",
    PAYMENT: "/api/payment/order",
    VERIFY:"/api/payment/verify",
    RAZORPAY:"/api/payment/verify"
  },

  COMPLAINTS: {
    ALL: "/api/complaints",
    BY_ID: (id) => `/api/complaints/${id}`,
  },
};