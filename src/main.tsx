import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

// iOS Safari only applies :active styles (our touch "hover") when the page
// has a touchstart listener, so register an empty one
document.addEventListener("touchstart", () => {}, { passive: true })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
