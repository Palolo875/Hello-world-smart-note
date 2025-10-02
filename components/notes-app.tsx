"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { OfflineIndicator } from "@/components/offline-indicator"
import { Editor } from "@/components/editor"
import { SemanticSearch } from "@/components/semantic-search"
import { GraphView } from "@/components/graph-view"
import { ModuleStore } from "@/components/module-store"
import { Dashboard } from "@/components/dashboard"
import { Settings } from "@/components/settings"
import { Onboarding, WelcomeScreen } from "@/components/onboarding"
import type { Note, AppModule, ModuleSettings, AppSettings, OnboardingState } from "@/types/note"

const DEFAULT_MODULES: AppModule[] = [
  {
    id: "dashboard",
    name: "Tableau de Bord",
    description: "Vue d'ensemble intelligente de vos activités, statistiques et insights IA",
    icon: "LayoutDashboard",
    category: "productivity",
    isActive: true,
    version: "1.0.0",
  },
  {
    id: "editor",
    name: "Éditeur de Notes",
    description: "Éditeur immersif et plein écran pour écrire vos notes avec formatage de texte",
    icon: "FileText",
    category: "productivity",
    isActive: true,
    version: "1.0.0",
  },
  {
    id: "semantic-search",
    name: "Recherche Sémantique",
    description: "Recherche avancée avec filtres, historique et suggestions intelligentes",
    icon: "Sparkles",
    category: "ai",
    isActive: true,
    version: "1.0.0",
  },
  {
    id: "graph-view",
    name: "Vue Graphique",
    description: "Visualisez les connexions entre vos notes avec un graphe interactif",
    icon: "Network",
    category: "visualization",
    isActive: true,
    version: "1.0.0",
  },
  {
    id: "tags-manager",
    name: "Gestionnaire de Tags",
    description: "Organisez vos notes avec un système de tags avancé et des filtres intelligents",
    icon: "Tag",
    category: "organization",
    isActive: false,
    version: "1.0.0",
  },
  {
    id: "calendar-view",
    name: "Vue Calendrier",
    description: "Visualisez vos notes dans un calendrier pour suivre votre progression",
    icon: "Calendar",
    category: "visualization",
    isActive: false,
    version: "1.0.0",
  },
  {
    id: "ai-assistant",
    name: "Assistant IA",
    description: "Assistant intelligent pour améliorer vos notes et générer du contenu",
    icon: "Bot",
    category: "ai",
    isActive: false,
    isPremium: true,
    version: "1.0.0",
  },
]

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    appName: "Smart Notes",
    language: "fr",
    timezone: "Europe/Paris",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
  },
  editor: {
    fontFamily: "sans",
    fontSize: 16,
    lineHeight: 1.6,
    autoSave: true,
    autoSaveInterval: 30,
    spellCheck: true,
    wordWrap: true,
    showWordCount: true,
    defaultCategory: "personnel",
  },
  ui: {
    theme: "auto",
    accentColor: "#8b5cf6",
    animations: true,
    animationSpeed: "normal",
    sidebarPosition: "left",
    sidebarDefaultState: "expanded",
    compactMode: false,
    showThumbnails: true,
  },
  data: {
    autoBackup: true,
    backupInterval: 24,
    maxBackups: 5,
    exportFormat: "json",
    syncEnabled: false,
  },
  modules: {},
  advanced: {
    developerMode: false,
    debugMode: false,
    performanceMode: false,
    experimentalFeatures: false,
    cacheSize: 100,
    maxNoteSize: 1000000,
  },
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showSemanticSearch, setShowSemanticSearch] = useState(false)
  const [showGraphView, setShowGraphView] = useState(false)
  const [showModuleStore, setShowModuleStore] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [modules, setModules] = useState<AppModule[]>(DEFAULT_MODULES)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isCompleted: false,
    currentStep: 0,
    completedSteps: [],
    skipped: false,
    lastShownAt: null,
  })
  const [showWelcome, setShowWelcome] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [mobileView, setMobileView] = useState<"notes" | "dashboard" | "search" | "graph" | "store" | "settings">(
    "dashboard",
  )

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes)
      setNotes(parsedNotes)
      if (parsedNotes.length > 0) {
        setActiveNoteId(parsedNotes[0].id)
      }
    } else {
      const welcomeNote: Note = {
        id: crypto.randomUUID(),
        title: "Bienvenue",
        content: "Commencez à écrire vos pensées...",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: "personnel",
      }
      setNotes([welcomeNote])
      setActiveNoteId(welcomeNote.id)
    }

    const savedModules = localStorage.getItem("modules")
    if (savedModules) {
      setModules(JSON.parse(savedModules))
    }

    const savedSettings = localStorage.getItem("appSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    const savedOnboarding = localStorage.getItem("onboardingState")
    if (savedOnboarding) {
      const parsedOnboarding = JSON.parse(savedOnboarding)
      setOnboardingState(parsedOnboarding)
      if (!parsedOnboarding.isCompleted && !parsedOnboarding.skipped) {
        setShowWelcome(true)
      }
    } else {
      setShowWelcome(true)
    }
  }, [])

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("notes", JSON.stringify(notes))
    }
  }, [notes])

  useEffect(() => {
    localStorage.setItem("modules", JSON.stringify(modules))
  }, [modules])

  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem("onboardingState", JSON.stringify(onboardingState))
  }, [onboardingState])

  const activeNote = notes.find((note) => note.id === activeNoteId)

  const activeModules = modules.filter((m) => m.isActive)

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "Nouvelle note",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: settings.editor.defaultCategory,
    }
    setNotes([newNote, ...notes])
    setActiveNoteId(newNote.id)
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true)
    }
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note)),
    )
  }

  const deleteNote = (id: string) => {
    const newNotes = notes.filter((note) => note.id !== id)
    setNotes(newNotes)
    if (activeNoteId === id) {
      setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null)
    }
  }

  const handleMobileViewChange = (view: "notes" | "dashboard" | "search" | "graph" | "store" | "settings") => {
    setMobileView(view)
    switch (view) {
      case "dashboard":
        setShowDashboard(true)
        setShowSemanticSearch(false)
        setShowGraphView(false)
        setShowModuleStore(false)
        setShowSettings(false)
        break
      case "search":
        setShowSemanticSearch(true)
        setShowDashboard(false)
        setShowGraphView(false)
        setShowModuleStore(false)
        setShowSettings(false)
        break
      case "graph":
        setShowGraphView(true)
        setShowDashboard(false)
        setShowSemanticSearch(false)
        setShowModuleStore(false)
        setShowSettings(false)
        break
      case "store":
        setShowModuleStore(true)
        setShowDashboard(false)
        setShowSemanticSearch(false)
        setShowGraphView(false)
        setShowSettings(false)
        break
      case "settings":
        setShowSettings(true)
        setShowDashboard(false)
        setShowSemanticSearch(false)
        setShowGraphView(false)
        setShowModuleStore(false)
        break
      case "notes":
        setShowDashboard(false)
        setShowSemanticSearch(false)
        setShowGraphView(false)
        setShowModuleStore(false)
        setShowSettings(false)
        break
    }
  }

  const handleNoteSelect = (id: string) => {
    setActiveNoteId(id)
    setShowSemanticSearch(false)
    setShowGraphView(false)
    setShowModuleStore(false)
    setShowDashboard(false)
    setShowSettings(false)
    setMobileView("notes")
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true)
    }
  }

  const handleToggleModule = (moduleId: string) => {
    setModules(modules.map((m) => (m.id === moduleId ? { ...m, isActive: !m.isActive } : m)))
  }

  const handleUpdateModuleSettings = (moduleId: string, settings: ModuleSettings) => {
    setModules(modules.map((m) => (m.id === moduleId ? { ...m, settings } : m)))
  }

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings)
  }

  const handleStartOnboarding = () => {
    setShowWelcome(false)
    setShowOnboarding(true)
  }

  const handleSkipOnboarding = () => {
    setShowWelcome(false)
    setShowOnboarding(false)
    setOnboardingState({
      ...onboardingState,
      skipped: true,
      lastShownAt: new Date().toISOString(),
    })
  }

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false)
    setOnboardingState({
      ...onboardingState,
      isCompleted: true,
      lastShownAt: new Date().toISOString(),
    })
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <OfflineIndicator />

      {showWelcome && <WelcomeScreen onStart={handleStartOnboarding} onSkip={handleSkipOnboarding} />}
      {showOnboarding && <Onboarding onComplete={handleCompleteOnboarding} onSkip={handleSkipOnboarding} />}

      <div className="hidden md:block">
        <Sidebar
          notes={filteredNotes}
          activeNoteId={activeNoteId}
          onNoteSelect={handleNoteSelect}
          onCreateNote={createNote}
          onDeleteNote={deleteNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenSemanticSearch={() => {
            setShowSemanticSearch(true)
            setShowGraphView(false)
            setShowModuleStore(false)
            setShowDashboard(false)
            setShowSettings(false)
          }}
          onOpenGraphView={() => {
            setShowGraphView(true)
            setShowSemanticSearch(false)
            setShowModuleStore(false)
            setShowDashboard(false)
            setShowSettings(false)
          }}
          onOpenModuleStore={() => {
            setShowModuleStore(true)
            setShowSemanticSearch(false)
            setShowGraphView(false)
            setShowDashboard(false)
            setShowSettings(false)
          }}
          onOpenDashboard={() => {
            setShowDashboard(true)
            setShowSemanticSearch(false)
            setShowGraphView(false)
            setShowModuleStore(false)
            setShowSettings(false)
          }}
          onOpenSettings={() => {
            setShowSettings(true)
            setShowSemanticSearch(false)
            setShowGraphView(false)
            setShowModuleStore(false)
            setShowDashboard(false)
          }}
          activeModules={activeModules}
        />
      </div>

      <div className="flex-1 flex flex-col pb-0 md:pb-0">
        {showSettings ? (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            modules={modules}
            notes={notes}
            onClose={() => {
              setShowSettings(false)
              setMobileView("dashboard")
            }}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        ) : showModuleStore ? (
          <ModuleStore
            modules={modules}
            onToggleModule={handleToggleModule}
            onUpdateModuleSettings={handleUpdateModuleSettings}
            onClose={() => {
              setShowModuleStore(false)
              setMobileView("dashboard")
            }}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        ) : showDashboard && activeModules.find((m) => m.id === "dashboard") ? (
          <Dashboard
            notes={notes}
            modules={modules}
            onNoteSelect={handleNoteSelect}
            onCreateNote={createNote}
            onClose={() => {
              setShowDashboard(false)
              setMobileView("notes")
            }}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        ) : showGraphView && activeModules.find((m) => m.id === "graph-view") ? (
          <GraphView
            notes={notes}
            onNoteSelect={handleNoteSelect}
            onUpdateNote={updateNote}
            onClose={() => {
              setShowGraphView(false)
              setMobileView("notes")
            }}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        ) : showSemanticSearch && activeModules.find((m) => m.id === "semantic-search") ? (
          <SemanticSearch
            notes={notes}
            onNoteSelect={handleNoteSelect}
            onClose={() => {
              setShowSemanticSearch(false)
              setMobileView("notes")
            }}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        ) : (
          <Editor
            note={activeNote}
            onUpdateNote={updateNote}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}
      </div>

      {!isFullscreen && (
        <MobileNav activeView={mobileView} onViewChange={handleMobileViewChange} activeModules={activeModules} />
      )}
    </div>
  )
}
