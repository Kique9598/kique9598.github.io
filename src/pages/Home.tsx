import { routes } from "@/config/routes"
import { useTitle } from "@/hooks/useTitle"
import { Section } from "@/components/ui/section"
import Terminal from "@/components/Terminal"
import { Reveal } from "@/components/Reveal"
import Hero from "@/components/sections/Hero"
import SocialLinks from "@/components/SocialLinks"

export default function Home() {
  useTitle(routes.index.title)
  return (
    <>
      {/* `reveal hero` shows this; running it again makes it flash */}
      <Reveal when="hero">
        <Hero />
      </Reveal>

      <Section contentClassName="flex flex-col gap-6">
        <Terminal />

        <Reveal when="socials" className="self-center">
          <SocialLinks />
        </Reveal>

        {/* unlocked by the hidden `secret` command */}
        <Reveal when="secret" className="self-center">
          <p className="px-4 py-2 text-sm text-muted-foreground">
            You found the secret. Replace me with something worth finding.
          </p>
        </Reveal>
      </Section>
    </>
  )
}
