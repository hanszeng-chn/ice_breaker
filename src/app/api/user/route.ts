import { scrapeLinkedInProfile } from "@/support/linkedin";

export const dynamic = "force-dynamic";
export async function GET() {
  const data = await scrapeLinkedInProfile("eden-marco");

  // console.log("data", data);
  return Response.json(data);
}
