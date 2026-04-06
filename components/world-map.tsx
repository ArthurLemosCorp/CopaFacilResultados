"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface MapView {
  coordinates: [number, number]
  zoom: number
}

const defaultMapView: MapView = {
  coordinates: [0, 20],
  zoom: 1,
}

const continentMapViews: Record<string, MapView> = {
  america: {
    coordinates: [-70, 15],
    zoom: 1.85,
  },
  europe: {
    coordinates: [15, 54],
    zoom: 2.4,
  },
  africa: {
    coordinates: [18, 5],
    zoom: 2.05,
  },
  asia: {
    coordinates: [95, 28],
    zoom: 1.8,
  },
}

// Mapeamento de países para continentes
const countryToContinent: Record<string, string> = {
  // América do Norte
  "United States of America": "america",
  "Canada": "america",
  "Mexico": "america",
  "Guatemala": "america",
  "Cuba": "america",
  "Haiti": "america",
  "Dominican Rep.": "america",
  "Honduras": "america",
  "Nicaragua": "america",
  "El Salvador": "america",
  "Costa Rica": "america",
  "Panama": "america",
  "Jamaica": "america",
  "Puerto Rico": "america",
  "Belize": "america",
  "Greenland": "america",
  // América do Sul
  "Brazil": "america",
  "Argentina": "america",
  "Colombia": "america",
  "Peru": "america",
  "Venezuela": "america",
  "Chile": "america",
  "Ecuador": "america",
  "Bolivia": "america",
  "Paraguay": "america",
  "Uruguay": "america",
  "Guyana": "america",
  "Suriname": "america",
  "French Guiana": "america",
  "Falkland Is.": "america",
  // Europa
  "Russia": "europe",
  "Germany": "europe",
  "United Kingdom": "europe",
  "France": "europe",
  "Italy": "europe",
  "Spain": "europe",
  "Ukraine": "europe",
  "Poland": "europe",
  "Romania": "europe",
  "Netherlands": "europe",
  "Belgium": "europe",
  "Czech Rep.": "europe",
  "Greece": "europe",
  "Portugal": "europe",
  "Sweden": "europe",
  "Hungary": "europe",
  "Austria": "europe",
  "Switzerland": "europe",
  "Bulgaria": "europe",
  "Denmark": "europe",
  "Finland": "europe",
  "Slovakia": "europe",
  "Norway": "europe",
  "Ireland": "europe",
  "Croatia": "europe",
  "Moldova": "europe",
  "Bosnia and Herz.": "europe",
  "Albania": "europe",
  "Lithuania": "europe",
  "Macedonia": "europe",
  "Slovenia": "europe",
  "Latvia": "europe",
  "Estonia": "europe",
  "Montenegro": "europe",
  "Luxembourg": "europe",
  "Malta": "europe",
  "Iceland": "europe",
  "Serbia": "europe",
  "Belarus": "europe",
  "Kosovo": "europe",
  "Cyprus": "europe",
  // África
  "Nigeria": "africa",
  "Ethiopia": "africa",
  "Egypt": "africa",
  "Dem. Rep. Congo": "africa",
  "Tanzania": "africa",
  "South Africa": "africa",
  "Kenya": "africa",
  "Uganda": "africa",
  "Algeria": "africa",
  "Sudan": "africa",
  "Morocco": "africa",
  "Angola": "africa",
  "Mozambique": "africa",
  "Ghana": "africa",
  "Madagascar": "africa",
  "Cameroon": "africa",
  "Côte d'Ivoire": "africa",
  "Niger": "africa",
  "Burkina Faso": "africa",
  "Mali": "africa",
  "Malawi": "africa",
  "Zambia": "africa",
  "Senegal": "africa",
  "Chad": "africa",
  "Somalia": "africa",
  "Zimbabwe": "africa",
  "Guinea": "africa",
  "Rwanda": "africa",
  "Benin": "africa",
  "Burundi": "africa",
  "Tunisia": "africa",
  "S. Sudan": "africa",
  "Togo": "africa",
  "Sierra Leone": "africa",
  "Libya": "africa",
  "Congo": "africa",
  "Liberia": "africa",
  "Central African Rep.": "africa",
  "Mauritania": "africa",
  "Eritrea": "africa",
  "Namibia": "africa",
  "Gambia": "africa",
  "Botswana": "africa",
  "Gabon": "africa",
  "Lesotho": "africa",
  "Guinea-Bissau": "africa",
  "Eq. Guinea": "africa",
  "Mauritius": "africa",
  "eSwatini": "africa",
  "Djibouti": "africa",
  "Comoros": "africa",
  "W. Sahara": "africa",
  // Ásia
  "China": "asia",
  "India": "asia",
  "Indonesia": "asia",
  "Pakistan": "asia",
  "Bangladesh": "asia",
  "Japan": "asia",
  "Philippines": "asia",
  "Vietnam": "asia",
  "Turkey": "asia",
  "Iran": "asia",
  "Thailand": "asia",
  "Myanmar": "asia",
  "South Korea": "asia",
  "Iraq": "asia",
  "Afghanistan": "asia",
  "Saudi Arabia": "asia",
  "Uzbekistan": "asia",
  "Malaysia": "asia",
  "Yemen": "asia",
  "Nepal": "asia",
  "North Korea": "asia",
  "Sri Lanka": "asia",
  "Kazakhstan": "asia",
  "Syria": "asia",
  "Cambodia": "asia",
  "Jordan": "asia",
  "Azerbaijan": "asia",
  "United Arab Emirates": "asia",
  "Tajikistan": "asia",
  "Israel": "asia",
  "Laos": "asia",
  "Lebanon": "asia",
  "Kyrgyzstan": "asia",
  "Turkmenistan": "asia",
  "Singapore": "asia",
  "Oman": "asia",
  "Palestine": "asia",
  "Kuwait": "asia",
  "Georgia": "asia",
  "Mongolia": "asia",
  "Armenia": "asia",
  "Qatar": "asia",
  "Bahrain": "asia",
  "Timor-Leste": "asia",
  "Bhutan": "asia",
  "Brunei": "asia",
  "Taiwan": "asia",
  // Oceania
  "Australia": "oceania",
  "Papua New Guinea": "oceania",
  "New Zealand": "oceania",
  "Fiji": "oceania",
  "Solomon Is.": "oceania",
  "Vanuatu": "oceania",
  "New Caledonia": "oceania",
  "Samoa": "oceania",
}

export interface Participant {
  id: string
  name: string
  country: string
  countryCode: string
  avatar?: string
  eliminated?: boolean
  winner?: boolean
}

export interface Carteira {
  id: string
  grupo: string
  name: string
  continentId: string
  continentName: string
  leader: string
  coordinates: [number, number]
  participants: Participant[]
}

export interface Continent {
  id: string
  name: string
  leader: string
  carteiras: Carteira[]
  color: string
}

// Dados reais das carteiras conforme tabela fornecida
export const continents: Continent[] = [
  {
    id: "europe",
    name: "Europa",
    leader: "Roselene",
    color: "hsl(220, 70%, 50%)",
    carteiras: [
      {
        id: "a-ailos",
        grupo: "A",
        name: "Ailos",
        continentId: "europe",
        continentName: "Europa",
        leader: "Roselene",
        coordinates: [10, 50],
        participants: [
          { id: "a1", name: "Agatha", country: "Brasil", countryCode: "BR" },
          { id: "a2", name: "Elaine", country: "França", countryCode: "FR" },
          { id: "a3", name: "Franciele", country: "Argentina", countryCode: "AR" },
          { id: "a4", name: "Giovana", country: "Alemanha", countryCode: "DE" },
          { id: "a5", name: "Henrique", country: "Japão", countryCode: "JP" },
          { id: "a6", name: "Renata", country: "México", countryCode: "MX" },
        ],
      },
    ],
  },
  {
    id: "america",
    name: "América do Sul",
    leader: "Thais",
    color: "hsl(140, 60%, 45%)",
    carteiras: [
      {
        id: "b-ambiental",
        grupo: "B",
        name: "Ambiental",
        continentId: "america",
        continentName: "América",
        leader: "Thais",
        coordinates: [-55, -10],
        participants: [
          { id: "b1", name: "Amanda", country: "Brasil", countryCode: "BR" },
          { id: "b2", name: "Daci", country: "Inglaterra", countryCode: "GB" },
          { id: "b3", name: "Estefani", country: "Espanha", countryCode: "ES" },
          { id: "b4", name: "Gustavo", country: "Portugal", countryCode: "PT" },
          { id: "b5", name: "Heloisa A.", country: "Coreia do Sul", countryCode: "KR" },
          { id: "b6", name: "Heloisa V.", country: "Marrocos", countryCode: "MA" },
          { id: "b7", name: "Jefinifer", country: "Estados Unidos", countryCode: "US" },
          { id: "b8", name: "Karol", country: "Senegal", countryCode: "SN" },
          { id: "b9", name: "Lincoln", country: "Países Baixos", countryCode: "NL" },
          { id: "b10", name: "Nazaré", country: "Argentina", countryCode: "AR" },
          { id: "b11", name: "Wanessa", country: "Austrália", countryCode: "AU" },
        ],
      },
      {
        id: "f-condor",
        grupo: "F",
        name: "Condor",
        continentId: "america",
        continentName: "América",
        leader: "Thais",
        coordinates: [-65, -25],
        participants: [
          { id: "f1", name: "Bruna", country: "Brasil", countryCode: "BR" },
          { id: "f2", name: "Emily", country: "Argentina", countryCode: "AR" },
          { id: "f3", name: "Iasmim", country: "Espanha", countryCode: "ES" },
          { id: "f4", name: "Larissa", country: "França", countryCode: "FR" },
          { id: "f5", name: "Patricia", country: "Portugal", countryCode: "PT" },
          { id: "f6", name: "Thaina", country: "Coreia do Sul", countryCode: "KR" },
        ],
      },
      {
        id: "h-kab",
        grupo: "H",
        name: "KAB",
        continentId: "america",
        continentName: "América",
        leader: "Thais",
        coordinates: [-45, -5],
        participants: [
          { id: "h1", name: "Emanoela", country: "Brasil", countryCode: "BR" },
          { id: "h2", name: "Hariadny", country: "Argentina", countryCode: "AR" },
          { id: "h3", name: "Joao", country: "Espanha", countryCode: "ES" },
          { id: "h4", name: "Kemilly", country: "Alemanha", countryCode: "DE" },
          { id: "h5", name: "Roxane", country: "França", countryCode: "FR" },
          { id: "h6", name: "Samara", country: "Estados Unidos", countryCode: "US" },
          { id: "h7", name: "Vanessa", country: "Portugal", countryCode: "PT" },
          { id: "h8", name: "Vitor", country: "Japão", countryCode: "JP" },
        ],
      },
      {
        id: "i-koerich",
        grupo: "I",
        name: "Koerich",
        continentId: "america",
        continentName: "América",
        leader: "Thais",
        coordinates: [-70, -15],
        participants: [
          { id: "i1", name: "Amanda", country: "Brasil", countryCode: "BR" },
          { id: "i2", name: "Bruna", country: "Argentina", countryCode: "AR" },
          { id: "i3", name: "Clara", country: "Espanha", countryCode: "ES" },
          { id: "i4", name: "Franciele", country: "Portugal", countryCode: "PT" },
          { id: "i5", name: "Frederico", country: "Inglaterra", countryCode: "GB" },
          { id: "i6", name: "Gabriela", country: "Alemanha", countryCode: "DE" },
          { id: "i7", name: "Geovana", country: "Estados Unidos", countryCode: "US" },
          { id: "i8", name: "Jhennyfer", country: "México", countryCode: "MX" },
          { id: "i9", name: "Joao", country: "Catar", countryCode: "QA" },
          { id: "i10", name: "Maria", country: "Japão", countryCode: "JP" },
          { id: "i11", name: "Marisabel", country: "Senegal", countryCode: "SN" },
          { id: "i12", name: "Paola", country: "Austrália", countryCode: "AU" },
          { id: "i13", name: "Paulo", country: "Coreia do Sul", countryCode: "KR" },
          { id: "i14", name: "Sophya", country: "Países Baixos", countryCode: "NL" },
        ],
      },
    ],
  },
  {
    id: "asia",
    name: "Ásia",
    leader: "Andrea",
    color: "hsl(350, 70%, 55%)",
    carteiras: [
      {
        id: "c-colombo",
        grupo: "C",
        name: "Colombo",
        continentId: "asia",
        continentName: "Ásia",
        leader: "Andrea",
        coordinates: [80, 25],
        participants: [
          { id: "c1", name: "Ana Clara", country: "Brasil", countryCode: "BR" },
          { id: "c2", name: "Ana Sofia", country: "Argentina", countryCode: "AR" },
          { id: "c3", name: "Felipe", country: "Espanha", countryCode: "ES" },
          { id: "c4", name: "Fernanda", country: "Alemanha", countryCode: "DE" },
          { id: "c5", name: "Julia", country: "Japão", countryCode: "JP" },
          { id: "c6", name: "Matheus", country: "Inglaterra", countryCode: "GB" },
          { id: "c7", name: "Quele", country: "Portugal", countryCode: "PT" },
          { id: "c8", name: "Rosana", country: "México", countryCode: "MX" },
          { id: "c9", name: "Valdirene", country: "Marrocos", countryCode: "MA" },
        ],
      },
      {
        id: "d-avenida",
        grupo: "D",
        name: "Avenida",
        continentId: "asia",
        continentName: "Ásia",
        leader: "Andrea",
        coordinates: [105, 35],
        participants: [
          { id: "d1", name: "Carmem", country: "Brasil", countryCode: "BR" },
          { id: "d2", name: "Gabriele", country: "Argentina", countryCode: "AR" },
          { id: "d3", name: "Guilherme", country: "França", countryCode: "FR" },
          { id: "d4", name: "Jamily", country: "Espanha", countryCode: "ES" },
          { id: "d5", name: "Karini", country: "Alemanha", countryCode: "DE" },
          { id: "d6", name: "Soeli", country: "Estados Unidos", countryCode: "US" },
          { id: "d7", name: "Tamara", country: "Japão", countryCode: "JP" },
        ],
      },
      {
        id: "e-berlanda",
        grupo: "E",
        name: "Berlanda",
        continentId: "asia",
        continentName: "Ásia",
        leader: "Andrea",
        coordinates: [125, 15],
        participants: [
          { id: "e1", name: "Bruna", country: "Brasil", countryCode: "BR" },
          { id: "e2", name: "Emily", country: "Argentina", countryCode: "AR" },
          { id: "e3", name: "Iasmim", country: "Espanha", countryCode: "ES" },
          { id: "e4", name: "Larissa", country: "França", countryCode: "FR" },
          { id: "e5", name: "Patricia", country: "Portugal", countryCode: "PT" },
          { id: "e6", name: "Thaina", country: "Coreia do Sul", countryCode: "KR" },
        ],
      },
      {
        id: "g-mix",
        grupo: "G",
        name: "MIX",
        continentId: "asia",
        continentName: "Ásia",
        leader: "Andrea",
        coordinates: [140, 38],
        participants: [
          { id: "g1", name: "Gabriela", country: "Brasil", countryCode: "BR" },
          { id: "g2", name: "Gabrielli", country: "Argentina", countryCode: "AR" },
          { id: "g3", name: "Geisa", country: "Espanha", countryCode: "ES" },
          { id: "g4", name: "Larissa", country: "França", countryCode: "FR" },
          { id: "g5", name: "Miqueli", country: "Portugal", countryCode: "PT" },
          { id: "g6", name: "Roseli", country: "Estados Unidos", countryCode: "US" },
          { id: "g7", name: "Thalyta", country: "Japão", countryCode: "JP" },
        ],
      },
    ],
  },
  {
    id: "africa",
    name: "África",
    leader: "Cleide",
    color: "hsl(45, 90%, 50%)",
    carteiras: [
      {
        id: "j-digital1",
        grupo: "J",
        name: "Digital 1",
        continentId: "africa",
        continentName: "África",
        leader: "Cleide",
        coordinates: [10, 15],
        participants: [
          { id: "j1", name: "Aliany", country: "Brasil", countryCode: "BR" },
          { id: "j2", name: "Ana B.", country: "Argentina", countryCode: "AR" },
          { id: "j3", name: "Ana L.", country: "Espanha", countryCode: "ES" },
          { id: "j4", name: "Andrea", country: "França", countryCode: "FR" },
          { id: "j5", name: "Crislaine", country: "Portugal", countryCode: "PT" },
          { id: "j6", name: "Daniel", country: "Inglaterra", countryCode: "GB" },
          { id: "j7", name: "Deborah", country: "Alemanha", countryCode: "DE" },
          { id: "j8", name: "Deivison", country: "Estados Unidos", countryCode: "US" },
          { id: "j9", name: "Elen", country: "México", countryCode: "MX" },
          { id: "j10", name: "Erick", country: "Japão", countryCode: "JP" },
          { id: "j11", name: "Gabriel", country: "Bélgica", countryCode: "BE" },
          { id: "j12", name: "Giovana", country: "Senegal", countryCode: "SN" },
          { id: "j13", name: "Graciele", country: "Austrália", countryCode: "AU" },
          { id: "j14", name: "Jeane", country: "Coreia do Sul", countryCode: "KR" },
        ],
      },
      {
        id: "k-digital2",
        grupo: "K",
        name: "Digital 2",
        continentId: "africa",
        continentName: "África",
        leader: "Cleide",
        coordinates: [28, -12],
        participants: [
          { id: "k1", name: "Jhonatan", country: "Brasil", countryCode: "BR" },
          { id: "k2", name: "Jose", country: "Espanha", countryCode: "ES" },
          { id: "k3", name: "Julia V.", country: "França", countryCode: "FR" },
          { id: "k4", name: "Julia F.", country: "Alemanha", countryCode: "DE" },
          { id: "k5", name: "Kamyla", country: "Estados Unidos", countryCode: "US" },
          { id: "k6", name: "Luiza", country: "Argentina", countryCode: "AR" },
          { id: "k7", name: "Milena", country: "Portugal", countryCode: "PT" },
          { id: "k8", name: "Natalya", country: "Inglaterra", countryCode: "GB" },
          { id: "k9", name: "Nicoli", country: "México", countryCode: "MX" },
          { id: "k10", name: "Nycolas", country: "Japão", countryCode: "JP" },
          { id: "k11", name: "Otavio", country: "Marrocos", countryCode: "MA" },
          { id: "k12", name: "Ruan", country: "África do Sul", countryCode: "ZA" },
          { id: "k13", name: "Yasmeen", country: "Austrália", countryCode: "AU" },
        ],
      },
    ],
  },
]

// Função auxiliar para obter todas as carteiras
export function getAllCarteiras(): Carteira[] {
  return continents.flatMap(c => c.carteiras)
}

// Logo mapping for map markers
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

interface WorldMapProps {
  onSelectCarteira: (carteira: Carteira) => void
}

export function WorldMap({ onSelectCarteira }: WorldMapProps) {
  const [hoveredContinent, setHoveredContinent] = useState<string | null>(null)
  const [hoveredCarteira, setHoveredCarteira] = useState<string | null>(null)
  const [tooltipContent, setTooltipContent] = useState<{ text: string; x: number; y: number } | null>(null)
  const [mapView, setMapView] = useState<MapView>(defaultMapView)
  const totalCarteiras = useMemo(() => getAllCarteiras().length, [])

  const focusContinent = (continentId: string) => {
    const nextView = continentMapViews[continentId]

    if (!nextView) {
      return
    }

    setHoveredContinent(continentId)
    setMapView(nextView)
  }

  const adjustZoom = (delta: number) => {
    setMapView((currentView) => ({
      ...currentView,
      zoom: Math.min(4, Math.max(0.85, Number((currentView.zoom + delta).toFixed(2)))),
    }))
  }

  const resetMapView = () => {
    setHoveredContinent(null)
    setMapView(defaultMapView)
  }

  const getContinentColor = (countryName: string) => {
    const continentId = countryToContinent[countryName]
    if (!continentId) return { fill: "hsl(var(--muted))", stroke: "hsl(var(--border))" }
    
    const isHovered = hoveredContinent === continentId
    const continent = continents.find(c => c.id === continentId)
    
    return {
      fill: isHovered ? continent?.color.replace(")", ", 0.9)").replace("hsl(", "hsla(") : continent?.color.replace(")", ", 0.6)").replace("hsl(", "hsla(") || "hsl(var(--muted))",
      stroke: isHovered ? continent?.color : "hsl(var(--border))",
    }
  }

  return (
    <div className="relative w-full h-full min-h-[72svh] md:min-h-[600px] overflow-hidden bg-secondary/50">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-xl border border-border bg-card/95 p-1.5 shadow-sm backdrop-blur-sm md:left-4 md:top-4">
        <button
          type="button"
          onClick={() => adjustZoom(-0.25)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-semibold text-foreground transition-colors hover:bg-secondary"
          aria-label="Diminuir zoom do mapa"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetMapView}
          className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Centralizar
        </button>
        <button
          type="button"
          onClick={() => adjustZoom(0.25)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-semibold text-foreground transition-colors hover:bg-secondary"
          aria-label="Aumentar zoom do mapa"
        >
          +
        </button>
      </div>

      <div className="absolute right-3 top-3 z-10 rounded-xl border border-border bg-card/95 px-3 py-2 text-right shadow-sm backdrop-blur-sm md:right-4 md:top-4">
        <p className="text-lg font-bold text-accent">{totalCarteiras}</p>
        <p className="text-[11px] text-muted-foreground md:text-xs">Carteiras</p>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 30],
        }}
        className="w-full h-full"
      >
        <ZoomableGroup
          center={mapView.coordinates}
          zoom={mapView.zoom}
          minZoom={0.85}
          maxZoom={4}
          onMoveEnd={(position: MapView) => {
            setMapView({
              coordinates: position.coordinates as [number, number],
              zoom: position.zoom,
            })
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name
                const continentId = countryToContinent[countryName]
                const colors = getContinentColor(countryName)
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", cursor: continentId ? "pointer" : "default" },
                      pressed: { outline: "none" },
                    }}
                    onClick={() => {
                      if (continentId) {
                        focusContinent(continentId)
                      }
                    }}
                    onMouseEnter={() => {
                      if (continentId) {
                        setHoveredContinent(continentId)
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredContinent(null)
                    }}
                  />
                )
              })
            }
          </Geographies>

          {/* Carteiras (Markers) */}
          {continents.map((continent) =>
            continent.carteiras.map((carteira) => {
              const isHovered = hoveredCarteira === carteira.id
              
              return (
                <Marker
                  key={carteira.id}
                  coordinates={carteira.coordinates}
                  onMouseEnter={(e) => {
                    setHoveredCarteira(carteira.id)
                    setHoveredContinent(continent.id)
                    const rect = (e.target as SVGElement).getBoundingClientRect()
                    setTooltipContent({
                      text: `Grupo ${carteira.grupo} - ${carteira.name}`,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    })
                  }}
                  onMouseLeave={() => {
                    setHoveredCarteira(null)
                    setHoveredContinent(null)
                    setTooltipContent(null)
                  }}
                  onClick={() => onSelectCarteira(carteira)}
                  style={{ cursor: "pointer" }}
                >
                  <circle r={18} fill="transparent" />
                  {/* Pulse effect */}
                  <circle
                    r={isHovered ? 16 : 12}
                    fill={continent.color.replace(")", ", 0.3)").replace("hsl(", "hsla(")}
                    className={isHovered ? "animate-ping" : ""}
                  />
                  {/* Main marker */}
                  <circle
                    r={12}
                    fill={continent.color}
                    stroke="white"
                    strokeWidth={2}
                    className="transition-all duration-200"
                    style={{
                      filter: isHovered ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))" : "none",
                    }}
                  />
                  {/* Logo or group letter */}
                  {carteiraLogoMap[carteira.id] ? (
                    <image
                      href={carteiraLogoMap[carteira.id]}
                      x={-10}
                      y={-10}
                      width={20}
                      height={20}
                      clipPath="circle(10px at 10px 10px)"
                      style={{ pointerEvents: "none" }}
                    />
                  ) : (
                    <text
                      textAnchor="middle"
                      y={4}
                      style={{
                        fontFamily: "system-ui",
                        fontSize: "11px",
                        fontWeight: "bold",
                        fill: "white",
                      }}
                    >
                      {carteira.grupo}
                    </text>
                  )}
                </Marker>
              )
            })
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="fixed z-50 hidden -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card px-3 py-2 shadow-lg pointer-events-none md:block"
          style={{
            left: tooltipContent.x,
            top: tooltipContent.y - 10,
          }}
        >
          <p className="text-sm font-medium text-foreground whitespace-nowrap">{tooltipContent.text}</p>
          <p className="text-xs text-muted-foreground">Clique para ver a chave</p>
        </div>
      )}

      <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur-sm md:bottom-4 md:left-4 md:right-auto md:max-w-sm md:p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Mapa interativo</p>
            <p className="text-[11px] text-muted-foreground md:text-xs">
              Arraste, use o zoom e toque em um continente ou grupo
            </p>
          </div>
          <div className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground md:text-xs">
            {Math.round(mapView.zoom * 100)}%
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
          {continents.map((continent) => (
            <button
              key={continent.id}
              type="button"
              onClick={() => focusContinent(continent.id)}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                hoveredContinent === continent.id
                  ? "border-transparent bg-secondary"
                  : "border-border bg-background/60 hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: continent.color }}
                />
                <span className="text-muted-foreground">{continent.name}</span>
              </div>
              <span className="font-medium text-foreground">{continent.leader}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[11px] text-muted-foreground md:text-xs">
            <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-accent-foreground">A</span>
            = Carteira (Torneio)
          </p>
        </div>
      </div>
    </div>
  )
}
