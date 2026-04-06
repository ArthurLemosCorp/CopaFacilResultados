"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { WorldMap, type Carteira, getAllCarteiras, continents } from "@/components/world-map"
import { TournamentBracket } from "@/components/tournament-bracket"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ChampionshipPage() {
  const [selectedCarteira, setSelectedCarteira] = useState<Carteira | null>(null)
  
  const allCarteiras = useMemo(() => getAllCarteiras(), [])
  const totalParticipants = useMemo(() => {
    return allCarteiras.reduce((sum, c) => {
      const participantCount = c.participants?.length ?? 0
      return sum + participantCount
    }, 0)
  }, [allCarteiras])

  return (
    <main className="min-h-screen bg-background">
      {selectedCarteira ? (
        <TournamentBracket
          selectedCarteira={selectedCarteira}
          onBack={() => setSelectedCarteira(null)}
        />
      ) : (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-card/95 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 py-6 md:py-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Image
                    src="/assets/Logo-Facil - Copia.png"
                    alt="Logo Fácil"
                    width={40}
                    height={40}
                    className="w-8 h-8 md:w-10 md:h-10 object-contain"
                  />
                  <h1 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
                    Copa X1 Cobrança
                  </h1>
                </div>
                <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto text-balance">
                  Selecione uma carteira no mapa para visualizar sua chave do campeonato
                </p>
              </div>
            </div>
          </header>

          {/* Map Section */}
          <div className="flex-1 container mx-auto px-4 py-6">
            <div className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-sm h-full">
              {/* Background logo */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
                <Image
                  src="/assets/Logo-Facil - Copia.png"
                  alt=""
                  width={480}
                  height={480}
                className="w-[512px] h-[512px] md:w-[768px] md:h-[768px] object-contain opacity-10 blur-sm"
                  aria-hidden="true"
                />
              </div>
              <div className="relative z-10 h-full">
                <WorldMap onSelectCarteira={setSelectedCarteira} />
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <footer className="bg-card/95 backdrop-blur-sm border-t border-border">
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-accent">{continents.length}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Continentes</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-accent">{allCarteiras.length}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Carteiras</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-accent">{totalParticipants}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Participantes</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Theme Toggle */}
      <ThemeToggle />
    </main>
  )
}
