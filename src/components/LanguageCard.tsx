import React from "react"
import {
  BiLogoCPlusPlus,
  BiLogoJava,
  BiLogoJavascript,
  BiLogoTypescript,
  BiLogoReact,
  BiLogoPostgresql,
  BiLogoPython,
  BiLogoHtml5,
  BiLogoCss3,
  BiLogoGit,
  BiLogoNodejs,
} from "react-icons/bi"
import { RiSupabaseLine } from "react-icons/ri"
import { SiExpo } from "react-icons/si"
import { FaRust } from "react-icons/fa6"

interface LanguageCardProps {
  language: string
}

const LanguageCard = ({ language }: LanguageCardProps) => {
  const languageIcon: Record<string, React.ReactNode> = {
    "C++": <BiLogoCPlusPlus className="text-muted-foreground/60" size={20} />,
    Java: <BiLogoJava className="text-muted-foreground/60" size={20} />,
    Javascript: (
      <BiLogoJavascript className="text-muted-foreground/60" size={20} />
    ),
    Typescript: (
      <BiLogoTypescript className="text-muted-foreground/60" size={20} />
    ),
    React: <BiLogoReact className="text-muted-foreground/60" size={20} />,
    PostgreSQL: (
      <BiLogoPostgresql className="text-muted-foreground/60" size={20} />
    ),
    Python: <BiLogoPython className="text-muted-foreground/60" size={20} />,
    Rust: <FaRust className="text-muted-foreground/60" size={20} />,
    HTML: <BiLogoHtml5 className="text-muted-foreground/60" size={20} />,
    CSS: <BiLogoCss3 className="text-muted-foreground/60" size={20} />,
    Git: <BiLogoGit className="text-muted-foreground/60" size={20} />,
    Node: <BiLogoNodejs className="text-muted-foreground/60" size={20} />,
    Supabase: <RiSupabaseLine className="text-muted-foreground/60" size={20} />,
    Expo: <SiExpo className="text-muted-foreground/60" size={20} />,
  }

  return (
    <div className="flex rounded-lg border border-border bg-background p-1 shadow-xs transition-all select-none hover:-translate-y-0.5">
      <div className="flex items-center gap-1.5 px-2 py-1">
        {languageIcon[language]}
        <span className="text-sm leading-none font-medium">{language}</span>
      </div>
    </div>
  )
}

export default LanguageCard
