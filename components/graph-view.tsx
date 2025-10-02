"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { X, Menu, ZoomIn, ZoomOut, Filter, Link2, Tag, RefreshCw, Settings, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Note, GraphNode, GraphConnection } from "@/types/note"

interface GraphViewProps {
  notes: Note[]
  onNoteSelect: (id: string) => void
  onUpdateNote: (id: string, updates: Partial<Note>) => void
  onClose: () => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function GraphView({
  notes,
  onNoteSelect,
  onUpdateNote,
  onClose,
  isSidebarCollapsed,
  onToggleSidebar,
}: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showLabels, setShowLabels] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [layoutType, setLayoutType] = useState<"force" | "circular" | "grid">("force")
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map())

  // Generate graph data from notes
  const { nodes, connections } = useMemo(() => {
    const graphNodes: GraphNode[] = []
    const graphConnections: GraphConnection[] = []

    // Create nodes
    notes.forEach((note, index) => {
      const savedPos = nodePositions.get(note.id)
      graphNodes.push({
        id: note.id,
        title: note.title,
        category: note.category,
        x: savedPos?.x ?? Math.cos((index / notes.length) * Math.PI * 2) * 200,
        y: savedPos?.y ?? Math.sin((index / notes.length) * Math.PI * 2) * 200,
        connections: note.connections || [],
        tags: note.tags || [],
      })
    })

    // Create connections based on shared tags and explicit connections
    notes.forEach((note) => {
      // Explicit connections
      if (note.connections) {
        note.connections.forEach((targetId) => {
          if (notes.find((n) => n.id === targetId)) {
            graphConnections.push({
              source: note.id,
              target: targetId,
              strength: 1,
            })
          }
        })
      }

      // Implicit connections through shared tags
      if (note.tags && note.tags.length > 0) {
        notes.forEach((otherNote) => {
          if (otherNote.id !== note.id && otherNote.tags) {
            const sharedTags = note.tags!.filter((tag) => otherNote.tags!.includes(tag))
            if (sharedTags.length > 0) {
              const strength = sharedTags.length / Math.max(note.tags!.length, otherNote.tags!.length)
              if (!graphConnections.find((c) => c.source === note.id && c.target === otherNote.id)) {
                graphConnections.push({
                  source: note.id,
                  target: otherNote.id,
                  strength,
                })
              }
            }
          }
        })
      }
    })

    return { nodes: graphNodes, connections: graphConnections }
  }, [notes, nodePositions])

  // Filter nodes by category
  const filteredNodes = useMemo(() => {
    if (filterCategory === "all") return nodes
    return nodes.filter((node) => node.category === filterCategory)
  }, [nodes, filterCategory])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(notes.map((note) => note.category))
    return Array.from(cats)
  }, [notes])

  // Apply layout algorithm
  useEffect(() => {
    if (layoutType === "force") {
      applyForceLayout()
    } else if (layoutType === "circular") {
      applyCircularLayout()
    } else if (layoutType === "grid") {
      applyGridLayout()
    }
  }, [layoutType, notes.length])

  const applyForceLayout = () => {
    const newPositions = new Map(nodePositions)
    const iterations = 50
    const repulsion = 5000
    const attraction = 0.01

    for (let iter = 0; iter < iterations; iter++) {
      nodes.forEach((node) => {
        let fx = 0
        let fy = 0

        // Repulsion between all nodes
        nodes.forEach((other) => {
          if (node.id !== other.id) {
            const dx = node.x - other.x
            const dy = node.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy) || 1
            const force = repulsion / (distance * distance)
            fx += (dx / distance) * force
            fy += (dy / distance) * force
          }
        })

        // Attraction along connections
        connections.forEach((conn) => {
          if (conn.source === node.id) {
            const target = nodes.find((n) => n.id === conn.target)
            if (target) {
              const dx = target.x - node.x
              const dy = target.y - node.y
              fx += dx * attraction * conn.strength
              fy += dy * attraction * conn.strength
            }
          }
        })

        const pos = newPositions.get(node.id) || { x: node.x, y: node.y }
        newPositions.set(node.id, {
          x: pos.x + fx * 0.1,
          y: pos.y + fy * 0.1,
        })
      })
    }

    setNodePositions(newPositions)
  }

  const applyCircularLayout = () => {
    const newPositions = new Map<string, { x: number; y: number }>()
    const radius = 250
    filteredNodes.forEach((node, index) => {
      const angle = (index / filteredNodes.length) * Math.PI * 2
      newPositions.set(node.id, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      })
    })
    setNodePositions(newPositions)
  }

  const applyGridLayout = () => {
    const newPositions = new Map<string, { x: number; y: number }>()
    const cols = Math.ceil(Math.sqrt(filteredNodes.length))
    const spacing = 150
    filteredNodes.forEach((node, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      newPositions.set(node.id, {
        x: (col - cols / 2) * spacing,
        y: (row - Math.ceil(filteredNodes.length / cols) / 2) * spacing,
      })
    })
    setNodePositions(newPositions)
  }

  // Draw graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = containerRef.current
    if (!container) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    // Apply transformations
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y)
    ctx.scale(zoom, zoom)

    // Draw connections
    if (showConnections) {
      connections.forEach((conn) => {
        const sourceNode = nodes.find((n) => n.id === conn.source)
        const targetNode = nodes.find((n) => n.id === conn.target)
        if (!sourceNode || !targetNode) return

        const sourcePos = nodePositions.get(sourceNode.id) || { x: sourceNode.x, y: sourceNode.y }
        const targetPos = nodePositions.get(targetNode.id) || { x: targetNode.x, y: targetNode.y }

        ctx.beginPath()
        ctx.moveTo(sourcePos.x, sourcePos.y)
        ctx.lineTo(targetPos.x, targetPos.y)
        ctx.strokeStyle = `rgba(147, 197, 253, ${conn.strength * 0.3})`
        ctx.lineWidth = conn.strength * 3
        ctx.stroke()
      })
    }

    // Draw nodes
    filteredNodes.forEach((node) => {
      const pos = nodePositions.get(node.id) || { x: node.x, y: node.y }
      const isSelected = selectedNode === node.id
      const isHovered = hoveredNode === node.id

      // Node circle
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, isSelected ? 35 : isHovered ? 30 : 25, 0, Math.PI * 2)

      // Category colors
      const categoryColors: Record<string, string> = {
        personnel: "#93c5fd",
        travail: "#a78bfa",
        idées: "#fbbf24",
        projets: "#34d399",
      }
      ctx.fillStyle = categoryColors[node.category] || "#93c5fd"
      ctx.fill()

      if (isSelected) {
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 4
        ctx.stroke()
      }

      // Draw labels
      if (showLabels && (isHovered || isSelected)) {
        ctx.fillStyle = "#1f2937"
        ctx.font = "14px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(node.title.substring(0, 20), pos.x, pos.y + 50)
      }
    })

    ctx.restore()
  }, [
    nodes,
    connections,
    filteredNodes,
    zoom,
    pan,
    selectedNode,
    hoveredNode,
    showLabels,
    showConnections,
    nodePositions,
  ])

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - canvas.width / 2 - pan.x) / zoom
    const y = (e.clientY - rect.top - canvas.height / 2 - pan.y) / zoom

    // Check if clicking on a node
    const clickedNode = filteredNodes.find((node) => {
      const pos = nodePositions.get(node.id) || { x: node.x, y: node.y }
      const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2)
      return distance < 25
    })

    if (clickedNode) {
      setSelectedNode(clickedNode.id)
      setDraggedNode(clickedNode.id)
    } else {
      setSelectedNode(null)
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - canvas.width / 2 - pan.x) / zoom
    const y = (e.clientY - rect.top - canvas.height / 2 - pan.y) / zoom

    if (draggedNode) {
      const newPositions = new Map(nodePositions)
      newPositions.set(draggedNode, { x, y })
      setNodePositions(newPositions)
      return
    }

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
      return
    }

    // Check hover
    const hoveredNode = filteredNodes.find((node) => {
      const pos = nodePositions.get(node.id) || { x: node.x, y: node.y }
      const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2)
      return distance < 25
    })

    setHoveredNode(hoveredNode?.id || null)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedNode(null)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.max(0.1, Math.min(3, prev * delta)))
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const addConnection = (targetId: string) => {
    if (!selectedNode || selectedNode === targetId) return
    const note = notes.find((n) => n.id === selectedNode)
    if (!note) return

    const connections = note.connections || []
    if (!connections.includes(targetId)) {
      onUpdateNote(selectedNode, {
        connections: [...connections, targetId],
      })
    }
  }

  const removeConnection = (targetId: string) => {
    if (!selectedNode) return
    const note = notes.find((n) => n.id === selectedNode)
    if (!note) return

    const connections = note.connections || []
    onUpdateNote(selectedNode, {
      connections: connections.filter((id) => id !== targetId),
    })
  }

  const selectedNoteData = notes.find((n) => n.id === selectedNode)

  return (
    <div className="flex-1 flex flex-col bg-background relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="rounded-full neuro-flat hover:neuro-raised"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-xl font-serif font-semibold">Vue Graphique</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full neuro-flat hover:neuro-raised">
                <Settings className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 neuro-raised rounded-3xl bg-popover border-0">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Disposition</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={layoutType === "force" ? "default" : "outline"}
                      onClick={() => setLayoutType("force")}
                      className="flex-1 rounded-full neuro-flat border-0"
                    >
                      Force
                    </Button>
                    <Button
                      size="sm"
                      variant={layoutType === "circular" ? "default" : "outline"}
                      onClick={() => setLayoutType("circular")}
                      className="flex-1 rounded-full neuro-flat border-0"
                    >
                      Circulaire
                    </Button>
                    <Button
                      size="sm"
                      variant={layoutType === "grid" ? "default" : "outline"}
                      onClick={() => setLayoutType("grid")}
                      className="flex-1 rounded-full neuro-flat border-0"
                    >
                      Grille
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Étiquettes</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowLabels(!showLabels)}
                    className="rounded-full neuro-flat"
                  >
                    {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Connexions</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConnections(!showConnections)}
                    className="rounded-full neuro-flat"
                  >
                    {showConnections ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Filter by category */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full neuro-flat hover:neuro-raised">
                <Filter className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4 neuro-raised rounded-3xl bg-popover border-0">
              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Filtrer par catégorie</p>
                <Button
                  size="sm"
                  variant={filterCategory === "all" ? "default" : "outline"}
                  onClick={() => setFilterCategory("all")}
                  className="w-full rounded-full neuro-flat border-0"
                >
                  Toutes
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={filterCategory === cat ? "default" : "outline"}
                    onClick={() => setFilterCategory(cat)}
                    className="w-full rounded-full neuro-flat border-0"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 neuro-inset rounded-full px-2 py-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((prev) => Math.max(0.1, prev - 0.1))}
              className="h-8 w-8 rounded-full"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium px-2 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
              className="h-8 w-8 rounded-full"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={resetView}
            className="rounded-full neuro-flat hover:neuro-raised"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full neuro-flat hover:neuro-raised">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="cursor-grab active:cursor-grabbing"
        />

        {/* Node details popover */}
        {selectedNoteData && (
          <div className="absolute top-4 right-4 w-80 neuro-raised rounded-3xl bg-card p-6 space-y-4 animate-in fade-in slide-in-from-right-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{selectedNoteData.title}</h3>
                <p className="text-xs text-muted-foreground">{selectedNoteData.category}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedNode(null)}
                className="rounded-full h-8 w-8 neuro-flat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">{selectedNoteData.content}</p>

            {/* Tags */}
            {selectedNoteData.tags && selectedNoteData.tags.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedNoteData.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full neuro-inset bg-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Connections */}
            <div>
              <p className="text-xs font-medium mb-2 flex items-center gap-2">
                <Link2 className="h-3 w-3" />
                Connexions ({selectedNoteData.connections?.length || 0})
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedNoteData.connections?.map((connId) => {
                  const connNote = notes.find((n) => n.id === connId)
                  if (!connNote) return null
                  return (
                    <div
                      key={connId}
                      className="flex items-center justify-between p-2 rounded-2xl neuro-flat hover:neuro-pressed cursor-pointer text-sm"
                      onClick={() => setSelectedNode(connId)}
                    >
                      <span className="truncate">{connNote.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeConnection(connId)
                        }}
                        className="h-6 w-6 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onNoteSelect(selectedNoteData.id)}
                className="flex-1 rounded-full neuro-raised bg-primary text-primary-foreground border-0"
              >
                Ouvrir
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-full neuro-flat border-0 bg-transparent"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Lier
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 neuro-raised rounded-3xl bg-popover border-0">
                  <div className="space-y-2">
                    <p className="text-sm font-medium mb-3">Lier à une note</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {notes
                        .filter((n) => n.id !== selectedNode)
                        .map((note) => (
                          <Button
                            key={note.id}
                            size="sm"
                            variant="outline"
                            onClick={() => addConnection(note.id)}
                            className="w-full justify-start rounded-full neuro-flat border-0"
                          >
                            {note.title}
                          </Button>
                        ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 neuro-raised rounded-3xl bg-card/90 backdrop-blur-sm p-4 space-y-2">
          <p className="text-xs font-medium mb-2">Légende</p>
          {categories.map((cat) => {
            const colors: Record<string, string> = {
              personnel: "#93c5fd",
              travail: "#a78bfa",
              idées: "#fbbf24",
              projets: "#34d399",
            }
            return (
              <div key={cat} className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[cat] || "#93c5fd" }} />
                <span>{cat}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
