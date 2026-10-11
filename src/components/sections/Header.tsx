// components/Header.tsx
import NavBar from "../NavBar"
import SocialLinks from "../SocialLinks"
import { Section } from "../ui/section"

export default function Header() {
  return (
    <Section variant="header">
      <NavBar />
      <div className="hidden sm:block">
        <SocialLinks enableScrollTransition />
      </div>
    </Section>
  )
}
