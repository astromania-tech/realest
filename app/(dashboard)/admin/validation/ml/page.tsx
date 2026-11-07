import { redirect } from "next/navigation";

/** Legacy list — Case queue (filter=review) is the front door. */
export default function MLReviewPage() {
  redirect("/admin/validation?filter=review");
}
