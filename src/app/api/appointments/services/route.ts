import { listServices } from "@/lib/server/appointments";
import { api } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/security";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return api(async () => {
    await rateLimit(request.headers, "availability", 180, 600);
    return listServices();
  });
}
