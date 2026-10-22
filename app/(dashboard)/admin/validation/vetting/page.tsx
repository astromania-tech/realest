import { redirect } from "next/navigation";

/** Legacy list — Case queue (filter=field) is the front door. */
export default function VettingPage() {
  redirect("/admin/validation?filter=field");
}
