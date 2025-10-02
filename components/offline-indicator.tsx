"use client"

import { useEffect, useState } from "react"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowNotification(true)
    }

    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showNotification && isOnline) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 neuro-raised rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
        isOnline ? "bg-green-500/10" : "bg-orange-500/10"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-sm font-medium text-foreground">Connexion rétablie</p>
            <p className="text-xs text-muted-foreground">Synchronisation en cours...</p>
          </div>
        </>
      ) : (
        <>
          <WifiOff className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm font-medium text-foreground">Mode hors ligne</p>
            <p className="text-xs text-muted-foreground">Vos données sont sauvegardées localement</p>
          </div>
        </>
      )}
    </div>
  )
}
