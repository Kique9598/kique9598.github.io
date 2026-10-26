import { BrowserRouter, Routes, Route } from "react-router-dom"
import { routes } from "./config/routes.tsx"
import { Layout } from "./components/Layout.tsx"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {Object.values(routes).map(({ path, element: El }) => (
            <Route key={path} path={path} element={<El />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
