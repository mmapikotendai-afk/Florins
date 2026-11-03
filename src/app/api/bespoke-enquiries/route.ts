import { submitEnquiry } from "@/lib/server/enquiries";
import { api, readJson } from "@/lib/server/http";
import { checkOrigin, rateLimit } from "@/lib/server/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request.headers);
    await rateLimit(request.headers, "enquiry-write");
    return submitEnquiry(await readJson(request));
  });
}
