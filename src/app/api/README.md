# Stage 6 API contracts

Node.js Route Handlers share the server data layer with Server Actions. Responses are {ok:true,data} or {ok:false,error:{code,message}}, with private/no-store headers. Errors omit Prisma/SQL internals. Mutations accept JSON up to 16 KiB and reject untrusted browser origins. Absent Origin permits non-browser clients; schema validation, limiting and required authorization still apply.

| Endpoint                           | Method     | Input / access                                                                |
| ---------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| /api/appointments/services         | GET        | Enabled services; sample records excluded in production                       |
| /api/appointments/availability     | GET        | serviceId; optional from (Harare date), days 1–56                             |
| /api/appointments/validate         | POST       | {serviceId,date,time}; advisory selection check                               |
| /api/appointments                  | POST       | {request,idempotencyKey}; UUID key and booking fields                         |
| /api/appointments/manage           | POST       | {reference,token,expectedVersion,operation,date?,time?}; cancel or reschedule |
| /api/bespoke-enquiries             | POST       | {request,idempotencyKey}; enquiry fields, no uploads                          |
| /api/admin/appointments/:reference | GET, PATCH | Verified Supabase bearer token and enabled AdminUser                          |
| /api/admin/configuration           | POST       | Same guard; discriminated kind schema in configuration.ts                     |
| /api/admin/enquiries               | GET, PATCH | Same guard; status filter, at most 50 results; update reference/status        |

Booking fields: serviceId,date,time,fullName,email,phone,eventDate,notes. Dates use YYYY-MM-DD; time uses HH:mm in Africa/Harare. Optional eventDate/notes use empty strings. Management returns a receipt and latest version; initial submission additionally returns a private token. Never log tokens or put them in URLs. No public-reference-only customer lookup exists.

Admin appointment PATCH accepts operation (status/cancel/reschedule), expectedVersion and associated status or date/time. Invalid transitions fail. Configuration supports service, staff, availability, block, remove-block, collection and product. Local image paths only. Both administrator roles currently have identical permissions. No public administrator provisioning or dashboard exists.

Write limit: 8 per 15 minutes per scope; availability: 180 per 10 minutes; admin auth: 60 per 10 minutes. Buckets are shared without a trusted proxy header. Notifications are queued only; no sender exists. The Bespoke browser page retains manual WhatsApp handoff and does not call the enquiry API.
