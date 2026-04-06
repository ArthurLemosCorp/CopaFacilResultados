"use client"

import { type Participant } from "./world-map"

interface ParticipantCardProps {
  participant: Participant | null
  isWinner?: boolean
  score?: number
}

// Country flag emoji from country code
function getFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Country colors for background gradients
const countryGradients: Record<string, string> = {
  BR: "from-green-600/20 to-yellow-500/20",
  ES: "from-red-600/20 to-yellow-500/20",
  DE: "from-gray-800/20 to-red-600/20",
  GB: "from-blue-700/20 to-red-600/20",
  IT: "from-green-600/20 to-red-600/20",
  JP: "from-white/10 to-red-600/20",
  FR: "from-blue-600/20 to-red-600/20",
  AT: "from-red-600/20 to-white/10",
  PT: "from-green-600/20 to-red-600/20",
  AR: "from-blue-400/20 to-white/10",
  default: "from-accent/10 to-secondary/50",
}

export function ParticipantCard({ participant, isWinner, score }: ParticipantCardProps) {
  if (!participant) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 border border-dashed border-border">
        {/* Placeholder Avatar */}
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-muted-foreground text-lg">?</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground italic">A definir</p>
        </div>
      </div>
    )
  }

  const gradient = countryGradients[participant.countryCode] || countryGradients.default

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg transition-all border ${
        isWinner
          ? "bg-gradient-to-r from-accent/20 to-accent/10 border-accent shadow-sm"
          : participant.eliminated
          ? "bg-secondary/30 border-border opacity-50"
          : `bg-gradient-to-r ${gradient} border-border hover:border-accent/30`
      }`}
    >
      {/* Avatar with country background */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center overflow-hidden ${
            isWinner ? "ring-2 ring-accent" : ""
          }`}
        >
          {participant.avatar ? (
            <img
              src={participant.avatar}
              alt={participant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center text-xl md:text-2xl">
              {getFlag(participant.countryCode)}
            </div>
          )}
        </div>
        {/* Country Flag Badge removed — flag is shown in avatar */}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs md:text-sm font-medium truncate ${
          isWinner ? "text-accent" : participant.eliminated ? "text-muted-foreground line-through" : "text-foreground"
        }`}>
          {participant.name}
        </p>
        <p className="text-[10px] md:text-xs text-muted-foreground truncate">
          {participant.country}
        </p>
      </div>

      {/* Score */}
      {score !== undefined && (
        <div className={`px-2 py-1 rounded-md text-sm md:text-base font-bold ${
          isWinner ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
        }`}>
          {score}
        </div>
      )}

      {/* Winner indicator */}
      {isWinner && (
        <div className="flex-shrink-0">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
      )}
    </div>
  )
}
