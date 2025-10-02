"use client"

import { useState, useEffect, useRef } from "react"
import { Maximize2, Minimize2, Type, Bold, Italic, List, CheckSquare, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Note } from "@/types/note"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface EditorProps {
  note: Note | undefined
  onUpdateNote: (id: string, updates: Partial<Note>) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function Editor({
  note,
  onUpdateNote,
  isFullscreen,
  onToggleFullscreen,
  isSidebarCollapsed,
  onToggleSidebar,
}: EditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (note) {
      onUpdateNote(note.id, { title: newTitle })
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    if (note) {
      onUpdateNote(note.id, { content: newContent })
    }
  }

  const insertFormatting = (prefix: string, suffix = "") => {
    if (!contentRef.current) return

    const start = contentRef.current.selectionStart
    const end = contentRef.current.selectionEnd
    const selectedText = content.substring(start, end)
    const newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end)

    handleContentChange(newContent)

    // Restore focus and selection
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus()
        contentRef.current.setSelectionRange(start + prefix.length, end + prefix.length)
      }
    }, 0)
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Type className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Sélectionnez une note pour commencer</p>
        </div>
      </div>
    )
  }

  return (
    <main className={`flex-1 flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      {/* Toolbar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="rounded-full neuro-flat hover:neuro-pressed h-10 w-10"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full neuro-flat hover:neuro-pressed h-10 w-10">
                  <Type className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 neuro-raised rounded-3xl bg-popover border-0">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-full"
                    onClick={() => insertFormatting("# ", "")}
                  >
                    <span className="text-lg font-bold">H1</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-full"
                    onClick={() => insertFormatting("## ", "")}
                  >
                    <span className="text-base font-bold">H2</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-full"
                    onClick={() => insertFormatting("### ", "")}
                  >
                    <span className="text-sm font-bold">H3</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full neuro-flat hover:neuro-pressed h-10 w-10"
              onClick={() => insertFormatting("**", "**")}
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex rounded-full neuro-flat hover:neuro-pressed h-10 w-10"
              onClick={() => insertFormatting("*", "*")}
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex rounded-full neuro-flat hover:neuro-pressed h-10 w-10"
              onClick={() => insertFormatting("- ", "")}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex rounded-full neuro-flat hover:neuro-pressed h-10 w-10"
              onClick={() => insertFormatting("- [ ] ", "")}
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="rounded-full neuro-flat hover:neuro-pressed h-10 w-10"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Titre de la note"
            className="w-full text-3xl md:text-4xl font-serif font-bold bg-transparent border-0 outline-none mb-6 md:mb-8 text-foreground placeholder:text-muted-foreground/40 text-balance"
          />

          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Commencez à écrire..."
            className="w-full min-h-[60vh] text-base md:text-lg bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground/40 leading-relaxed font-sans"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>
      </div>
    </main>
  )
}
