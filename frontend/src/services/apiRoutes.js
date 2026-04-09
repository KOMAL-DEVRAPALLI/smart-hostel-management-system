export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
  },

  STUDENTS: {
  ALL: "/api/students",
  ME: "/api/students/me",
  AUTO_ALLOCATE: "/api/students/auto-allocate-all",
  ALLOCATE_ROOM: "/api/students/allocate-room",
  DEALLOCATE_ROOM: "/api/students/deallocate-room"
},

ROOMS: {
  ALL: "/api/rooms"
},

  FEES: {
    ALL: "/api/fees",
    BULK_GENERATE: "/api/fees/bulk-generate",
    UPDATE_STATUS: (id) => `/api/fees/${id}`
  },

  COMPLAINTS: {
    ALL: "/api/complaints",
    BY_ID: (id) => `/api/complaints/${id}`,
  },
  PAYMENT: {
  ORDER: "/api/payment/order",
  VERIFY: "/api/payment/verify"
},
DASHBOARD:{
  ALL:"/api/chart"
}
};