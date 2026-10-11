// components/Layout.tsx
import { Outlet } from "react-router-dom"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
