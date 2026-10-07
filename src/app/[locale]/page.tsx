import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function IndexPage() {
  redirect({ href: "/dashboard", locale: await getLocale() });
}
