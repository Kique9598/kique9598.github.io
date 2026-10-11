import React, { useState, useRef, useEffect, type MouseEvent } from "react"

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
   * Easing function for smooth deceleration
   */
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3)
  }

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
   * Handle mouse down - start dragging
   */
  const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
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
   * Handle mouse move - follow cursor while dragging
   */
  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - initialPosition.x
    const deltaY = e.clientY - initialPosition.y
    setPosition({ x: deltaX, y: deltaY })
  }

  /**
   * Handle mouse up - release and animate return to origin
   */
  const handleMouseUp = () => {
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

    /**
     * Main return animation - moves element back to origin with sine wave
     */
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)

      // Calculate position along sine wave path
      const x = distance * (1 - easedProgress)
      const y =
        Math.sin(progress * Math.PI * frequency) *
        amplitude *
        (1 - easedProgress)

      // Rotate coordinates to align with path back to origin
      const rotatedX =
        x * Math.cos(angleFromOrigin) - y * Math.sin(angleFromOrigin)
      const rotatedY =
        x * Math.sin(angleFromOrigin) + y * Math.cos(angleFromOrigin)

      setPosition({ x: rotatedX, y: rotatedY })

      // Calculate velocity for rotation direction
      const dx_dt = -distance * 3 * Math.pow(1 - progress, 2)
      const dy_dt =
        Math.cos(progress * Math.PI * frequency) *
          Math.PI *
          frequency *
          amplitude *
          (1 - easedProgress) -
        Math.sin(progress * Math.PI * frequency) *
          amplitude *
          3 *
          Math.pow(1 - progress, 2)

      // Rotate velocity vector
      const vel_x =
        dx_dt * Math.cos(angleFromOrigin) - dy_dt * Math.sin(angleFromOrigin)
      const vel_y =
        dx_dt * Math.sin(angleFromOrigin) + dy_dt * Math.cos(angleFromOrigin)

      // Calculate rotation angle from velocity
      let movementAngle = Math.atan2(vel_y, vel_x) * (180 / Math.PI)
      if (!isFinite(movementAngle)) {
        movementAngle = currentRotationRef.current
      }

      currentRotationRef.current = movementAngle
      setRotation(movementAngle)

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
   * Attach mouse event listeners when dragging
   */
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
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
      }}
      onMouseDown={handleMouseDown}
      draggable={false}
    />
  )
}

export default DraggableStickerImage
