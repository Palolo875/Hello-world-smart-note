"use client"

import { useState, useMemo } from "react"
import {
  Menu,
  Search,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Tag,
  Network,
  BarChart3,
  Settings,
  X,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Note, AppModule, DashboardInsight, ActivityStats, ProgressData } from "@/types/note"
import { formatDistanceToNow, subDays, subWeeks, isAfter, isBefore, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"

interface DashboardProps {
  notes: Note[]
  modules: AppModule[]
  onNoteSelect: (id: string) => void
  onCreateNote: () => void
  onClose: () => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function Dashboard({
  notes,
  modules,
  onNoteSelect,
  onCreateNote,
  onClose,
  isSidebarCollapsed,
  onToggleSidebar,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "all">("week")
  const [showSettings, setShowSettings] = useState(false)

  // AI-powered insights generation
  const insights = useMemo((): DashboardInsight[] => {
    const generatedInsights: DashboardInsight[] = []

    // Find overdue or old notes (not updated in 2+ weeks)
    const twoWeeksAgo = subWeeks(new Date(), 2)
    const oldNotes = notes.filter((note) => isBefore(new Date(note.updatedAt), twoWeeksAgo))

    if (oldNotes.length > 0) {
      generatedInsights.push({
        id: "old-notes",
        type: "warning",
        title: `${oldNotes.length} note${oldNotes.length > 1 ? "s" : ""} non mise${oldNotes.length > 1 ? "s" : ""} à jour`,
        description: `Vous avez des notes qui n'ont pas été modifiées depuis plus de 2 semaines. Peut-être est-il temps de les réviser ?`,
        actionLabel: "Voir les notes",
        actionData: oldNotes,
        priority: 8,
        createdAt: new Date().toISOString(),
      })
    }

    // Check for notes with "TODO" or "À FAIRE" in content
    const todoNotes = notes.filter(
      (note) =>
        note.content.toLowerCase().includes("todo") ||
        note.content.toLowerCase().includes("à faire") ||
        note.content.toLowerCase().includes("tâche"),
    )

    if (todoNotes.length > 0) {
      generatedInsights.push({
        id: "todo-notes",
        type: "priority",
        title: `${todoNotes.length} note${todoNotes.length > 1 ? "s" : ""} avec des tâches`,
        description: "Des notes contiennent des tâches ou des actions à effectuer.",
        actionLabel: "Voir les tâches",
        actionData: todoNotes,
        priority: 9,
        createdAt: new Date().toISOString(),
      })
    }

    // Productivity insight
    const recentNotes = notes.filter((note) => isAfter(new Date(note.createdAt), subDays(new Date(), 7)))
    if (recentNotes.length > 5) {
      generatedInsights.push({
        id: "productivity-high",
        type: "success",
        title: "Excellente productivité !",
        description: `Vous avez créé ${recentNotes.length} notes cette semaine. Continuez comme ça !`,
        priority: 5,
        createdAt: new Date().toISOString(),
      })
    } else if (recentNotes.length === 0) {
      generatedInsights.push({
        id: "productivity-low",
        type: "info",
        title: "Aucune note cette semaine",
        description: "Commencez une nouvelle note pour capturer vos idées.",
        actionLabel: "Créer une note",
        priority: 6,
        createdAt: new Date().toISOString(),
      })
    }

    // Connection insights
    const notesWithConnections = notes.filter((note) => note.connections && note.connections.length > 0)
    if (notesWithConnections.length > 0) {
      generatedInsights.push({
        id: "connections",
        type: "info",
        title: "Réseau de connaissances",
        description: `${notesWithConnections.length} notes sont connectées entre elles. Explorez votre graphe de connaissances.`,
        actionLabel: "Voir le graphe",
        priority: 4,
        createdAt: new Date().toISOString(),
      })
    }

    // Tag usage insight
    const notesWithTags = notes.filter((note) => note.tags && note.tags.length > 0)
    const allTags = notes.flatMap((note) => note.tags || [])
    const uniqueTags = new Set(allTags)

    if (uniqueTags.size > 10) {
      generatedInsights.push({
        id: "tags-many",
        type: "info",
        title: `${uniqueTags.size} tags utilisés`,
        description: "Vous avez un système de tags bien développé. Pensez à les organiser.",
        priority: 3,
        createdAt: new Date().toISOString(),
      })
    }

    return generatedInsights.sort((a, b) => b.priority - a.priority)
  }, [notes])

  // Calculate activity stats
  const activityStats = useMemo((): ActivityStats => {
    const now = new Date()
    let startDate: Date

    switch (selectedPeriod) {
      case "today":
        startDate = startOfDay(now)
        break
      case "week":
        startDate = subWeeks(now, 1)
        break
      case "month":
        startDate = subDays(now, 30)
        break
      default:
        startDate = new Date(0)
    }

    const notesCreated = notes.filter((note) => isAfter(new Date(note.createdAt), startDate)).length
    const notesUpdated = notes.filter((note) => isAfter(new Date(note.updatedAt), startDate)).length
    const modulesUsed = modules.filter((m) => m.isActive).length
    const connectionsCreated = notes.reduce((acc, note) => acc + (note.connections?.length || 0), 0)

    return {
      notesCreated,
      notesUpdated,
      modulesUsed,
      searchesPerformed: 0, // Would need to track this
      connectionsCreated,
      period: selectedPeriod,
    }
  }, [notes, modules, selectedPeriod])

  // Calculate progress data
  const progressData = useMemo((): ProgressData => {
    const total = notes.length
    const todoNotes = notes.filter(
      (note) =>
        note.content.toLowerCase().includes("todo") ||
        note.content.toLowerCase().includes("à faire") ||
        note.content.toLowerCase().includes("tâche"),
    )
    const completedNotes = notes.filter(
      (note) =>
        note.content.toLowerCase().includes("terminé") ||
        note.content.toLowerCase().includes("fait") ||
        note.content.toLowerCase().includes("✓"),
    )
    const overdueNotes = notes.filter((note) => isBefore(new Date(note.updatedAt), subWeeks(new Date(), 2)))

    return {
      total,
      completed: completedNotes.length,
      inProgress: todoNotes.length,
      overdue: overdueNotes.length,
    }
  }, [notes])

  const getInsightIcon = (type: DashboardInsight["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "priority":
        return <Zap className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      default:
        return <Sparkles className="h-5 w-5 text-blue-500" />
    }
  }

  const recentNotes = useMemo(() => {
    return [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
  }, [notes])

  return (
    <main
      className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "ml-0" : ""} pb-20 md:pb-0`}
    >
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="hidden md:flex neuro-flat hover:neuro-pressed rounded-full h-10 w-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg md:text-2xl font-serif font-semibold text-foreground">Tableau de Bord</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Vue d'ensemble intelligente</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover open={showSettings} onOpenChange={setShowSettings}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="neuro-flat hover:neuro-raised rounded-full h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 neuro-raised rounded-3xl bg-popover border-0">
                <div className="space-y-4">
                  <h3 className="font-medium text-popover-foreground">Paramètres du Dashboard</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Période d'analyse</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["today", "week", "month", "all"] as const).map((period) => (
                        <Button
                          key={period}
                          size="sm"
                          variant={selectedPeriod === period ? "default" : "outline"}
                          onClick={() => setSelectedPeriod(period)}
                          className={`rounded-full text-xs ${
                            selectedPeriod === period
                              ? "neuro-pressed bg-primary text-primary-foreground"
                              : "neuro-flat border-0"
                          }`}
                        >
                          {period === "today"
                            ? "Aujourd'hui"
                            : period === "week"
                              ? "Semaine"
                              : period === "month"
                                ? "Mois"
                                : "Tout"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hidden md:flex neuro-flat hover:neuro-pressed rounded-full h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 md:px-6 pb-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher dans le dashboard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 neuro-inset bg-background border-0 rounded-full h-12 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="neuro-raised rounded-3xl p-6 bg-card">
            <div className="flex items-center justify-between mb-3">
              <FileText className="h-8 w-8 text-primary" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{activityStats.notesCreated}</p>
            <p className="text-sm text-muted-foreground">Notes créées</p>
          </div>

          <div className="neuro-raised rounded-3xl p-6 bg-card">
            <div className="flex items-center justify-between mb-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{activityStats.notesUpdated}</p>
            <p className="text-sm text-muted-foreground">Notes mises à jour</p>
          </div>

          <div className="neuro-raised rounded-3xl p-6 bg-card">
            <div className="flex items-center justify-between mb-3">
              <Network className="h-8 w-8 text-purple-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{activityStats.connectionsCreated}</p>
            <p className="text-sm text-muted-foreground">Connexions</p>
          </div>

          <div className="neuro-raised rounded-3xl p-6 bg-card">
            <div className="flex items-center justify-between mb-3">
              <Zap className="h-8 w-8 text-orange-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{activityStats.modulesUsed}</p>
            <p className="text-sm text-muted-foreground">Modules actifs</p>
          </div>
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="neuro-raised rounded-3xl p-4 md:p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Insights IA</h2>
              </div>
              <span className="text-xs text-muted-foreground">{insights.length} insights</span>
            </div>

            <div className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="neuro-flat rounded-2xl p-4 bg-background/50">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-1">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      {insight.actionLabel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="neuro-flat hover:neuro-pressed rounded-full h-8 px-4 text-xs"
                          onClick={() => {
                            if (insight.actionLabel === "Créer une note") {
                              onCreateNote()
                            }
                          }}
                        >
                          {insight.actionLabel}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Progress overview */}
          <div className="neuro-raised rounded-3xl p-4 md:p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Progression</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-sm font-medium text-foreground">{progressData.total} notes</span>
                </div>
                <div className="h-2 neuro-inset rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">En cours</span>
                  <span className="text-sm font-medium text-foreground">{progressData.inProgress}</span>
                </div>
                <div className="h-2 neuro-inset rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(progressData.inProgress / progressData.total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Terminées</span>
                  <span className="text-sm font-medium text-foreground">{progressData.completed}</span>
                </div>
                <div className="h-2 neuro-inset rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(progressData.completed / progressData.total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">En retard</span>
                  <span className="text-sm font-medium text-foreground">{progressData.overdue}</span>
                </div>
                <div className="h-2 neuro-inset rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${(progressData.overdue / progressData.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent notes */}
          <div className="neuro-raised rounded-3xl p-4 md:p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Notes récentes</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCreateNote}
                className="neuro-flat hover:neuro-pressed rounded-full h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onNoteSelect(note.id)}
                  className="neuro-flat hover:neuro-raised rounded-2xl p-3 cursor-pointer transition-all duration-200 bg-background/50"
                >
                  <h3 className="font-medium text-foreground text-sm mb-1 truncate">{note.title || "Sans titre"}</h3>
                  <p className="text-xs text-muted-foreground truncate mb-2">
                    {note.content.substring(0, 50) || "Note vide"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(note.updatedAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                    {note.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full neuro-inset bg-background/50">
                        {note.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="neuro-raised rounded-3xl p-4 md:p-6 bg-card">
          <h2 className="text-base md:text-lg font-semibold text-foreground mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              onClick={onCreateNote}
              className="neuro-flat hover:neuro-raised rounded-2xl h-auto py-4 flex-col gap-2 bg-background/50 border-0"
            >
              <Plus className="h-6 w-6 text-primary" />
              <span className="text-xs text-foreground">Nouvelle note</span>
            </Button>

            <Button className="neuro-flat hover:neuro-raised rounded-2xl h-auto py-4 flex-col gap-2 bg-background/50 border-0">
              <Search className="h-6 w-6 text-blue-500" />
              <span className="text-xs text-foreground">Rechercher</span>
            </Button>

            <Button className="neuro-flat hover:neuro-raised rounded-2xl h-auto py-4 flex-col gap-2 bg-background/50 border-0">
              <Network className="h-6 w-6 text-purple-500" />
              <span className="text-xs text-foreground">Graphe</span>
            </Button>

            <Button className="neuro-flat hover:neuro-raised rounded-2xl h-auto py-4 flex-col gap-2 bg-background/50 border-0">
              <Tag className="h-6 w-6 text-orange-500" />
              <span className="text-xs text-foreground">Tags</span>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
