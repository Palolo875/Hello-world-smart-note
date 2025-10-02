"use client"

import {
  Search,
  Plus,
  FileText,
  Trash2,
  X,
  Sparkles,
  Network,
  Store,
  LayoutDashboard,
  SettingsIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Note, AppModule } from "@/types/note"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface SidebarProps {
  notes: Note[]
  activeNoteId: string | null
  onNoteSelect: (id: string) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  onOpenSemanticSearch: () => void
  onOpenGraphView: () => void
  onOpenModuleStore: () => void
  onOpenDashboard: () => void
  onOpenSettings: () => void
  activeModules: AppModule[]
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    Sparkles,
    Network,
    LayoutDashboard,
  }
  return icons[iconName] || FileText
}

export function Sidebar({
  notes,
  activeNoteId,
  onNoteSelect,
  onCreateNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
  isCollapsed,
  onToggleCollapse,
  onOpenSemanticSearch,
  onOpenGraphView,
  onOpenModuleStore,
  onOpenDashboard,
  onOpenSettings,
  activeModules,
}: SidebarProps) {
  return (
    <>
      {!isCollapsed && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggleCollapse} />}

      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-80 border-r border-border bg-sidebar flex flex-col
          transition-transform duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full md:translate-x-0 md:w-0 md:border-0 md:overflow-hidden" : "translate-x-0"}
        `}
        data-onboarding="sidebar"
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif font-semibold text-sidebar-foreground">Notes</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="md:hidden rounded-full h-8 w-8 neuro-flat hover:neuro-pressed"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search bar with neuromorphic style */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-11 neuro-inset bg-sidebar border-0 rounded-full h-12 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          <div className="flex gap-2 mb-4 flex-wrap" data-onboarding="modules">
            {activeModules.map((module) => {
              const IconComponent = getIconComponent(module.icon)
              const handleClick =
                module.id === "dashboard"
                  ? onOpenDashboard
                  : module.id === "semantic-search"
                    ? onOpenSemanticSearch
                    : module.id === "graph-view"
                      ? onOpenGraphView
                      : undefined

              if (!handleClick) return null

              return (
                <Button
                  key={module.id}
                  variant="ghost"
                  size="icon"
                  onClick={handleClick}
                  className="neuro-flat hover:neuro-raised rounded-full h-12 w-12 shrink-0"
                  title={module.name}
                  data-onboarding={module.id === "dashboard" ? "dashboard" : module.id === "graph-view" ? "graph" : ""}
                >
                  <IconComponent className="h-5 w-5 text-accent" />
                </Button>
              )
            })}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenModuleStore}
              className="neuro-flat hover:neuro-raised rounded-full h-12 w-12 shrink-0"
              title="Boutique de modules"
              data-onboarding="store"
            >
              <Store className="h-5 w-5 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              className="neuro-flat hover:neuro-raised rounded-full h-12 w-12 shrink-0"
              title="Paramètres"
              data-onboarding="settings"
            >
              <SettingsIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          {/* New note button */}
          <Button
            onClick={onCreateNote}
            className="w-full neuro-raised hover:neuro-flat transition-all duration-200 rounded-full h-12 bg-primary text-primary-foreground border-0"
            data-onboarding="create-note"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle note
          </Button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune note</p>
            </div>
          ) : (
            notes.map((note) => (
              <Popover key={note.id}>
                <div
                  className={`group relative rounded-3xl p-4 cursor-pointer transition-all duration-200 ${
                    activeNoteId === note.id
                      ? "neuro-pressed bg-sidebar-accent"
                      : "neuro-flat hover:neuro-raised bg-sidebar"
                  }`}
                  onClick={() => onNoteSelect(note.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sidebar-foreground truncate mb-1">
                        {note.title || "Sans titre"}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {note.content.substring(0, 60) || "Note vide"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.updatedAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>

                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 neuro-flat hover:neuro-pressed"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                  </div>
                </div>

                <PopoverContent
                  className="w-64 p-4 neuro-raised rounded-3xl bg-popover border-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-3">
                    <p className="text-sm text-popover-foreground font-medium">Supprimer cette note ?</p>
                    <p className="text-xs text-muted-foreground">Cette action est irréversible.</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-full neuro-flat border-0 bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 rounded-full neuro-raised bg-destructive text-destructive-foreground border-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteNote(note.id)
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))
          )}
        </div>
      </aside>
    </>
  )
}
