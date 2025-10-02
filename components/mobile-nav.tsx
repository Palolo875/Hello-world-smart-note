"use client"

import { Home, FileText, Search, Network, Store, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AppModule } from "@/types/note"

interface MobileNavProps {
  activeView: "notes" | "dashboard" | "search" | "graph" | "store" | "settings"
  onViewChange: (view: "notes" | "dashboard" | "search" | "graph" | "store" | "settings") => void
  activeModules: AppModule[]
}

export function MobileNav({ activeView, onViewChange, activeModules }: MobileNavProps) {
  const navItems = [
    {
      id: "dashboard" as const,
      icon: Home,
      label: "Accueil",
      moduleId: "dashboard",
    },
    {
      id: "notes" as const,
      icon: FileText,
      label: "Notes",
      moduleId: "editor",
    },
    {
      id: "search" as const,
      icon: Search,
      label: "Recherche",
      moduleId: "semantic-search",
    },
    {
      id: "graph" as const,
      icon: Network,
      label: "Graphe",
      moduleId: "graph-view",
    },
    {
      id: "store" as const,
      icon: Store,
      label: "Store",
      moduleId: null,
    },
  ]

  const visibleItems = navItems.filter((item) => !item.moduleId || activeModules.some((m) => m.id === item.moduleId))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={`flex-col gap-1 h-auto py-2 px-3 rounded-2xl transition-all duration-200 ${
                isActive ? "neuro-pressed bg-primary/10 text-primary" : "neuro-flat text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          )
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange("settings")}
          className={`flex-col gap-1 h-auto py-2 px-3 rounded-2xl transition-all duration-200 ${
            activeView === "settings" ? "neuro-pressed bg-primary/10 text-primary" : "neuro-flat text-muted-foreground"
          }`}
        >
          <Settings className={`h-5 w-5 ${activeView === "settings" ? "text-primary" : ""}`} />
          <span className="text-xs font-medium">Plus</span>
        </Button>
      </div>
    </nav>
  )
}
