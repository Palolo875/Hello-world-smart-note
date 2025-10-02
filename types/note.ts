export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  category: string
  tags?: string[]
  connections?: string[] // Array of note IDs that this note is connected to
}

export interface GraphNode {
  id: string
  title: string
  category: string
  x: number
  y: number
  connections: string[]
  tags?: string[]
}

export interface GraphConnection {
  source: string
  target: string
  strength: number // 0-1, based on shared tags or manual connections
}

export interface AppModule {
  id: string
  name: string
  description: string
  icon: string
  category: "productivity" | "visualization" | "organization" | "ai"
  isActive: boolean
  isPremium?: boolean
  version: string
  settings?: ModuleSettings
}

export interface ModuleSettings {
  [key: string]: any
}

export interface ModuleStoreSettings {
  sortBy: "name" | "category" | "recent"
  filterCategory: "all" | "productivity" | "visualization" | "organization" | "ai"
  showInactive: boolean
}

export interface DashboardInsight {
  id: string
  type: "warning" | "info" | "success" | "priority"
  title: string
  description: string
  actionLabel?: string
  actionData?: any
  priority: number
  createdAt: string
}

export interface ActivityStats {
  notesCreated: number
  notesUpdated: number
  modulesUsed: number
  searchesPerformed: number
  connectionsCreated: number
  period: "today" | "week" | "month" | "all"
}

export interface ProgressData {
  total: number
  completed: number
  inProgress: number
  overdue: number
}

export interface AppSettings {
  general: GeneralSettings
  editor: EditorSettings
  ui: UISettings
  data: DataSettings
  modules: ModuleSettings
  advanced: AdvancedSettings
}

export interface GeneralSettings {
  appName: string
  language: "fr" | "en" | "es" | "de"
  timezone: string
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
  timeFormat: "12h" | "24h"
}

export interface EditorSettings {
  fontFamily: "sans" | "serif" | "mono"
  fontSize: number
  lineHeight: number
  autoSave: boolean
  autoSaveInterval: number
  spellCheck: boolean
  wordWrap: boolean
  showWordCount: boolean
  defaultCategory: string
}

export interface UISettings {
  theme: "light" | "dark" | "auto"
  accentColor: string
  animations: boolean
  animationSpeed: "slow" | "normal" | "fast"
  sidebarPosition: "left" | "right"
  sidebarDefaultState: "expanded" | "collapsed"
  compactMode: boolean
  showThumbnails: boolean
}

export interface DataSettings {
  autoBackup: boolean
  backupInterval: number
  maxBackups: number
  exportFormat: "json" | "markdown" | "html"
  syncEnabled: boolean
}

export interface AdvancedSettings {
  developerMode: boolean
  debugMode: boolean
  performanceMode: boolean
  experimentalFeatures: boolean
  cacheSize: number
  maxNoteSize: number
}

export interface OnboardingState {
  isCompleted: boolean
  currentStep: number
  completedSteps: string[]
  skipped: boolean
  lastShownAt: string | null
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  target: string // CSS selector or element ID
  position: "top" | "bottom" | "left" | "right" | "center"
  action?: string
  highlightElement?: boolean
}
