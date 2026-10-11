import { routes } from "@/config/routes"
import { useTitle } from "@/hooks/useTitle"
import { Section } from "@/components/ui/section"
import Terminal from "@/components/Terminal"

export default function Home() {
  useTitle(routes.index.title)
  return (
    <Section>
      <Terminal />
    </Section>
  )
}
