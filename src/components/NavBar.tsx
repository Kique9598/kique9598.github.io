import { navLinks } from "@/config/routes"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import { NavLink } from "react-router-dom"
import DraggableStickerImage from "./DraggableStickerImage"
import logo from "@/assets/images/kique.svg"

const NavBar = () => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hoverStyle, setHoverStyle] = useState<CSSProperties>({})
  const [pressedIndex, setPressedIndex] = useState<number | null>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    if (hoverIndex !== null && linkRefs.current[hoverIndex]) {
      const linkElement = linkRefs.current[hoverIndex]
      const { offsetLeft, offsetWidth } = linkElement
      setHoverStyle({
        left: offsetLeft,
        width: offsetWidth,
        opacity: 1,
      })
    } else {
      setHoverStyle((prev) => ({ ...prev, opacity: 0 }))
    }
  }, [hoverIndex])

  const isPressed = pressedIndex !== null && pressedIndex === hoverIndex

  return (
    <nav className="flex w-fit items-center rounded-lg border border-border bg-background/80 p-1 shadow-lg backdrop-blur-md">
      <DraggableStickerImage
        src={logo}
        alt="Logo"
        className="h-7 cursor-pointer px-2 py-1"
        dragScale={1.2}
        returnSpeed={500}
        waveAmplitude={50}
        frequencyScaling={60}
        rotationDuration={300}
      />
      <div className="relative flex items-center">
        <div
          className="absolute rounded-md bg-muted"
          style={{
            height: "calc(100% - 4px)",
            top: "2px",
            ...hoverStyle,
            transform: `translateY(${isPressed ? "1px" : "0px"})`,
            transition:
              "left 300ms ease, width 300ms ease, opacity 300ms ease, transform 100ms ease",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {navLinks.map((page, i) => (
          <NavLink
            key={i}
            ref={(el) => {
              linkRefs.current[i] = el
            }}
            to={page.to}
            className={({ isActive }) =>
              "z-10 cursor-pointer rounded-md px-2 py-1 text-sm transition-all outline-none " +
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 " +
              "hover:text-foreground active:translate-y-px " +
              (isActive ? "text-foreground" : "text-muted-foreground")
            }
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => {
              setHoverIndex(null)
              setPressedIndex(null)
            }}
            onPointerDown={() => setPressedIndex(i)}
            onPointerUp={() => setPressedIndex(null)}
          >
            {page.name}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default NavBar
