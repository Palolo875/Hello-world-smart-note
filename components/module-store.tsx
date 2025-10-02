"use client"

import { useState } from "react"
import {
  Menu,
  X,
  Store,
  FileText,
  Sparkles,
  Network,
  Tag,
  Calendar,
  Bot,
  Settings,
  Info,
  Crown,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import type { AppModule, ModuleSettings, ModuleStoreSettings } from "@/types/note"

interface ModuleStoreProps {
  modules: AppModule[]
  onToggleModule: (moduleId: string) => void
  onUpdateModuleSettings: (moduleId: string, settings: ModuleSettings) => void
  onClose: () => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    FileText,
    Sparkles,
    Network,
    Tag,
    Calendar,
    Bot,
  }
  return icons[iconName] || FileText
}

const categoryColors: Record<string, string> = {
  productivity: "text-blue-500",
  visualization: "text-purple-500",
  organization: "text-green-500",
  ai: "text-orange-500",
}

const categoryLabels: Record<string, string> = {
  productivity: "Productivité",
  visualization: "Visualisation",
  organization: "Organisation",
  ai: "Intelligence Artificielle",
}

export function ModuleStore({
  modules,
  onToggleModule,
  onUpdateModuleSettings,
  onClose,
  isSidebarCollapsed,
  onToggleSidebar,
}: ModuleStoreProps) {
  const [storeSettings, setStoreSettings] = useState<ModuleStoreSettings>({
    sortBy: "category",
    filterCategory: "all",
    showInactive: true,
  })

  // Filter and sort modules
  let filteredModules = modules.filter((m) => {
    if (!storeSettings.showInactive && !m.isActive) return false
    if (storeSettings.filterCategory !== "all" && m.category !== storeSettings.filterCategory) return false
    return true
  })

  // Sort modules
  filteredModules = [...filteredModules].sort((a, b) => {
    if (storeSettings.sortBy === "name") {
      return a.name.localeCompare(b.name)
    } else if (storeSettings.sortBy === "category") {
      return a.category.localeCompare(b.category)
    }
    return 0
  })

  const activeCount = modules.filter((m) => m.isActive).length
  const totalCount = modules.length

  return (
    <main
      className={`flex-1 flex flex-col bg-background transition-all duration-300 ${
        isSidebarCollapsed ? "ml-0" : "ml-0"
      }`}
    >
      {/* Toolbar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="neuro-flat hover:neuro-pressed rounded-full h-10 w-10 sm:h-12 sm:w-12"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="neuro-flat rounded-full p-2 sm:p-3">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-foreground">Boutique de Modules</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {activeCount} / {totalCount} modules actifs
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Store Settings Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="neuro-flat hover:neuro-raised rounded-full h-10 w-10 sm:h-12 sm:w-12"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-6 neuro-raised rounded-3xl bg-popover border-0">
                <div className="space-y-4">
                  <h3 className="font-semibold text-popover-foreground mb-4">Paramètres du Store</h3>

                  {/* Sort Options */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-popover-foreground">Trier par</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between neuro-inset rounded-full border-0 bg-background/50"
                        >
                          <span className="text-sm">{storeSettings.sortBy === "name" ? "Nom" : "Catégorie"}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 neuro-raised rounded-2xl bg-popover border-0">
                        <div className="space-y-1">
                          <Button
                            variant="ghost"
                            className="w-full justify-start rounded-full text-sm"
                            onClick={() => setStoreSettings({ ...storeSettings, sortBy: "name" })}
                          >
                            Nom
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start rounded-full text-sm"
                            onClick={() => setStoreSettings({ ...storeSettings, sortBy: "category" })}
                          >
                            Catégorie
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Filter Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-popover-foreground">Filtrer par catégorie</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between neuro-inset rounded-full border-0 bg-background/50"
                        >
                          <span className="text-sm">
                            {storeSettings.filterCategory === "all"
                              ? "Toutes"
                              : categoryLabels[storeSettings.filterCategory]}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2 neuro-raised rounded-2xl bg-popover border-0">
                        <div className="space-y-1">
                          <Button
                            variant="ghost"
                            className="w-full justify-start rounded-full text-sm"
                            onClick={() => setStoreSettings({ ...storeSettings, filterCategory: "all" })}
                          >
                            Toutes les catégories
                          </Button>
                          {Object.entries(categoryLabels).map(([key, label]) => (
                            <Button
                              key={key}
                              variant="ghost"
                              className="w-full justify-start rounded-full text-sm"
                              onClick={() =>
                                setStoreSettings({
                                  ...storeSettings,
                                  filterCategory: key as any,
                                })
                              }
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Show Inactive Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <label className="text-sm font-medium text-popover-foreground">Afficher les inactifs</label>
                    <Switch
                      checked={storeSettings.showInactive}
                      onCheckedChange={(checked) => setStoreSettings({ ...storeSettings, showInactive: checked })}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="neuro-flat hover:neuro-pressed rounded-full h-10 w-10 sm:h-12 sm:w-12"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredModules.map((module) => {
              const IconComponent = getIconComponent(module.icon)
              return (
                <div
                  key={module.id}
                  className={`neuro-raised rounded-3xl p-6 transition-all duration-300 ${
                    module.isActive ? "ring-2 ring-primary/20" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`neuro-flat rounded-2xl p-3 ${module.isActive ? "bg-primary/10" : "bg-muted/50"}`}>
                      <IconComponent
                        className={`h-6 w-6 ${module.isActive ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {module.isPremium && (
                        <div className="neuro-flat rounded-full px-3 py-1 flex items-center gap-1">
                          <Crown className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-medium text-yellow-600">Premium</span>
                        </div>
                      )}
                      <Switch checked={module.isActive} onCheckedChange={() => onToggleModule(module.id)} />
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-2 text-lg">{module.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{module.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${categoryColors[module.category]}`}>
                        {categoryLabels[module.category]}
                      </span>
                      <span className="text-xs text-muted-foreground">v{module.version}</span>
                    </div>

                    <div className="flex gap-2">
                      {/* Module Info Popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="neuro-flat hover:neuro-pressed rounded-full h-8 w-8"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-6 neuro-raised rounded-3xl bg-popover border-0">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="neuro-flat rounded-2xl p-2">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-popover-foreground">{module.name}</h4>
                                <p className="text-xs text-muted-foreground">Version {module.version}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
                            <div className="space-y-2 pt-2 border-t border-border">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Catégorie</span>
                                <span className={`font-medium ${categoryColors[module.category]}`}>
                                  {categoryLabels[module.category]}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Statut</span>
                                <span
                                  className={`font-medium ${module.isActive ? "text-green-500" : "text-muted-foreground"}`}
                                >
                                  {module.isActive ? "Actif" : "Inactif"}
                                </span>
                              </div>
                              {module.isPremium && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Type</span>
                                  <span className="font-medium text-yellow-600 flex items-center gap-1">
                                    <Crown className="h-3 w-3" />
                                    Premium
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Module Settings Popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="neuro-flat hover:neuro-pressed rounded-full h-8 w-8"
                            disabled={!module.isActive}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-6 neuro-raised rounded-3xl bg-popover border-0">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-popover-foreground">Paramètres du module</h4>
                            <p className="text-sm text-muted-foreground">
                              Configurez les paramètres spécifiques à ce module.
                            </p>
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <label className="text-sm text-popover-foreground">Notifications</label>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="text-sm text-popover-foreground">Raccourcis clavier</label>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="text-sm text-popover-foreground">Mode sombre</label>
                                <Switch />
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-20">
              <div className="neuro-flat rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Store className="h-12 w-12 text-muted-foreground opacity-30" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucun module trouvé</h3>
              <p className="text-muted-foreground">Ajustez vos filtres pour voir plus de modules.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
