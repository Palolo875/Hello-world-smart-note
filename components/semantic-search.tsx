"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  X,
  Filter,
  Calendar,
  Tag,
  SortAsc,
  SortDesc,
  Clock,
  Bookmark,
  Menu,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Note } from "@/types/note"
import { formatDistanceToNow, format } from "date-fns"
import { fr } from "date-fns/locale"

interface SemanticSearchProps {
  notes: Note[]
  onNoteSelect: (id: string) => void
  onClose: () => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

type SortOption = "relevance" | "date-desc" | "date-asc" | "title-asc" | "title-desc"
type DateFilter = "all" | "today" | "week" | "month" | "year"

interface SearchHistory {
  query: string
  timestamp: string
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: {
    category: string
    dateFilter: DateFilter
  }
}

export function SemanticSearch({
  notes,
  onNoteSelect,
  onClose,
  isSidebarCollapsed,
  onToggleSidebar,
}: SemanticSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("relevance")
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Load search history and saved searches from localStorage
  useEffect(() => {
    const history = localStorage.getItem("searchHistory")
    if (history) setSearchHistory(JSON.parse(history))

    const saved = localStorage.getItem("savedSearches")
    if (saved) setSavedSearches(JSON.parse(saved))
  }, [])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(notes.map((note) => note.category))
    return ["all", ...Array.from(cats)]
  }, [notes])

  // Add to search history
  const addToHistory = (query: string) => {
    if (!query.trim()) return
    const newHistory = [
      { query, timestamp: new Date().toISOString() },
      ...searchHistory.filter((h) => h.query !== query),
    ].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem("searchHistory", JSON.stringify(newHistory))
  }

  // Save current search
  const saveCurrentSearch = () => {
    if (!searchQuery.trim()) return
    const newSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name: searchQuery,
      query: searchQuery,
      filters: { category: selectedCategory, dateFilter },
    }
    const updated = [...savedSearches, newSearch]
    setSavedSearches(updated)
    localStorage.setItem("savedSearches", JSON.stringify(updated))
  }

  // Load saved search
  const loadSavedSearch = (search: SavedSearch) => {
    setSearchQuery(search.query)
    setSelectedCategory(search.filters.category)
    setDateFilter(search.filters.dateFilter)
  }

  // Delete saved search
  const deleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter((s) => s.id !== id)
    setSavedSearches(updated)
    localStorage.setItem("savedSearches", JSON.stringify(updated))
  }

  // Filter notes by date
  const filterByDate = (note: Note): boolean => {
    if (dateFilter === "all") return true
    const noteDate = new Date(note.updatedAt)
    const now = new Date()
    const diffTime = now.getTime() - noteDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    switch (dateFilter) {
      case "today":
        return diffDays < 1
      case "week":
        return diffDays < 7
      case "month":
        return diffDays < 30
      case "year":
        return diffDays < 365
      default:
        return true
    }
  }

  // Semantic search with scoring
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return notes

    const query = searchQuery.toLowerCase()
    const queryWords = query.split(/\s+/)

    const scored = notes
      .map((note) => {
        let score = 0
        const title = note.title.toLowerCase()
        const content = note.content.toLowerCase()

        // Exact match in title (highest score)
        if (title.includes(query)) score += 100

        // Exact match in content
        if (content.includes(query)) score += 50

        // Word matches in title
        queryWords.forEach((word) => {
          if (title.includes(word)) score += 30
          if (content.includes(word)) score += 10
        })

        // Category match
        if (note.category.toLowerCase().includes(query)) score += 20

        return { note, score }
      })
      .filter(({ score }) => score > 0)

    return scored.map(({ note }) => note)
  }, [searchQuery, notes])

  // Apply all filters and sorting
  const filteredAndSortedResults = useMemo(() => {
    let results = searchResults

    // Apply category filter
    if (selectedCategory !== "all") {
      results = results.filter((note) => note.category === selectedCategory)
    }

    // Apply date filter
    results = results.filter(filterByDate)

    // Apply sorting
    switch (sortBy) {
      case "date-desc":
        results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      case "date-asc":
        results.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
        break
      case "title-asc":
        results.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        results.sort((a, b) => b.title.localeCompare(a.title))
        break
      // relevance is default order from semantic search
    }

    return results
  }, [searchResults, selectedCategory, dateFilter, sortBy])

  // Get search suggestions based on history
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return searchHistory.slice(0, 5)
    return searchHistory.filter((h) => h.query.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
  }, [searchQuery, searchHistory])

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    const parts = text.split(new RegExp(`(${query})`, "gi"))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-primary/20 text-foreground rounded px-1">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const handleSearch = () => {
    addToHistory(searchQuery)
    setShowSuggestions(false)
  }

  return (
    <main className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 md:p-6">
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
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl md:text-2xl font-serif font-semibold">Recherche Sémantique</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="neuro-flat hover:neuro-raised rounded-full h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-6 pb-6">
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Rechercher dans vos notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-14 pr-14 h-14 text-base neuro-inset bg-background border-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchQuery("")
                  setShowSuggestions(false)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 neuro-flat hover:neuro-pressed"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full neuro-raised rounded-3xl bg-popover p-2 z-20">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(item.query)
                      setShowSuggestions(false)
                      addToHistory(item.query)
                    }}
                    className="w-full text-left px-4 py-3 rounded-2xl hover:bg-accent transition-colors flex items-center gap-3"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.query}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-4 max-w-3xl mx-auto">
            {/* Category Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="neuro-flat hover:neuro-raised rounded-full border-0 bg-card h-9"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {selectedCategory === "all" ? "Catégorie" : selectedCategory}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 neuro-raised rounded-3xl bg-popover border-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-2 rounded-2xl transition-colors text-sm ${
                      selectedCategory === cat ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                  >
                    {cat === "all" ? "Toutes" : cat}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="neuro-flat hover:neuro-raised rounded-full border-0 bg-card h-9"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateFilter === "all"
                    ? "Date"
                    : dateFilter === "today"
                      ? "Aujourd'hui"
                      : dateFilter === "week"
                        ? "Cette semaine"
                        : dateFilter === "month"
                          ? "Ce mois"
                          : "Cette année"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 neuro-raised rounded-3xl bg-popover border-0">
                {(["all", "today", "week", "month", "year"] as DateFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`w-full text-left px-4 py-2 rounded-2xl transition-colors text-sm ${
                      dateFilter === filter ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                  >
                    {filter === "all"
                      ? "Toutes"
                      : filter === "today"
                        ? "Aujourd'hui"
                        : filter === "week"
                          ? "Cette semaine"
                          : filter === "month"
                            ? "Ce mois"
                            : "Cette année"}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Sort Options */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="neuro-flat hover:neuro-raised rounded-full border-0 bg-card h-9"
                >
                  {sortBy === "relevance" ? (
                    <Filter className="h-4 w-4 mr-2" />
                  ) : sortBy.includes("desc") ? (
                    <SortDesc className="h-4 w-4 mr-2" />
                  ) : (
                    <SortAsc className="h-4 w-4 mr-2" />
                  )}
                  Trier
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 neuro-raised rounded-3xl bg-popover border-0">
                {[
                  { value: "relevance", label: "Pertinence" },
                  { value: "date-desc", label: "Plus récent" },
                  { value: "date-asc", label: "Plus ancien" },
                  { value: "title-asc", label: "Titre (A-Z)" },
                  { value: "title-desc", label: "Titre (Z-A)" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as SortOption)}
                    className={`w-full text-left px-4 py-2 rounded-2xl transition-colors text-sm ${
                      sortBy === option.value ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Save Search */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="neuro-flat hover:neuro-raised rounded-full border-0 bg-card h-9"
                  disabled={!searchQuery.trim()}
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 neuro-raised rounded-3xl bg-popover border-0">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Sauvegarder cette recherche ?</p>
                  <Button
                    onClick={saveCurrentSearch}
                    className="w-full rounded-full neuro-raised bg-primary text-primary-foreground border-0"
                  >
                    Confirmer
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="neuro-flat hover:neuro-raised rounded-full border-0 bg-card h-9"
                  >
                    <Bookmark className="h-4 w-4 mr-2 fill-current" />
                    Recherches ({savedSearches.length})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2 neuro-raised rounded-3xl bg-popover border-0 max-h-80 overflow-y-auto">
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between px-4 py-2 rounded-2xl hover:bg-accent transition-colors group"
                    >
                      <button onClick={() => loadSavedSearch(search)} className="flex-1 text-left text-sm truncate">
                        {search.name}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSavedSearch(search.id)}
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Results count */}
          <div className="mb-6 text-sm text-muted-foreground">
            {filteredAndSortedResults.length} résultat{filteredAndSortedResults.length !== 1 ? "s" : ""} trouvé
            {filteredAndSortedResults.length !== 1 ? "s" : ""}
          </div>

          {/* Results grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAndSortedResults.map((note) => (
              <div
                key={note.id}
                onClick={() => onNoteSelect(note.id)}
                className="neuro-flat hover:neuro-raised rounded-3xl p-6 cursor-pointer transition-all duration-200 bg-card group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {highlightText(note.title || "Sans titre", searchQuery)}
                  </h3>
                  <span className="text-xs px-3 py-1 rounded-full neuro-inset bg-accent text-accent-foreground shrink-0">
                    {note.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {highlightText(note.content.substring(0, 150) || "Note vide", searchQuery)}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(note.createdAt), "d MMM yyyy", { locale: fr })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredAndSortedResults.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-lg font-medium text-foreground mb-2">Aucun résultat trouvé</p>
              <p className="text-sm text-muted-foreground">
                Essayez de modifier vos critères de recherche ou vos filtres
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
