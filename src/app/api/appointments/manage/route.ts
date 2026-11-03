import { manageBooking } from "@/lib/server/appointments";
import { api, readJson } from "@/lib/server/http";
import { checkOrigin, rateLimit } from "@/lib/server/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request.headers);
    await rateLimit(request.headers, "booking-manage");
    return manageBooking(await readJson(request));
  });
}
