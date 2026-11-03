import { api, readJson } from "@/lib/server/http";
import { checkOrigin, requireAdmin } from "@/lib/server/security";
import { updateConfiguration } from "@/lib/server/configuration";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request.headers);
    await requireAdmin(request.headers);
    return updateConfiguration(await readJson(request));
  });
}
