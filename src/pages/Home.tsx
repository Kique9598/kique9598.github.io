import { routes } from "@/config/routes"
import { useTitle } from "@/hooks/useTitle"
import { Section } from "@/components/ui/section"
import Terminal from "@/components/Terminal"
import { Separator } from "@/components/ui/separator"
import LanguageCard from "@/components/LanguageCard"
import { ResumeSection } from "@/components/sections/ResumeSection"
import divvyMockup from "@/assets/images/divvy_mockup.png"
import { ProjectCard } from "@/components/ProjectCard"

export default function Home() {
  useTitle(routes.index.title)
  return (
    <>
      <Section variant="hero">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">Enrique Alverde</h1>
          <p className="mt-3 text-2xl text-muted-foreground">
            Software Engineer in San Diego, CA
          </p>
        </div>
        <Separator />
        <div className="flex flex-row gap-16">
          <div className="flex flex-1">
            <p>
              I studied Computer Science at Columbia University, after designing
              my own major at the University of Redlands that combined physics,
              computer science and philosophy to study how complex systems are
              organized. That mix shapes how I work. I like understanding the
              whole system before changing one piece of it, and I care as much
              about who software is for as how it's built.
              <br />
              <br />I want to spend my career engineering for people: public
              services, nonprofits and civic tech, where good software decides
              how quickly someone gets the help they need. I'm looking for
              implementation, solutions or software engineering roles where I
              work directly with the people who use what I build.
            </p>
          </div>
          <div className="hidden flex-1 md:flex">
            <Terminal />
          </div>
        </div>
        {/* Languages Section */}
        <div className="flex flex-col gap-3">
          <h4>My Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            <LanguageCard language={"C++"} />
            <LanguageCard language={"Java"} />
            <LanguageCard language={"Javascript"} />
            <LanguageCard language={"Typescript"} />
            <LanguageCard language={"React"} />
            <LanguageCard language={"Python"} />
            <LanguageCard language={"HTML"} />
            <LanguageCard language={"CSS"} />
            <LanguageCard language={"Git"} />
            <LanguageCard language={"PostgreSQL"} />
            <LanguageCard language={"Node"} />
            <LanguageCard language={"Supabase"} />
            <LanguageCard language={"Expo"} />
          </div>
        </div>
      </Section>
      <Section>
        <ProjectCard
          variant="featured"
          href="/divvy"
          title="DIVVY"
          description="Group dinners, trips, tabs. Split fairly without the mental math or awkward follow-ups. Snap a receipt, tap names onto items, and DIVVY handles the rest."
          meta="First version shipped October 2026"
          tech={["React Native", "Expo", "TypeScript", "Supabase"]}
          image={{
            src: divvyMockup,
            alt: "DIVVY receipt screen with items split between friends",
          }}
        />
      </Section>
      <ResumeSection />
    </>
  )
}
