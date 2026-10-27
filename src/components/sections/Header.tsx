// components/Header.tsx
import NavBar from "../NavBar"
import SocialLinks from "../SocialLinks"
import { Section, SectionMain } from "../ui/section"

export default function Header() {
  return (
    <Section variant="header" className="pointer-events-none">
      <SectionMain>
        <div className="pointer-events-auto">
          <NavBar />
        </div>
        <div className="pointer-events-auto hidden sm:block">
          <SocialLinks enableScrollTransition />
        </div>
      </SectionMain>
    </Section>
  )
}
