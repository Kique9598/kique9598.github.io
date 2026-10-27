// sections/resume.tsx

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Section,
  SectionHeader,
  SectionMain,
} from "@/components/ui/section"
import narrative from "@/assets/documents/Johnston Narrative.pdf"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

type Tab = "experience" | "education"

type Entry = {
  title: string
  date?: string
  subtitle?: string
  body: string
  link?: { href: string; label: string }
}

const TABS: { id: Tab; label: string }[] = [
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
]

const CONTENT: Record<Tab, Entry[]> = {
  experience: [
    {
      title: "Founder and Developer, DIVVY",
      date: "Sep. '26 - Present",
      body: "Designed and built a receipt-splitting mobile app in React Native and Expo with Zustand and TanStack Query. Finished the first production-ready version in about a month.",
    },
    {
      title: "Web Developer, Liberty Film Festival",
      date: "Jun. '26 - Present",
      body: "Built the festival site in React, TypeScript and Tailwind with a config-driven, five-phase setup. Integrated FilmFreeway, Seed&Spark and Kit.",
    },
  ],
  education: [
    {
      title: "Columbia University",
      date: "2026",
      subtitle: "B.S. Computer Science",
      body: "Algorithms & Complexity, Data Structures, Computer Networks, Compilers, Databases, Cryptography, AI, Advanced C, C++, 3D UI/VR Development, Quantum Computing, Parallel Optimization, Web & Mobile Development",
    },
    {
      title: "University of Redlands",
      date: "2026",
      subtitle: "B.A. Organized Thought through Fundamental Systems",
      body: "I designed my own major combining physics, computer science and philosophy, then defended it before graduating with a narrative essay on how the three fit together.",
      link: { href: narrative, label: "Read my major narrative essay →" },
    },
  ],
}

export function ResumeSection() {
  const [tab, setTab] = useState<Tab>("experience")

  return (
    <Section>
      <SectionMain className="flex flex-col gap-8 md:flex-row md:gap-16">
        <div className="flex flex-col gap-4">
          <SectionHeader as="h2" title="Resume" />
          <div
            role="tablist"
            aria-label="Resume sections"
            className="flex gap-1 md:w-44 md:flex-col"
          >
            {TABS.map(({ id, label }) => (
              <Button
                key={id}
                role="tab"
                aria-selected={tab === id}
                size="lg"
                variant={tab === id ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setTab(id)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* key={tab} remounts this list on each switch, so the enter animation replays */}
        <div key={tab} role="tabpanel" className="flex flex-1 flex-col">
          {CONTENT[tab].map((entry, i) => (
            <div
              key={entry.title}
              className="animate-in duration-500 fill-mode-both fade-in slide-in-from-left-2"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Separator />
              <div className="flex flex-col gap-2 py-7">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h5>{entry.title}</h5>
                  {entry.date && (
                    <span className="type-caption">
                      {entry.date}
                    </span>
                  )}
                </div>
                {entry.subtitle && (
                  <p className="font-medium">{entry.subtitle}</p>
                )}
                <p>{entry.body}</p>
                {entry.link && (
                  <a
                    href={entry.link.href}
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: "link", size: "lg" }),
                      "text-default w-fit text-left"
                    )}
                  >
                    {entry.link.label}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionMain>
    </Section>
  )
}
