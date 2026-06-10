const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Booking App API",
    version: "1.0.0",
    description:
      "Swagger documentation for the booking application API. Most protected routes use a Bearer JWT token.",
  },
  servers: [
    {
      url: "http://20.2.233.219:3000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication and role checks" },
    { name: "Posts", description: "Simple post endpoints" },
    { name: "Users", description: "User management" },
    { name: "Services", description: "Service catalog" },
    { name: "Providers", description: "Provider listing and management" },
    { name: "Schedules", description: "Service schedules" },
    { name: "Slots", description: "Bookable time slots" },
    { name: "Bookings", description: "Booking lifecycle" },
    { name: "Customers", description: "Customer-specific endpoints" },
    { name: "My Bookings", description: "Authenticated booking history" },
    { name: "Payments", description: "Payment records and simulation" },
    { name: "Pricing", description: "Dynamic pricing and rules" },
    { name: "Dashboard", description: "Role-based dashboard summaries" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/api/auth": {
      get: {
        tags: ["Auth"],
        summary: "Check auth route",
        responses: {
          200: { description: "Auth route is active" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Alya" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "alya@example.com",
                  },
                  password: { type: "string", example: "secret123" },
                  role: { type: "string", example: "customer" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Register berhasil" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login berhasil" },
          400: { description: "Validation error" },
          401: { description: "Password salah" },
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Get the current user profile",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Profile berhasil diakses" } },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Blacklist the current token",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Logout berhasil" } },
      },
    },
    "/api/auth/admin": {
      get: {
        tags: ["Auth"],
        summary: "Admin-only test route",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Welcome Admin!" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/auth/provider": {
      get: {
        tags: ["Auth"],
        summary: "Provider-only test route",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Welcome Provider!" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/posts": {
      get: {
        tags: ["Posts"],
        summary: "List posts",
        responses: { 200: { description: "List of posts" } },
      },
      post: {
        tags: ["Posts"],
        summary: "Create a post",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Post created" } },
      },
    },
    "/api/posts/{id}": {
      delete: {
        tags: ["Posts"],
        summary: "Delete a post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Post deleted" } },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Data semua user" } },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Detail user" } },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "role"],
                properties: {
                  name: { type: "string" },
                  role: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "User berhasil diupdate" } },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "User berhasil dihapus" } },
      },
    },
    "/api/services": {
      get: {
        tags: ["Services"],
        summary: "List services",
        responses: { 200: { description: "Data services" } },
      },
      post: {
        tags: ["Services"],
        summary: "Create a service",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["category_id", "name", "price", "duration"],
                properties: {
                  category_id: { type: "integer" },
                  provider_id: { type: "integer" },
                  name: { type: "string" },
                  slug: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  duration: { type: "number" },
                  image_url: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Service berhasil dibuat" } },
      },
    },
    "/api/services/{id}": {
      get: {
        tags: ["Services"],
        summary: "Get service by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Detail service" } },
      },
      put: {
        tags: ["Services"],
        summary: "Update service",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  category_id: { type: "integer" },
                  provider_id: { type: "integer" },
                  name: { type: "string" },
                  slug: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  duration: { type: "number" },
                  image_url: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Service berhasil diupdate" } },
      },
      delete: {
        tags: ["Services"],
        summary: "Delete service",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Service berhasil dihapus" } },
      },
    },
    "/api/providers": {
      get: {
        tags: ["Providers"],
        summary: "List providers",
        responses: { 200: { description: "Data providers" } },
      },
      post: {
        tags: ["Providers"],
        summary: "Create provider",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Provider berhasil dibuat" } },
      },
    },
    "/api/providers/{id}": {
      get: {
        tags: ["Providers"],
        summary: "Get provider by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Detail provider" } },
      },
      put: {
        tags: ["Providers"],
        summary: "Update provider",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Provider berhasil diupdate" } },
      },
      delete: {
        tags: ["Providers"],
        summary: "Delete provider",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Provider berhasil dihapus" } },
      },
    },
    "/api/schedules": {
      get: {
        tags: ["Schedules"],
        summary: "List service schedules",
        responses: { 200: { description: "Data jadwal layanan" } },
      },
      post: {
        tags: ["Schedules"],
        summary: "Create schedule",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "provider_id",
                  "service_id",
                  "day",
                  "start_time",
                  "end_time",
                ],
                properties: {
                  provider_id: { type: "integer" },
                  service_id: { type: "integer" },
                  day: { type: "string", example: "monday" },
                  start_time: { type: "string", format: "date-time" },
                  end_time: { type: "string", format: "date-time" },
                  is_available: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Jadwal layanan berhasil dibuat" } },
      },
    },
    "/api/schedules/{id}": {
      get: {
        tags: ["Schedules"],
        summary: "Get schedule by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Detail jadwal layanan" } },
      },
      put: {
        tags: ["Schedules"],
        summary: "Update schedule",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  provider_id: { type: "integer" },
                  service_id: { type: "integer" },
                  day: { type: "string", example: "monday" },
                  start_time: { type: "string", format: "date-time" },
                  end_time: { type: "string", format: "date-time" },
                  is_available: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Jadwal layanan berhasil diupdate" } },
      },
      delete: {
        tags: ["Schedules"],
        summary: "Delete schedule",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Jadwal layanan berhasil dihapus" } },
      },
    },
    "/api/slots": {
      get: {
        tags: ["Slots"],
        summary: "List time slots",
        responses: { 200: { description: "Data slot waktu" } },
      },
      post: {
        tags: ["Slots"],
        summary: "Create slot",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "provider_id",
                  "service_id",
                  "slot_date",
                  "start_time",
                  "end_time",
                ],
                properties: {
                  provider_id: { type: "integer" },
                  service_id: { type: "integer" },
                  slot_date: { type: "string", example: "2026-06-10" },
                  start_time: { type: "string", format: "date-time" },
                  end_time: { type: "string", format: "date-time" },
                  status: { type: "string", example: "available" },
                  capacity: { type: "integer" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Slot waktu berhasil dibuat" } },
      },
    },
    "/api/slots/available": {
      get: {
        tags: ["Slots"],
        summary: "List available slots",
        responses: { 200: { description: "Data slot waktu tersedia" } },
      },
    },
    "/api/slots/{id}": {
      put: {
        tags: ["Slots"],
        summary: "Update slot",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  provider_id: { type: "integer" },
                  service_id: { type: "integer" },
                  slot_date: { type: "string", example: "2026-06-10" },
                  start_time: { type: "string", format: "date-time" },
                  end_time: { type: "string", format: "date-time" },
                  status: { type: "string" },
                  capacity: { type: "integer" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Slot waktu berhasil diupdate" } },
      },
      delete: {
        tags: ["Slots"],
        summary: "Block slot",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Slot waktu berhasil diblokir" } },
      },
    },
    "/api/bookings": {
      get: {
        tags: ["Bookings"],
        summary: "List bookings",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Data booking" } },
      },
      post: {
        tags: ["Bookings"],
        summary: "Create booking",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["service_id"],
                properties: {
                  service_id: { type: "integer" },
                  provider_id: { type: "integer" },
                  slot_id: { type: "integer" },
                  start_time: { type: "string", format: "date-time" },
                  end_time: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Booking berhasil dibuat" } },
      },
    },
    "/api/bookings/check-availability": {
      get: {
        tags: ["Bookings"],
        summary: "Check booking availability",
        responses: { 200: { description: "Hasil pengecekan ketersediaan" } },
      },
      post: {
        tags: ["Bookings"],
        summary: "Check booking availability with payload",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  service_id: { type: "integer" },
                  provider_id: { type: "integer" },
                  slot_id: { type: "integer" },
                  start_time: { type: "string", format: "date-time" },
                  end_time: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Hasil pengecekan ketersediaan" } },
      },
    },
    "/api/bookings/{id}": {
      get: {
        tags: ["Bookings"],
        summary: "Get booking by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Detail booking" } },
      },
      put: {
        tags: ["Bookings"],
        summary: "Update booking status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", example: "confirmed" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Status booking berhasil diupdate" } },
      },
      delete: {
        tags: ["Bookings"],
        summary: "Cancel booking",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Booking berhasil dibatalkan" } },
      },
    },
    "/api/bookings/{id}/cancel": {
      patch: {
        tags: ["Bookings"],
        summary: "Cancel booking with reason",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  reason: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Booking berhasil dibatalkan" } },
      },
    },
    "/api/customers/{id}/booking-history": {
      get: {
        tags: ["Customers"],
        summary: "Get customer booking history",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Riwayat booking customer" } },
      },
    },
    "/api/my-bookings": {
      get: {
        tags: ["My Bookings"],
        summary: "Get authenticated user bookings",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Data booking saya" } },
      },
    },
    "/api/payments": {
      get: {
        tags: ["Payments"],
        summary: "List payments",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Data payment" } },
      },
    },
    "/api/payments/simulate": {
      post: {
        tags: ["Payments"],
        summary: "Simulate payment creation",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["booking_id"],
                properties: {
                  booking_id: { type: "integer" },
                  method: { type: "string", example: "transfer" },
                  force_status: { type: "string", example: "failed" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Simulasi payment berhasil" } },
      },
    },
    "/api/payments/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get payment by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Detail payment" } },
      },
    },
    "/api/payments/{id}/refund": {
      patch: {
        tags: ["Payments"],
        summary: "Refund payment",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { reason: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "Refund berhasil" } },
      },
    },
    "/api/pricing/calculate": {
      post: {
        tags: ["Pricing"],
        summary: "Calculate dynamic pricing",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["service_id", "provider_id", "start_time"],
                properties: {
                  service_id: { type: "integer" },
                  provider_id: { type: "integer" },
                  start_time: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Hasil kalkulasi harga" } },
      },
    },
    "/api/pricing/rules": {
      get: {
        tags: ["Pricing"],
        summary: "List pricing rules",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Data pricing rules" } },
      },
      post: {
        tags: ["Pricing"],
        summary: "Create pricing rule",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "rule_type", "adjustment_value"],
                properties: {
                  name: { type: "string" },
                  rule_type: { type: "string", example: "weekend" },
                  adjustment_type: { type: "string", example: "percentage" },
                  adjustment_value: { type: "number" },
                  conditions: { type: ["object", "string"] },
                  is_active: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Pricing rule berhasil dibuat" } },
      },
    },
    "/api/pricing/rules/{id}": {
      put: {
        tags: ["Pricing"],
        summary: "Update pricing rule",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  rule_type: { type: "string" },
                  adjustment_type: { type: "string" },
                  adjustment_value: { type: "number" },
                  conditions: { type: ["object", "string"] },
                  is_active: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Pricing rule berhasil diupdate" } },
      },
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Dashboard summary",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Dashboard data" } },
      },
    },
    "/api/dashboard/admin": {
      get: {
        tags: ["Dashboard"],
        summary: "Admin dashboard summary",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Admin dashboard data" } },
      },
    },
    "/api/dashboard/provider": {
      get: {
        tags: ["Dashboard"],
        summary: "Provider dashboard summary",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Provider dashboard data" } },
      },
    },
    "/api/dashboard/revenue": {
      get: {
        tags: ["Dashboard"],
        summary: "Revenue summary",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Revenue data" } },
      },
    },
    "/api/dashboard/bookings": {
      get: {
        tags: ["Dashboard"],
        summary: "Booking summary",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Booking dashboard data" } },
      },
    },
  },
};

module.exports = swaggerDocument;
