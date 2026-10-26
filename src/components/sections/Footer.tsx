import SocialLinks from "@/components/SocialLinks"
import { Section, SectionMain } from "../ui/section"

const Footer = () => {
  return (
    <Section variant="footer">
      <SectionMain>
        <SocialLinks />
        <span className="text-textPrimary px-2 py-1 text-sm">
          Made with a{" "}
          <a
            href="https://youtu.be/tj0zr_xlSKg?si=8tXSXfys3dgAUGEu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary hover:underline"
          >
            dash of love
          </a>
        </span>
      </SectionMain>
    </Section>
  )
}

export default Footer
