"use client"

import type React from "react"

import { useState } from "react"
import {
  X,
  Menu,
  Globe,
  Type,
  Palette,
  Database,
  Sliders,
  Download,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { AppSettings, Note, AppModule } from "@/types/note"

interface SettingsProps {
  settings: AppSettings
  onUpdateSettings: (settings: AppSettings) => void
  modules: AppModule[]
  notes: Note[]
  onClose: () => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function Settings({
  settings,
  onUpdateSettings,
  modules,
  notes,
  onClose,
  isSidebarCollapsed,
  onToggleSidebar,
}: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [activeTab, setActiveTab] = useState<"general" | "editor" | "ui" | "data" | "advanced">("general")
  const [showSaveNotification, setShowSaveNotification] = useState(false)

  const handleSave = () => {
    onUpdateSettings(localSettings)
    setShowSaveNotification(true)
    setTimeout(() => setShowSaveNotification(false), 3000)
  }

  const handleReset = () => {
    setLocalSettings(settings)
  }

  const handleExportData = () => {
    const data = {
      notes,
      modules,
      settings: localSettings,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `smart-notes-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.settings) {
          setLocalSettings(data.settings)
        }
      } catch (error) {
        console.error("Error importing data:", error)
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (confirm("Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const tabs = [
    { id: "general" as const, label: "Général", icon: Globe },
    { id: "editor" as const, label: "Éditeur", icon: Type },
    { id: "ui" as const, label: "Interface", icon: Palette },
    { id: "data" as const, label: "Données", icon: Database },
    { id: "advanced" as const, label: "Avancé", icon: Sliders },
  ]

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {isSidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="neuro-flat hover:neuro-raised rounded-full h-10 w-10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-serif font-semibold text-foreground">Paramètres</h1>
              <p className="text-sm text-muted-foreground">Personnalisez votre expérience</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showSaveNotification && (
              <div className="flex items-center gap-2 px-4 py-2 neuro-raised rounded-full bg-success/10 text-success animate-in fade-in slide-in-from-right">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Sauvegardé</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="neuro-flat hover:neuro-raised rounded-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={handleSave} className="neuro-raised hover:neuro-flat rounded-full bg-primary">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="neuro-flat hover:neuro-raised rounded-full h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "neuro-pressed bg-primary/10 text-primary"
                    : "neuro-flat hover:neuro-raised text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <SettingCard title="Nom de l'application" description="Personnalisez le nom de votre application">
                <Input
                  value={localSettings.general.appName}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      general: { ...localSettings.general, appName: e.target.value },
                    })
                  }
                  className="neuro-inset rounded-full"
                />
              </SettingCard>

              <SettingCard title="Langue" description="Choisissez la langue de l'interface">
                <select
                  value={localSettings.general.language}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      general: { ...localSettings.general, language: e.target.value as any },
                    })
                  }
                  className="w-full px-4 py-3 neuro-inset rounded-full bg-background text-foreground"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </SettingCard>

              <SettingCard title="Format de date" description="Choisissez comment afficher les dates">
                <select
                  value={localSettings.general.dateFormat}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      general: { ...localSettings.general, dateFormat: e.target.value as any },
                    })
                  }
                  className="w-full px-4 py-3 neuro-inset rounded-full bg-background text-foreground"
                >
                  <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                  <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                  <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
                </select>
              </SettingCard>

              <SettingCard title="Format d'heure" description="Format 12h ou 24h">
                <select
                  value={localSettings.general.timeFormat}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      general: { ...localSettings.general, timeFormat: e.target.value as any },
                    })
                  }
                  className="w-full px-4 py-3 neuro-inset rounded-full bg-background text-foreground"
                >
                  <option value="12h">12 heures (AM/PM)</option>
                  <option value="24h">24 heures</option>
                </select>
              </SettingCard>
            </div>
          )}

          {/* Editor Settings */}
          {activeTab === "editor" && (
            <div className="space-y-6">
              <SettingCard title="Police de caractères" description="Choisissez la police pour l'éditeur">
                <select
                  value={localSettings.editor.fontFamily}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      editor: { ...localSettings.editor, fontFamily: e.target.value as any },
                    })
                  }
                  className="w-full px-4 py-3 neuro-inset rounded-full bg-background text-foreground"
                >
                  <option value="sans">Sans-serif (Moderne)</option>
                  <option value="serif">Serif (Classique)</option>
                  <option value="mono">Monospace (Code)</option>
                </select>
              </SettingCard>

              <SettingCard title="Taille de police" description={`Taille actuelle: ${localSettings.editor.fontSize}px`}>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={localSettings.editor.fontSize}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      editor: { ...localSettings.editor, fontSize: Number.parseInt(e.target.value) },
                    })
                  }
                  className="w-full"
                />
              </SettingCard>

              <SettingCard
                title="Hauteur de ligne"
                description={`Espacement actuel: ${localSettings.editor.lineHeight}`}
              >
                <input
                  type="range"
                  min="1.2"
                  max="2.0"
                  step="0.1"
                  value={localSettings.editor.lineHeight}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      editor: { ...localSettings.editor, lineHeight: Number.parseFloat(e.target.value) },
                    })
                  }
                  className="w-full"
                />
              </SettingCard>

              <SettingCard
                title="Sauvegarde automatique"
                description="Sauvegarder automatiquement vos modifications"
                info="Les notes sont sauvegardées automatiquement pendant que vous écrivez"
              >
                <Switch
                  checked={localSettings.editor.autoSave}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      editor: { ...localSettings.editor, autoSave: checked },
                    })
                  }
                />
              </SettingCard>

              {localSettings.editor.autoSave && (
                <SettingCard
                  title="Intervalle de sauvegarde"
                  description={`Sauvegarder toutes les ${localSettings.editor.autoSaveInterval} secondes`}
                >
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={localSettings.editor.autoSaveInterval}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        editor: { ...localSettings.editor, autoSaveInterval: Number.parseInt(e.target.value) },
                      })
                    }
                    className="w-full"
                  />
                </SettingCard>
              )}

              <SettingCard title="Vérification orthographique" description="Activer la correction orthographique">
                <Switch
                  checked={localSettings.editor.spellCheck}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      editor: { ...localSettings.editor, spellCheck: checked },
                    })
                  }
                />
              </SettingCard>

              <SettingCard title="Retour à la ligne" description="Retour automatique à la ligne du texte">
                <Switch
                  checked={localSettings.editor.wordWrap}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      editor: { ...localSettings.editor, wordWrap: checked },
                    })
                  }
                />
              </SettingCard>

              <SettingCard title="Compteur de mots" description="Afficher le nombre de mots">
                <Switch
                  checked={localSettings.editor.showWordCount}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      editor: { ...localSettings.editor, showWordCount: checked },
                    })
                  }
                />
              </SettingCard>
            </div>
          )}

          {/* UI Settings */}
          {activeTab === "ui" && (
            <div className="space-y-6">
              <SettingCard title="Thème" description="Choisissez l'apparence de l'application">
                <select
                  value={localSettings.ui.theme}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      ui: { ...localSettings.ui, theme: e.target.value as any },
                    })
                  }
                  className="w-full px-4 py-3 neuro-inset rounded-full bg-background text-foreground"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </select>
              </SettingCard>

              <SettingCard title="Couleur d'accent" description="Personnalisez la couleur principale">
                <div className="flex gap-3">
                  {["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"].map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          ui: { ...localSettings.ui, accentColor: color },
                        })
                      }
                      className={`w-12 h-12 rounded-full neuro-flat hover:neuro-raised transition-all ${
                        localSettings.ui.accentColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </SettingCard>

              <SettingCard title="Animations" description="Activer les animations de l'interface">
                <Switch
                  checked={localSettings.ui.animations}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      ui: { ...localSettings.ui, animations: checked },
                    })
                  }
                />
              </SettingCard>

              {localSettings.ui.animations && (
                <SettingCard title="Vitesse des animations" description="Contrôlez la rapidité des animations">
                  <select
                    value={localSettings.ui.animationSpeed}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        ui: { ...localSettings.ui, animationSpeed: e.target.value as any },
                      })
                    }
                    className="w-full px-4 py-3 neuro-inset rounded-full bg-background text-foreground"
                  >
                    <option value="slow">Lente</option>
                    <option value="normal">Normale</option>
                    <option value="fast">Rapide</option>
                  </select>
                </SettingCard>
              )}

              <SettingCard title="Position de la barre latérale" description="Gauche ou droite">
                <select
                  value={localSettings.ui.sidebarPosition}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      ui: { ...localSettings.ui, sidebarPosition: e.target.value as any },
                    })
                  }
                  className="w-full px-4 py-3 neuro-inset rounded-full bg-background text-foreground"
                >
                  <option value="left">Gauche</option>
                  <option value="right">Droite</option>
                </select>
              </SettingCard>

              <SettingCard title="État par défaut de la sidebar" description="Ouverte ou fermée au démarrage">
                <select
                  value={localSettings.ui.sidebarDefaultState}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      ui: { ...localSettings.ui, sidebarDefaultState: e.target.value as any },
                    })
                  }
                  className="w-full px-4 py-3 neuro-inset rounded-full bg-background text-foreground"
                >
                  <option value="expanded">Ouverte</option>
                  <option value="collapsed">Fermée</option>
                </select>
              </SettingCard>

              <SettingCard title="Mode compact" description="Interface plus dense avec moins d'espacement">
                <Switch
                  checked={localSettings.ui.compactMode}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      ui: { ...localSettings.ui, compactMode: checked },
                    })
                  }
                />
              </SettingCard>
            </div>
          )}

          {/* Data Settings */}
          {activeTab === "data" && (
            <div className="space-y-6">
              <SettingCard
                title="Sauvegarde automatique"
                description="Créer automatiquement des sauvegardes"
                info="Les sauvegardes sont stockées localement dans votre navigateur"
              >
                <Switch
                  checked={localSettings.data.autoBackup}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      data: { ...localSettings.data, autoBackup: checked },
                    })
                  }
                />
              </SettingCard>

              {localSettings.data.autoBackup && (
                <>
                  <SettingCard
                    title="Intervalle de sauvegarde"
                    description={`Sauvegarder toutes les ${localSettings.data.backupInterval} heures`}
                  >
                    <input
                      type="range"
                      min="1"
                      max="168"
                      value={localSettings.data.backupInterval}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          data: { ...localSettings.data, backupInterval: Number.parseInt(e.target.value) },
                        })
                      }
                      className="w-full"
                    />
                  </SettingCard>

                  <SettingCard
                    title="Nombre maximum de sauvegardes"
                    description={`Conserver ${localSettings.data.maxBackups} sauvegardes`}
                  >
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={localSettings.data.maxBackups}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          data: { ...localSettings.data, maxBackups: Number.parseInt(e.target.value) },
                        })
                      }
                      className="w-full"
                    />
                  </SettingCard>
                </>
              )}

              <SettingCard title="Format d'exportation" description="Format par défaut pour l'export">
                <select
                  value={localSettings.data.exportFormat}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      data: { ...localSettings.data, exportFormat: e.target.value as any },
                    })
                  }
                  className="w-full px-4 py-3 neuro-inset rounded-full bg-background text-foreground"
                >
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                </select>
              </SettingCard>

              <div className="neuro-raised rounded-3xl p-6 bg-card space-y-4">
                <h3 className="font-semibold text-foreground">Gestion des données</h3>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleExportData}
                    className="w-full neuro-flat hover:neuro-raised rounded-full justify-start"
                    variant="ghost"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter toutes les données
                  </Button>
                  <label className="w-full">
                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                    <Button
                      type="button"
                      className="w-full neuro-flat hover:neuro-raised rounded-full justify-start"
                      variant="ghost"
                      onClick={() =>
                        document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent("click"))
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importer des données
                    </Button>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="w-full neuro-flat hover:neuro-raised rounded-full justify-start text-destructive"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Effacer toutes les données
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 neuro-raised rounded-3xl bg-popover border-0">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-popover-foreground">Attention !</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Cette action supprimera définitivement toutes vos notes, paramètres et données. Cette
                              action est irréversible.
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={handleClearData}
                          className="w-full neuro-raised rounded-full bg-destructive text-destructive-foreground"
                        >
                          Confirmer la suppression
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="neuro-raised rounded-3xl p-6 bg-card/50 border border-warning/20">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Paramètres avancés</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ces paramètres sont destinés aux utilisateurs avancés. Modifiez-les avec précaution.
                    </p>
                  </div>
                </div>
              </div>

              <SettingCard
                title="Mode développeur"
                description="Activer les outils de développement"
                info="Affiche des informations de débogage et des outils supplémentaires"
              >
                <Switch
                  checked={localSettings.advanced.developerMode}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      advanced: { ...localSettings.advanced, developerMode: checked },
                    })
                  }
                />
              </SettingCard>

              <SettingCard
                title="Mode débogage"
                description="Afficher les logs de débogage dans la console"
                info="Utile pour diagnostiquer les problèmes"
              >
                <Switch
                  checked={localSettings.advanced.debugMode}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      advanced: { ...localSettings.advanced, debugMode: checked },
                    })
                  }
                />
              </SettingCard>

              <SettingCard
                title="Mode performance"
                description="Optimiser pour les performances"
                info="Désactive certaines animations et effets pour améliorer les performances"
              >
                <Switch
                  checked={localSettings.advanced.performanceMode}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      advanced: { ...localSettings.advanced, performanceMode: checked },
                    })
                  }
                />
              </SettingCard>

              <SettingCard
                title="Fonctionnalités expérimentales"
                description="Activer les fonctionnalités en cours de développement"
                info="Ces fonctionnalités peuvent être instables"
              >
                <Switch
                  checked={localSettings.advanced.experimentalFeatures}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      advanced: { ...localSettings.advanced, experimentalFeatures: checked },
                    })
                  }
                />
              </SettingCard>

              <SettingCard title="Taille du cache" description={`Cache actuel: ${localSettings.advanced.cacheSize} MB`}>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="50"
                  value={localSettings.advanced.cacheSize}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      advanced: { ...localSettings.advanced, cacheSize: Number.parseInt(e.target.value) },
                    })
                  }
                  className="w-full"
                />
              </SettingCard>

              <SettingCard
                title="Taille maximale des notes"
                description={`Limite: ${(localSettings.advanced.maxNoteSize / 1000).toFixed(0)} KB`}
              >
                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="100000"
                  value={localSettings.advanced.maxNoteSize}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      advanced: { ...localSettings.advanced, maxNoteSize: Number.parseInt(e.target.value) },
                    })
                  }
                  className="w-full"
                />
              </SettingCard>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface SettingCardProps {
  title: string
  description: string
  info?: string
  children: React.ReactNode
}

function SettingCard({ title, description, info, children }: SettingCardProps) {
  return (
    <div className="neuro-raised rounded-3xl p-6 bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {info && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 neuro-raised rounded-2xl bg-popover border-0">
                  <p className="text-xs text-popover-foreground">{info}</p>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </div>
  )
}
