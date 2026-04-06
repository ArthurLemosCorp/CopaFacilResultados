"use client"

import { useState, useMemo, useRef, type CSSProperties } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ParticipantCard } from "./participant-card"
import { type Carteira, type Participant, getAllCarteiras, continents } from "./world-map"

// Logo mapping — h-kab and i-koerich share the same asset
const carteiraLogoMap: Record<string, string> = {
  "a-ailos":    "/assets/a-ailos.png",
  "b-ambiental":"/assets/b-ambiental.png",
  "c-colombo":  "/assets/c-colombo.png",
  "d-avenida":  "/assets/d-avenida.png",
  "e-berlanda": "/assets/e-berlanda.png",
  "f-condor":   "/assets/f-condor.png",
  "g-mix":      "/assets/g-mix.png",
  "h-kab":      "/assets/h-kab_i-koerich.png",
  "i-koerich":  "/assets/h-kab_i-koerich.png",
}

function CarteiraLogo({ id, grupo, color, size = 24 }: { id: string; grupo: string; color?: string; size?: number }) {
  const src = carteiraLogoMap[id]
  if (src) {
    return (
      <Image
        src={src}
        alt={`Logo ${id}`}
        width={size}
        height={size}
        className="rounded-full object-contain"
        style={{ width: size, height: size }}
      />
    )
  }
  // fallback: colored circle with group letter
  return (
    <span
      className="rounded-full flex items-center justify-center font-bold text-white"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.45 }}
    >
      {grupo}
    </span>
  )
}

interface Match {
  id: string
  participant1: Participant | null
  participant2: Participant | null
  winner?: string
  score1?: number
  score2?: number
  scheduled?: string
}

interface Tournament {
  id: string
  group: string
  name: string
  carteiraId: string
  continentName: string
  leader: string
  participants: Participant[]
  matches: {
    round1: Match[]
    round2: Match[]
    semifinals: Match[]
    final: Match[]
  }
}

// Funcao para gerar chaves de torneio baseado no numero de participantes
const generateTournament = (carteira: Carteira): Tournament => {
  const participants = carteira.participants || []
  const totalParticipants = participants.length
  
  const round1: Match[] = []
  const round2: Match[] = []
  const semifinals: Match[] = []
  const final: Match[] = []

  // Encontrar a proxima potencia de 2 para preencher o bracket
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(totalParticipants)))
  
  if (bracketSize === 16) {
    // Torneio de 16 - Oitavas, Quartas, Semi, Final
    for (let i = 0; i < 8; i++) {
      const p1Index = i
      const p2Index = 15 - i
      round1.push({
        id: `r1-${i}`,
        participant1: participants[p1Index] || null,
        participant2: participants[p2Index] || null,
        scheduled: "15/04 - 14:00",
      })
    }
    for (let i = 0; i < 4; i++) {
      round2.push({
        id: `r2-${i}`,
        participant1: null,
        participant2: null,
        scheduled: "18/04 - 16:00",
      })
    }
  } else if (bracketSize === 8) {
    // Torneio de 8 - Quartas, Semi, Final
    for (let i = 0; i < 4; i++) {
      const p1Index = i
      const p2Index = 7 - i < totalParticipants ? 7 - i : null
      round1.push({
        id: `r1-${i}`,
        participant1: participants[p1Index] || null,
        participant2: p2Index !== null ? participants[p2Index] || null : null,
        scheduled: "15/04 - 14:00",
      })
    }
  } else if (bracketSize <= 4) {
    if (totalParticipants > 2) {
      for (let i = 0; i < Math.ceil(totalParticipants / 2); i++) {
        round1.push({
          id: `r1-${i}`,
          participant1: participants[i * 2] || null,
          participant2: participants[i * 2 + 1] || null,
          scheduled: "15/04 - 14:00",
        })
      }
    }
  }

  // Semifinais
  semifinals.push({
    id: "sf-1",
    participant1: null,
    participant2: null,
    scheduled: "22/04 - 15:00",
  })
  if (bracketSize > 2) {
    semifinals.push({
      id: "sf-2",
      participant1: null,
      participant2: null,
      scheduled: "22/04 - 17:00",
    })
  }

  // Final
  final.push({
    id: "final",
    participant1: null,
    participant2: null,
    scheduled: "25/04 - 18:00",
  })

  return {
    id: carteira.id,
    group: carteira.grupo,
    name: carteira.name,
    carteiraId: carteira.id,
    continentName: carteira.continentName,
    leader: carteira.leader,
    participants: carteira.participants || [],
    matches: { round1, round2, semifinals, final },
  }
}

interface TournamentBracketProps {
  selectedCarteira: Carteira
  onBack: () => void
}

export function TournamentBracket({ selectedCarteira, onBack }: TournamentBracketProps) {
  const allCarteiras = useMemo(() => getAllCarteiras(), [])
  
  const [currentCarteiraId, setCurrentCarteiraId] = useState(selectedCarteira.id)
  const [bracketZoom, setBracketZoom] = useState(1)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  
  const currentCarteira = useMemo(() => 
    allCarteiras.find(c => c.id === currentCarteiraId) || selectedCarteira,
    [allCarteiras, currentCarteiraId, selectedCarteira]
  )

  const continent = useMemo(() => 
    continents.find(c => c.id === currentCarteira.continentId),
    [currentCarteira]
  )
  
  const tournament = useMemo(() => generateTournament(currentCarteira), [currentCarteira])
  
  const currentIndex = allCarteiras.findIndex(c => c.id === currentCarteiraId)
  
  const goToPrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : allCarteiras.length - 1
    setCurrentCarteiraId(allCarteiras[newIndex].id)
  }

  const goToNext = () => {
    const newIndex = currentIndex < allCarteiras.length - 1 ? currentIndex + 1 : 0
    setCurrentCarteiraId(allCarteiras[newIndex].id)
  }

  const { matches } = tournament
  const hasRound1 = matches.round1.length > 0
  const hasRound2 = matches.round2.length > 0

  const totalParticipants = tournament.participants.length
  let round1Name = "Primeira Fase"
  let round2Name = "Quartas de Final"
  
  if (totalParticipants > 8) {
    round1Name = "Oitavas de Final"
    round2Name = "Quartas de Final"
  } else if (totalParticipants > 4) {
    round1Name = "Quartas de Final"
  }

  const roundSections = [
    hasRound1 ? { id: "round1", label: round1Name } : null,
    hasRound2 ? { id: "round2", label: round2Name } : null,
    { id: "semifinals", label: "Semifinais" },
    { id: "final", label: "Final" },
  ].filter((section): section is { id: string; label: string } => section !== null)

  const scrollToSection = (sectionId: string) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const adjustBracketZoom = (delta: number) => {
    setBracketZoom((currentZoom) => Math.min(1.35, Math.max(0.85, Number((currentZoom + delta).toFixed(2)))))
  }

  const bracketCanvasStyle: CSSProperties & { zoom?: number } = {
    zoom: bracketZoom,
  }

  return (
    <div className="relative flex flex-col h-full min-h-screen bg-background">
      {/* Background logo */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-0">
        <Image
          src="/assets/Logo-Facil - Copia.png"
          alt=""
          width={480}
          height={480}
          className="w-[512px] h-[512px] md:w-[768px] md:h-[768px] object-contain opacity-10 blur-sm"
          aria-hidden="true"
        />
      </div>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-3 py-3 md:px-4 md:py-4">
          <div className="grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Voltar ao Mapa</span>
            </button>

            <div className="text-center md:order-none">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <CarteiraLogo id={currentCarteira.id} grupo={tournament.group} color={continent?.color} size={24} />
                <p className="text-xs font-medium" style={{ color: continent?.color }}>{tournament.continentName}</p>
              </div>
              <h1 className="text-lg md:text-2xl font-bold text-foreground">Copa {tournament.name}</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {tournament.participants.length} participantes | Lider: {tournament.leader}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 md:justify-end">
              <button
                type="button"
                onClick={() => adjustBracketZoom(-0.1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-lg font-semibold text-foreground transition-colors hover:bg-secondary"
                aria-label="Diminuir zoom da chave"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setBracketZoom(1)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {Math.round(bracketZoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => adjustBracketZoom(0.1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-lg font-semibold text-foreground transition-colors hover:bg-secondary"
                aria-label="Aumentar zoom da chave"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-[88px] z-[9] border-b border-border bg-background/95 backdrop-blur-sm md:top-[97px]">
        <div className="container mx-auto flex gap-2 overflow-x-auto px-3 py-3 md:px-4">
          {roundSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className="whitespace-nowrap rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bracket Container */}
      <div className="relative z-10 flex-1 overflow-auto px-3 py-4 md:px-4 md:py-6">
        <div className="mx-auto min-w-[320px] md:min-w-[860px]" style={bracketCanvasStyle}>
          <div className="mb-4 rounded-2xl border border-border bg-card/70 px-4 py-3 text-xs text-muted-foreground shadow-sm md:hidden">
            Use os botões de zoom e deslize a tela para navegar pela chave em telas verticais.
          </div>

          <div className="flex flex-col-reverse items-center gap-6 md:gap-8">
            
            {/* Round 1 */}
            {hasRound1 && (
              <div
                ref={(element) => {
                  sectionRefs.current.round1 = element
                }}
                className="w-full scroll-mt-36 md:scroll-mt-40"
              >
                <h3 className="text-center text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: continent?.color }}>
                  {round1Name}
                </h3>
                <div className={`grid gap-3 md:gap-4 ${matches.round1.length > 4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8' : matches.round1.length > 2 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {matches.round1.map((match) => (
                    <MatchCard key={match.id} match={match} continentColor={continent?.color} />
                  ))}
                </div>
              </div>
            )}

            {/* Connector */}
            {hasRound1 && (
              <div className="w-full flex justify-center">
                <div className="w-px h-8" style={{ background: `linear-gradient(to top, hsl(var(--border)), ${continent?.color || 'hsl(var(--accent))'})` }} />
              </div>
            )}

            {/* Round 2 */}
            {hasRound2 && (
              <>
                <div
                  ref={(element) => {
                    sectionRefs.current.round2 = element
                  }}
                  className="w-full scroll-mt-36 md:scroll-mt-40"
                >
                  <h3 className="text-center text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: continent?.color }}>
                    {round2Name}
                  </h3>
                  <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                    {matches.round2.map((match) => (
                      <MatchCard key={match.id} match={match} continentColor={continent?.color} />
                    ))}
                  </div>
                </div>
                <div className="w-full flex justify-center">
                  <div className="w-px h-8" style={{ background: `linear-gradient(to top, hsl(var(--border)), ${continent?.color || 'hsl(var(--accent))'})` }} />
                </div>
              </>
            )}

            {/* Semifinals */}
            <div
              ref={(element) => {
                sectionRefs.current.semifinals = element
              }}
              className="w-full scroll-mt-36 md:scroll-mt-40"
            >
              <h3 className="text-center text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: continent?.color }}>
                Semifinais
              </h3>
              <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                {matches.semifinals.map((match) => (
                  <MatchCard key={match.id} match={match} continentColor={continent?.color} />
                ))}
              </div>
            </div>

            {/* Connector */}
            <div className="w-full flex justify-center">
              <div className="w-px h-8" style={{ background: continent?.color }} />
            </div>

            {/* Final */}
            <div
              ref={(element) => {
                sectionRefs.current.final = element
              }}
              className="w-full scroll-mt-36 md:scroll-mt-40"
            >
              <h3 className="text-center text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: continent?.color }}>
                Final
              </h3>
              <div className="mx-auto max-w-sm">
                {matches.final.map((match) => (
                  <MatchCard key={match.id} match={match} isFinal continentColor={continent?.color} />
                ))}
              </div>
            </div>

            {/* Trophy */}
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${continent?.color || 'hsl(var(--accent))'}, ${continent?.color?.replace(')', ', 0.6)').replace('hsl(', 'hsla(') || 'hsl(var(--accent))'})`,
                  boxShadow: `0 10px 25px -5px ${continent?.color?.replace(')', ', 0.25)').replace('hsl(', 'hsla(') || 'hsl(var(--accent))'}`
                }}
              >
                <CarteiraLogo id={currentCarteira.id} grupo={tournament.group} color={continent?.color} size={64} />
              </div>
              <span className="text-xs text-muted-foreground">Campeão</span>
            </div>
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="border-t border-border bg-card/50">
        <div className="container mx-auto px-3 py-4 md:px-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Participantes do Grupo {tournament.group}</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
            {tournament.participants.map((p) => (
              <div 
                key={p.id} 
                className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-secondary/80 px-3 py-1.5 text-sm"
              >
                <span className="text-base">{getFlagEmoji(p.countryCode)}</span>
                <span className="text-foreground font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-3 py-3 md:px-4">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <button
              onClick={goToPrev}
              className="rounded-full p-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Carteira anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="min-w-0 flex-1 flex flex-col items-center">
              <div className="flex items-center gap-2 min-w-0">
                <CarteiraLogo id={currentCarteira.id} grupo={currentCarteira.grupo} color={continent?.color} size={20} />
                <span className="truncate text-sm font-medium text-foreground">{currentCarteira.name}</span>
              </div>
              <div className="mt-2 flex max-w-full items-center gap-1.5 overflow-x-auto pb-1">
                {allCarteiras.map((c, i) => {
                  const cont = continents.find(cont => cont.id === c.continentId)
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCurrentCarteiraId(c.id)}
                      className={`h-2 w-2 shrink-0 rounded-full transition-all ${
                        i === currentIndex ? "scale-125" : "opacity-50 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: cont?.color }}
                      aria-label={`Ir para ${c.name}`}
                      title={`Grupo ${c.grupo} - ${c.name}`}
                    />
                  )
                })}
              </div>
            </div>

            <button
              onClick={goToNext}
              className="rounded-full p-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Proxima carteira"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function MatchCard({ match, isFinal = false, continentColor }: { match: Match; isFinal?: boolean; continentColor?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border-2 transition-all ${
        isFinal ? "shadow-lg" : "bg-card hover:border-opacity-70"
      }`}
      style={{
        borderColor: isFinal ? continentColor : 'hsl(var(--border))',
        background: isFinal ? `linear-gradient(135deg, hsl(var(--card)), ${continentColor?.replace(')', ', 0.1)').replace('hsl(', 'hsla(') || 'transparent'})` : undefined,
        boxShadow: isFinal ? `0 10px 25px -5px ${continentColor?.replace(')', ', 0.1)').replace('hsl(', 'hsla(') || 'transparent'}` : undefined,
      }}
    >
      <div 
        className="px-3 py-2 text-center border-b"
        style={{ 
          borderColor: isFinal ? `${continentColor?.replace(')', ', 0.3)').replace('hsl(', 'hsla(')}` : 'hsl(var(--border))',
          background: isFinal ? `${continentColor?.replace(')', ', 0.1)').replace('hsl(', 'hsla(')}` : 'hsl(var(--secondary) / 0.5)'
        }}
      >
        <span className="text-[10px] md:text-xs text-muted-foreground">{match.scheduled}</span>
      </div>

      <div className="space-y-2 p-2 md:p-3">
        <ParticipantCard
          participant={match.participant1}
          isWinner={match.winner === match.participant1?.id}
          score={match.score1}
        />
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground font-medium">VS</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <ParticipantCard
          participant={match.participant2}
          isWinner={match.winner === match.participant2?.id}
          score={match.score2}
        />
      </div>
    </div>
  )
}
