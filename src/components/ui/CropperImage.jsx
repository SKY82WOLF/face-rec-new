import React, { useRef, useState, useEffect, useCallback } from 'react'

// Simple canvas-based cropper that accepts an image URL and an optional initial area
// Emits area changes via onAreaChange with debouncing

const POINT_RADIUS = 8
const PROXIMITY = 10

const CropperImage = ({ imageUrl, image_url, area, onAreaChange, cropperResult }) => {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [internalArea, setInternalArea] = useState(null)

  const dragRef = useRef({ type: null, startX: 0, startY: 0, orig: null, offsetX: 0, offsetY: 0 })
  const emitTimeout = useRef(null)
  const pendingAreaRef = useRef(null)
  const parentProvidedAreaRef = useRef(false)
  const defaultTimerRef = useRef(null)

  const emitArea = a => {
    if (emitTimeout.current) window.clearTimeout(emitTimeout.current)
    emitTimeout.current = window.setTimeout(() => {
      try {
        if (onAreaChange) onAreaChange(a)
      } catch {}

      try {
        if (typeof cropperResult === 'function') cropperResult(a)
      } catch {}

      emitTimeout.current = null
    }, 200)
  }

  // Load image and size canvas
  useEffect(() => {
    const src = imageUrl || image_url
    const canvas = canvasRef.current

    const setDefaultCanvasAndArea = (cw, ch) => {
      if (canvas) {
        canvas.width = cw
        canvas.height = ch
      }

      if (area && typeof area.x === 'number') {
        const nx = Math.max(0, Math.round(area.x))
        const ny = Math.max(0, Math.round(area.y))
        const nw = Math.max(1, Math.round(area.width))
        const nh = Math.max(1, Math.round(area.height))

        const clamped = {
          x: Math.min(nx, cw - 1),
          y: Math.min(ny, ch - 1),
          width: Math.min(nw, cw - Math.min(nx, cw - 1)),
          height: Math.min(nh, ch - Math.min(ny, ch - 1))
        }

        parentProvidedAreaRef.current = true

        if (defaultTimerRef.current) {
          window.clearTimeout(defaultTimerRef.current)
          defaultTimerRef.current = null
        }

        setInternalArea(clamped)
      } else {
        const defaultArea = {
          x: Math.round(cw * 0.25),
          y: Math.round(ch * 0.25),
          width: Math.round(cw * 0.5),
          height: Math.round(ch * 0.5)
        }

        if (!parentProvidedAreaRef.current) {
          if (defaultTimerRef.current) window.clearTimeout(defaultTimerRef.current)
          defaultTimerRef.current = window.setTimeout(() => {
            if (!parentProvidedAreaRef.current) {
              setInternalArea(defaultArea)
              emitArea(defaultArea)
            }

            defaultTimerRef.current = null
          }, 150)
        }
      }

      setLoaded(true)
    }

    // reset state for new src
    setLoaded(false)
    imageRef.current = null

    if (!src) {
      setDefaultCanvasAndArea(800, 450)

      return
    }

    const img = new Image()

    img.onload = () => {
      imageRef.current = img

      if (canvas) {
        canvas.width = img.naturalWidth || 800
        canvas.height = img.naturalHeight || 450
      }

      const cw = (canvas && canvas.width) || img.naturalWidth || 800
      const ch = (canvas && canvas.height) || img.naturalHeight || 450

      if (area && typeof area.x === 'number') {
        const nx = Math.max(0, Math.round(area.x))
        const ny = Math.max(0, Math.round(area.y))
        const nw = Math.max(1, Math.round(area.width))
        const nh = Math.max(1, Math.round(area.height))

        const clamped = {
          x: Math.min(nx, cw - 1),
          y: Math.min(ny, ch - 1),
          width: Math.min(nw, cw - Math.min(nx, cw - 1)),
          height: Math.min(nh, ch - Math.min(ny, ch - 1))
        }

        parentProvidedAreaRef.current = true

        if (defaultTimerRef.current) {
          window.clearTimeout(defaultTimerRef.current)
          defaultTimerRef.current = null
        }

        setInternalArea(clamped)
      } else if (pendingAreaRef.current) {
        const a = pendingAreaRef.current

        pendingAreaRef.current = null
        const nx = Math.max(0, Math.round(a.x))
        const ny = Math.max(0, Math.round(a.y))
        const nw = Math.max(1, Math.round(a.width))
        const nh = Math.max(1, Math.round(a.height))

        const clamped = {
          x: Math.min(nx, cw - 1),
          y: Math.min(ny, ch - 1),
          width: Math.min(nw, cw - Math.min(nx, cw - 1)),
          height: Math.min(nh, ch - Math.min(ny, ch - 1))
        }

        parentProvidedAreaRef.current = true

        if (defaultTimerRef.current) {
          window.clearTimeout(defaultTimerRef.current)
          defaultTimerRef.current = null
        }

        setInternalArea(clamped)
      } else {
        const defaultArea = {
          x: Math.round(cw * 0.25),
          y: Math.round(ch * 0.25),
          width: Math.round(cw * 0.5),
          height: Math.round(ch * 0.5)
        }

        setInternalArea(defaultArea)
        if (!parentProvidedAreaRef.current) emitArea(defaultArea)
      }

      setLoaded(true)
    }

    img.onerror = () => {
      setDefaultCanvasAndArea(800, 450)
    }

    img.src = src
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, image_url, area])

  // Sync external area
  useEffect(() => {
    if (!area) return
    const canvas = canvasRef.current

    const applyArea = a => {
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        pendingAreaRef.current = a

        return
      }

      const cw = canvas.width
      const ch = canvas.height
      const nx = Math.max(0, Math.round(a.x))
      const ny = Math.max(0, Math.round(a.y))
      const nw = Math.max(1, Math.round(a.width))
      const nh = Math.max(1, Math.round(a.height))

      const clamped = {
        x: Math.min(nx, cw - 1),
        y: Math.min(ny, ch - 1),
        width: Math.min(nw, cw - Math.min(nx, cw - 1)),
        height: Math.min(nh, ch - Math.min(ny, ch - 1))
      }

      parentProvidedAreaRef.current = true

      if (defaultTimerRef.current) {
        window.clearTimeout(defaultTimerRef.current)
        defaultTimerRef.current = null
      }

      setInternalArea(clamped)
    }

    applyArea(area)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area?.x, area?.y, area?.width, area?.height])

  const getCanvasMousePos = e => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.nativeEvent.clientX - rect.left) * scaleX
    const y = (e.nativeEvent.clientY - rect.top) * scaleY

    return { x: Math.round(x), y: Math.round(y) }
  }

  const isNear = (px, py, x, y) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scale = canvas.width / rect.width
    const prox = PROXIMITY * scale

    return Math.hypot(px - x, py - y) <= prox
  }

  const getMousePosFromClient = (clientX, clientY) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    return { x: Math.round(x), y: Math.round(y) }
  }

  const onDocumentMouseMove = e => {
    const canvas = canvasRef.current

    if (!canvas) return
    const pos = getMousePosFromClient(e.clientX, e.clientY)

    handleDragMove(pos.x, pos.y)
  }

  const onDocumentMouseUp = () => {
    window.removeEventListener('mousemove', onDocumentMouseMove)
    window.removeEventListener('mouseup', onDocumentMouseUp)
    handleMouseUp()
  }

  const handleMouseDown = e => {
    if (!internalArea) return
    const { x, y } = getCanvasMousePos(e)
    const tl = { x: internalArea.x, y: internalArea.y }
    const tr = { x: internalArea.x + internalArea.width, y: internalArea.y }
    const bl = { x: internalArea.x, y: internalArea.y + internalArea.height }
    const br = { x: internalArea.x + internalArea.width, y: internalArea.y + internalArea.height }

    if (isNear(x, y, tl.x, tl.y)) {
      dragRef.current = { type: 'tl', startX: x, startY: y, orig: { ...internalArea }, offsetX: 0, offsetY: 0 }

      return
    }

    if (isNear(x, y, tr.x, tr.y)) {
      dragRef.current = { type: 'tr', startX: x, startY: y, orig: { ...internalArea }, offsetX: 0, offsetY: 0 }

      return
    }

    if (isNear(x, y, bl.x, bl.y)) {
      dragRef.current = { type: 'bl', startX: x, startY: y, orig: { ...internalArea }, offsetX: 0, offsetY: 0 }

      return
    }

    if (isNear(x, y, br.x, br.y)) {
      dragRef.current = { type: 'br', startX: x, startY: y, orig: { ...internalArea }, offsetX: 0, offsetY: 0 }

      return
    }

    // Edge proximity check (top, right, bottom, left)
    const prox = PROXIMITY * (canvasRef.current.width / canvasRef.current.getBoundingClientRect().width)
    const a = internalArea
    const withinX = x >= a.x && x <= a.x + a.width
    const withinY = y >= a.y && y <= a.y + a.height

    if (withinX && Math.abs(y - a.y) <= prox) {
      dragRef.current = { type: 't', startX: x, startY: y, orig: { ...internalArea }, offsetX: 0, offsetY: 0 }

      // attach global listeners to allow dragging outside
      window.addEventListener('mousemove', onDocumentMouseMove)
      window.addEventListener('mouseup', onDocumentMouseUp)

      return
    }

    if (withinX && Math.abs(y - (a.y + a.height)) <= prox) {
      dragRef.current = { type: 'b', startX: x, startY: y, orig: { ...internalArea }, offsetX: 0, offsetY: 0 }

      window.addEventListener('mousemove', onDocumentMouseMove)
      window.addEventListener('mouseup', onDocumentMouseUp)

      return
    }

    if (withinY && Math.abs(x - a.x) <= prox) {
      dragRef.current = { type: 'l', startX: x, startY: y, orig: { ...internalArea }, offsetX: 0, offsetY: 0 }

      window.addEventListener('mousemove', onDocumentMouseMove)
      window.addEventListener('mouseup', onDocumentMouseUp)

      return
    }

    if (withinY && Math.abs(x - (a.x + a.width)) <= prox) {
      dragRef.current = { type: 'r', startX: x, startY: y, orig: { ...internalArea }, offsetX: 0, offsetY: 0 }

      window.addEventListener('mousemove', onDocumentMouseMove)
      window.addEventListener('mouseup', onDocumentMouseUp)

      return
    }

    if (
      x >= internalArea.x &&
      x <= internalArea.x + internalArea.width &&
      y >= internalArea.y &&
      y <= internalArea.y + internalArea.height
    ) {
      dragRef.current = {
        type: 'move',
        startX: x,
        startY: y,
        orig: { ...internalArea },
        offsetX: x - internalArea.x,
        offsetY: y - internalArea.y
      }
      window.addEventListener('mousemove', onDocumentMouseMove)
      window.addEventListener('mouseup', onDocumentMouseUp)
    }
  }

  const clampArea = (a, canvasW, canvasH) => {
    let nx = a.x
    let ny = a.y
    let nw = Math.max(1, a.width)
    let nh = Math.max(1, a.height)

    if (nx < 0) nx = 0
    if (ny < 0) ny = 0
    if (nx + nw > canvasW) nw = canvasW - nx
    if (ny + nh > canvasH) nh = canvasH - ny

    return {
      x: Math.round(nx),
      y: Math.round(ny),
      width: Math.round(nw),
      height: Math.round(nh)
    }
  }

  const handleDragMove = (x, y) => {
    if (!internalArea) return
    const drag = dragRef.current

    if (!drag.type || !drag.orig) return

    const dx = x - drag.startX
    const dy = y - drag.startY
    let next = { ...drag.orig }
    const cw = canvasRef.current.width
    const ch = canvasRef.current.height

    if (drag.type === 'move') {
      next.x = drag.orig.x + dx
      next.y = drag.orig.y + dy
      next.x = Math.max(0, Math.min(next.x, cw - next.width))
      next.y = Math.max(0, Math.min(next.y, ch - next.height))
    } else if (drag.type === 'tl') {
      next.x = drag.orig.x + dx
      next.y = drag.orig.y + dy
      next.width = drag.orig.width - dx
      next.height = drag.orig.height - dy
      if (next.width < 1) next.width = 1
      if (next.height < 1) next.height = 1
    } else if (drag.type === 'tr') {
      next.y = drag.orig.y + dy
      next.width = drag.orig.width + dx
      next.height = drag.orig.height - dy
      if (next.width < 1) next.width = 1
      if (next.height < 1) next.height = 1
    } else if (drag.type === 'bl') {
      next.x = drag.orig.x + dx
      next.width = drag.orig.width - dx
      next.height = drag.orig.height + dy
      if (next.width < 1) next.width = 1
      if (next.height < 1) next.height = 1
    } else if (drag.type === 'br') {
      next.width = drag.orig.width + dx
      next.height = drag.orig.height + dy
      if (next.width < 1) next.width = 1
      if (next.height < 1) next.height = 1
    } else if (drag.type === 't') {
      next.y = drag.orig.y + dy
      next.height = drag.orig.height - dy
      if (next.height < 1) next.height = 1

      if (next.y < 0) {
        next.height += next.y
        next.y = 0
      }
    } else if (drag.type === 'b') {
      next.height = drag.orig.height + dy
      if (next.height < 1) next.height = 1
      if (next.y + next.height > ch) next.height = ch - next.y
    } else if (drag.type === 'l') {
      next.x = drag.orig.x + dx
      next.width = drag.orig.width - dx
      if (next.width < 1) next.width = 1

      if (next.x < 0) {
        next.width += next.x
        next.x = 0
      }
    } else if (drag.type === 'r') {
      next.width = drag.orig.width + dx
      if (next.width < 1) next.width = 1
      if (next.x + next.width > cw) next.width = cw - next.x
    }

    next = clampArea(next, cw, ch)
    setInternalArea(next)
    emitArea(next)
  }

  const handleMouseMove = e => {
    const { x, y } = getCanvasMousePos(e)

    handleDragMove(x, y)
  }

  const handleMouseUp = () => {
    dragRef.current = { type: null, startX: 0, startY: 0, orig: null, offsetX: 0, offsetY: 0 }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current

    if (!canvas || !internalArea) return
    const ctx = canvas.getContext('2d')

    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (img) {
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      } catch {
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    } else {
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const a = internalArea

    ctx.beginPath()
    ctx.rect(a.x, a.y, a.width, a.height)
    ctx.fillStyle = 'rgba(0, 123, 255, 0.15)'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(0,123,255,0.9)'
    ctx.stroke()

    const corners = [
      { x: a.x, y: a.y },
      { x: a.x + a.width, y: a.y },
      { x: a.x, y: a.y + a.height },
      { x: a.x + a.width, y: a.y + a.height }
    ]

    corners.forEach(c => {
      ctx.beginPath()
      ctx.arc(c.x, c.y, POINT_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(0,123,255,0.9)'
      ctx.stroke()
    })

    // Edge handles (midpoints)
    const midpoints = [
      { x: a.x + a.width / 2, y: a.y }, // top
      { x: a.x + a.width, y: a.y + a.height / 2 }, // right
      { x: a.x + a.width / 2, y: a.y + a.height }, // bottom
      { x: a.x, y: a.y + a.height / 2 } // left
    ]

    midpoints.forEach((m, idx) => {
      ctx.beginPath()
      const size = 6

      ctx.rect(m.x - size, m.y - size, size * 2, size * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(0,123,255,0.9)'
      ctx.stroke()
    })
  }, [internalArea])

  useEffect(() => {
    draw()
  }, [draw, loaded, internalArea])

  useEffect(() => {
    return () => {
      if (emitTimeout.current) window.clearTimeout(emitTimeout.current)
    }
  }, [])

  return (
    <div style={{ width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid #000', width: '100%', height: 'auto', cursor: 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {}}
      />
    </div>
  )
}

export default CropperImage
