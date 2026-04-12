import { cookies } from "next/headers"

/** Prefix to locale routes after sign-out. */
export async function getLocalePathPrefix(): Promise<string> {
  const locale = (await cookies()).get("NEXT_LOCALE")?.value
  return locale === "pt" ? "/pt" : ""
}
