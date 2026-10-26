import React, { useState, useRef, useEffect, type PointerEvent } from "react"

interface DraggableStickerImageProps {
  src: string
  alt?: string
  className?: string
  dragScale?: number
  returnSpeed?: number
  waveAmplitude?: number
  frequencyScaling?: number
  rotationDuration?: number
  onDragStart?: () => void
  onDragEnd?: () => void
}

interface Position {
  x: number
  y: number
}

/**
 * Easing function for smooth deceleration: starts fast, slows to a stop.
 * Takes progress from 0 to 1 and returns eased progress from 0 to 1.
 */
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Rotate a point around (0, 0) by an angle in radians
 */
const rotatePoint = (point: Position, angle: number): Position => {
  return {
    x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
    y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
  }
}

const toDegrees = (radians: number): number => radians * (180 / Math.PI)

/**
 * DraggableStickerImage - An interactive image component that follows the cursor when dragged
 * and returns to its origin with a sine wave animation
 */
const DraggableStickerImage: React.FC<DraggableStickerImageProps> = ({
  src,
  alt = "Draggable image",
  className,
  dragScale = 1.1,
  returnSpeed = 500,
  waveAmplitude = 75,
  frequencyScaling = 80,
  rotationDuration = 300,
  onDragStart,
  onDragEnd,
}) => {
  // State management
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [initialPosition, setInitialPosition] = useState<Position>({
    x: 0,
    y: 0,
  })
  const [rotation, setRotation] = useState<number>(0)
  const [scale, setScale] = useState<number>(1)

  // Refs
  const imgRef = useRef<HTMLImageElement>(null)
  const animationRef = useRef<number | null>(null)
  const currentRotationRef = useRef<number>(0)

  /**
   * Initialize the element's center position on mount
   */
  useEffect(() => {
    if (imgRef.current && initialPosition.x === 0 && initialPosition.y === 0) {
      const rect = imgRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      setInitialPosition({ x: centerX, y: centerY })
    }
  }, [initialPosition])

  /**
   * Calculate the center position of the image element
   */
  const getElementCenter = (): Position => {
    if (!imgRef.current) return { x: 0, y: 0 }
    const rect = imgRef.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  /**
   * Handle pointer down (mouse, finger or pen) - start dragging
   */
  const handlePointerDown = (e: PointerEvent<HTMLImageElement>) => {
    e.preventDefault()
    setIsDragging(true)
    setScale(dragScale)
    currentRotationRef.current = 0

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Update initial position
    const center = getElementCenter()
    setInitialPosition(center)

    // Call onDragStart callback
    if (onDragStart) {
      onDragStart()
    }
  }

  /**
   * Handle pointer move - follow cursor or finger while dragging
   */
  const handlePointerMove = (e: globalThis.PointerEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - initialPosition.x
    const deltaY = e.clientY - initialPosition.y
    setPosition({ x: deltaX, y: deltaY })
  }

  /**
   * Handle pointer up - release and animate return to origin
   */
  const handlePointerUp = () => {
    setIsDragging(false)

    // Capture current state for animation
    const startPos = { ...position }
    const startScale = scale
    const startTime = performance.now()

    // Calculate distance and angle to origin
    const distance = Math.sqrt(startPos.x ** 2 + startPos.y ** 2)
    const angleFromOrigin = Math.atan2(startPos.y, startPos.x)

    // Calculate animation duration based on distance and speed
    const duration = (distance / returnSpeed) * 1000

    // Calculate sine wave parameters based on distance
    const amplitude = waveAmplitude
    const frequency = Math.max(1, distance / frequencyScaling)

    // Where the sticker was on the previous frame, to work out its heading
    let previousPos = startPos

    /**
     * Main return animation - moves element back to origin with sine wave
     */
    const animate = (currentTime: number) => {
      const elapsed = Math.max(currentTime - startTime, 0)
      const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 1
      const easedProgress = easeOutCubic(progress)
      const remaining = 1 - easedProgress

      // Build the path as if the way home were a flat axis:
      // "along" is the distance left to go, "sideways" is the sine wobble,
      // which shrinks as the sticker gets closer to home
      const along = distance * remaining
      const sideways =
        Math.sin(progress * Math.PI * frequency) * amplitude * remaining

      // Tilt that flat path so it points along the real line back to origin
      const newPos = rotatePoint({ x: along, y: sideways }, angleFromOrigin)
      setPosition(newPos)

      // Face the direction of travel: the angle of the step from last frame
      // to this one. If the sticker didn't move, keep the previous angle.
      const stepX = newPos.x - previousPos.x
      const stepY = newPos.y - previousPos.y
      if (stepX !== 0 || stepY !== 0) {
        currentRotationRef.current = toDegrees(Math.atan2(stepY, stepX))
      }
      setRotation(currentRotationRef.current)
      previousPos = newPos

      // Animate scale back to normal
      setScale(startScale + (1 - startScale) * easedProgress)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Finalize position and scale
        setPosition({ x: 0, y: 0 })
        setScale(1)

        // Start rotation reset animation
        const finalRotation = currentRotationRef.current
        const rotationStartTime = performance.now()

        /**
         * Rotation reset animation - smoothly rotates back to 0 degrees
         */
        const rotationAnimate = (currentTime: number) => {
          const elapsed = currentTime - rotationStartTime
          const rotProgress = Math.min(elapsed / rotationDuration, 1)
          const easedRotProgress = easeOutCubic(rotProgress)

          setRotation(finalRotation * (1 - easedRotProgress))

          if (rotProgress < 1) {
            animationRef.current = requestAnimationFrame(rotationAnimate)
          } else {
            setRotation(0)
            currentRotationRef.current = 0

            // Call onDragEnd callback
            if (onDragEnd) {
              onDragEnd()
            }
          }
        }

        animationRef.current = requestAnimationFrame(rotationAnimate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  /**
   * Attach pointer event listeners when dragging.
   * pointercancel fires when the phone takes the touch away (e.g. a system
   * gesture), so treat it like letting go
   */
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
      window.addEventListener("pointercancel", handlePointerUp)
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [isDragging, initialPosition, position, scale])

  /**
   * Cleanup animation on component unmount
   */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      style={{
        transformOrigin: "center",
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
        zIndex: isDragging ? 1000 : 1,
        userSelect: "none",
        WebkitUserSelect: "none",
        // A drag that starts on the sticker moves it instead of scrolling
        touchAction: "none",
        // iOS: no "save image" menu on long press
        WebkitTouchCallout: "none",
      }}
      onPointerDown={handlePointerDown}
      draggable={false}
    />
  )
}

export default DraggableStickerImage
