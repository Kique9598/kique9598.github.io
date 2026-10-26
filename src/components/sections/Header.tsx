// components/Header.tsx
import NavBar from "../NavBar"
import SocialLinks from "../SocialLinks"
import { Section, SectionMain } from "../ui/section"

export default function Header() {
  return (
    <Section variant="header">
      <SectionMain>
        <NavBar />
        <div className="hidden sm:block">
          <SocialLinks enableScrollTransition />
        </div>
      </SectionMain>
    </Section>
  )
}
