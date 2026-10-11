import { Section } from "@/components/ui/section"
import { routes } from "@/config/routes"
import { useTitle } from "@/hooks/useTitle"

export default function Home() {
  useTitle(routes.divvy.title)
  return <Section>Divvy</Section>
}
