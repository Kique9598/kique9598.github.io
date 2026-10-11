// components/Layout.tsx
import { Outlet } from "react-router-dom"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"
import { TerminalProvider } from "@/terminal/TerminalProvider"

export function Layout() {
  return (
    // Wraps every page so terminal output, history and page variables
    // survive navigation, and Header/Footer can react to commands too.
    <TerminalProvider>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </TerminalProvider>
  )
}
