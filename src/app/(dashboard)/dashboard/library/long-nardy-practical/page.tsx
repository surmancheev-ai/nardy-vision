import { redirect } from "next/navigation";
import { getLongNardyTextbook } from "@/server/content/long-nardy-textbook";

export default async function LongNardyPracticalPage() {
  const material = await getLongNardyTextbook();
  const firstSection = material.sections[0];

  if (!firstSection) {
    redirect("/dashboard/library");
  }

  redirect(firstSection.href);
}
