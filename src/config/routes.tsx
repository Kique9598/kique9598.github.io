import NotFound from "@/pages/NotFound.tsx"
import Divvy from "../pages/Divvy.tsx"
import Games from "../pages/Games.tsx"
import Home from "../pages/Home.tsx"
import Projects from "../pages/Projects.tsx"
import type { ComponentType } from "react"

type RouteConfig = {
  path: string
  title: string
  name?: string
  showInNav: boolean
  element: ComponentType
}

export const routes = {
  index: {
    path: "/",
    title: "Enrique Alverde",
    name: "Home",
    showInNav: true,
    element: Home,
  },
  projects: {
    path: "/projects",
    title: "Enrique - Projects",
    name: "Projects",
    showInNav: true,
    element: Projects,
  },
  games: {
    path: "/games",
    title: "Enrique - Games",
    name: "Games",
    showInNav: true,
    element: Games,
  },
  divvy: {
    path: "/divvy",
    title: "Enrique - Divvy",
    name: "Divvy",
    showInNav: true,
    element: Divvy,
  },
  notFound: {
    path: "*",
    title: "Page not found",
    showInNav: false,
    element: NotFound,
  },
} as const satisfies Record<string, RouteConfig>

export const navLinks = Object.values(routes)
  .filter((route) => route.showInNav)
  .map(({ path, name }) => ({ to: path, name }))
