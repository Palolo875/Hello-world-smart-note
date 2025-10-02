"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react"
import type { OnboardingStep } from "@/types/note"

interface OnboardingProps {
  onComplete: () => void
  onSkip: () => void
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bienvenue dans Smart Notes",
    description:
      "Une application intelligente pour organiser vos pensées, visualiser vos connexions et booster votre productivité.",
    target: "center",
    position: "center",
  },
  {
    id: "create-note",
    title: "Créer une note",
    description: "Cliquez sur ce bouton pour créer votre première note. L'éditeur s'ouvrira automatiquement.",
    target: "[data-onboarding='create-note']",
    position: "bottom",
    highlightElement: true,
  },
  {
    id: "sidebar",
    title: "Barre latérale",
    description:
      "Toutes vos notes sont listées ici. Cliquez sur une note pour l'ouvrir. Utilisez la recherche pour trouver rapidement.",
    target: "[data-onboarding='sidebar']",
    position: "right",
    highlightElement: true,
  },
  {
    id: "modules",
    title: "Modules intelligents",
    description:
      "Accédez au tableau de bord, à la recherche sémantique, à la vue graphique et plus encore via ces boutons.",
    target: "[data-onboarding='modules']",
    position: "bottom",
    highlightElement: true,
  },
  {
    id: "dashboard",
    title: "Tableau de bord sentient",
    description:
      "L'IA analyse vos activités et vous propose des insights personnalisés, des statistiques et des suggestions.",
    target: "[data-onboarding='dashboard']",
    position: "bottom",
    highlightElement: true,
  },
  {
    id: "graph-view",
    title: "Vue graphique",
    description:
      "Visualisez les connexions entre vos notes dans un graphe interactif et explorez votre réseau d'idées.",
    target: "[data-onboarding='graph']",
    position: "bottom",
    highlightElement: true,
  },
  {
    id: "module-store",
    title: "Boutique de modules",
    description: "Activez ou désactivez des modules selon vos besoins. Personnalisez votre expérience.",
    target: "[data-onboarding='store']",
    position: "bottom",
    highlightElement: true,
  },
  {
    id: "settings",
    title: "Paramètres",
    description: "Personnalisez chaque aspect de l'application selon vos préférences.",
    target: "[data-onboarding='settings']",
    position: "bottom",
    highlightElement: true,
  },
]

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)

  const step = ONBOARDING_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

  useEffect(() => {
    if (step.highlightElement && step.target !== "center") {
      const element = document.querySelector(step.target) as HTMLElement
      if (element) {
        setHighlightedElement(element)
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    } else {
      setHighlightedElement(null)
    }
  }, [currentStep, step])

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getPopoverPosition = () => {
    if (step.position === "center" || !highlightedElement) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    }

    const rect = highlightedElement.getBoundingClientRect()
    const popoverWidth = 400
    const popoverHeight = 200
    const gap = 20

    switch (step.position) {
      case "bottom":
        return {
          top: `${rect.bottom + gap}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translateX(-50%)",
        }
      case "top":
        return {
          top: `${rect.top - popoverHeight - gap}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translateX(-50%)",
        }
      case "right":
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + gap}px`,
          transform: "translateY(-50%)",
        }
      case "left":
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - popoverWidth - gap}px`,
          transform: "translateY(-50%)",
        }
      default:
        return {}
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />

      {/* Highlight spotlight */}
      {highlightedElement && (
        <div
          className="fixed z-[101] pointer-events-none animate-in fade-in duration-300"
          style={{
            top: `${highlightedElement.getBoundingClientRect().top - 8}px`,
            left: `${highlightedElement.getBoundingClientRect().left - 8}px`,
            width: `${highlightedElement.getBoundingClientRect().width + 16}px`,
            height: `${highlightedElement.getBoundingClientRect().height + 16}px`,
            boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.6)",
            borderRadius: "24px",
            transition: "all 0.3s ease-in-out",
          }}
        />
      )}

      {/* Onboarding popover */}
      <div
        className="fixed z-[102] w-[400px] max-w-[90vw] animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={getPopoverPosition()}
      >
        <div className="neuro-raised rounded-3xl bg-card p-6 border border-border/50 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="neuro-flat rounded-full p-3">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground text-lg">{step.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Étape {currentStep + 1} sur {ONBOARDING_STEPS.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="neuro-flat hover:neuro-pressed rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{step.description}</p>

          {/* Progress dots */}
          <div className="flex gap-2 mb-6 justify-center">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? "w-8 bg-primary" : index < currentStep ? "w-2 bg-primary/50" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 neuro-flat hover:neuro-pressed rounded-full border-0 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={`neuro-raised hover:neuro-flat rounded-full bg-primary text-primary-foreground border-0 ${
                isFirstStep ? "flex-1" : "flex-1"
              }`}
            >
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Terminer
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip button */}
          {!isLastStep && (
            <button
              onClick={onSkip}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-3"
            >
              Passer le tutoriel
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export function WelcomeScreen({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-[100] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="neuro-raised rounded-[2rem] bg-card p-12 border border-border/50 shadow-2xl">
          {/* Icon */}
          <div className="neuro-flat rounded-full p-6 w-fit mx-auto mb-8">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-serif font-bold text-center mb-4 text-balance">Bienvenue dans Smart Notes</h1>

          {/* Description */}
          <p className="text-center text-muted-foreground mb-8 text-lg leading-relaxed text-pretty">
            Une application intelligente qui vous aide à organiser vos pensées, visualiser vos connexions et booster
            votre productivité grâce à l'intelligence artificielle.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              {
                icon: "📝",
                title: "Éditeur immersif",
                description: "Écrivez sans distraction avec un éditeur plein écran",
              },
              {
                icon: "🧠",
                title: "IA sentiente",
                description: "Insights intelligents basés sur vos activités",
              },
              {
                icon: "🔍",
                title: "Recherche sémantique",
                description: "Trouvez vos notes par sens, pas seulement par mots",
              },
              {
                icon: "🕸️",
                title: "Vue graphique",
                description: "Visualisez les connexions entre vos idées",
              },
            ].map((feature, index) => (
              <div key={index} className="neuro-flat rounded-2xl p-4">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onStart}
              className="flex-1 neuro-raised hover:neuro-flat rounded-full h-14 bg-primary text-primary-foreground border-0 text-base"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Commencer le tutoriel
            </Button>
            <Button
              onClick={onSkip}
              variant="outline"
              className="flex-1 neuro-flat hover:neuro-pressed rounded-full h-14 border-0 text-base bg-transparent"
            >
              Découvrir par moi-même
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
