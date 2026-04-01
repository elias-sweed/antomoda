import { useEffect, useState, useRef } from 'react'
import { obtenerProductosActivos } from '../../services/productos'
import type { Producto } from '../../services/productos'
import { generarLinkWhatsApp } from '../../utils/whatsapp'

import { ShootingStars } from '@/components/ui/shooting-stars'
import { StarsBackground } from '@/components/ui/stars-background'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { AuroraText } from '@/components/ui/aurora-text'
import { TypingAnimation } from '@/components/magicui/typing-animation'
import { ShimmerButton } from "@/components/ui/shimmer-button"

const CATEGORIAS = ['Todas', 'Polos', 'Pantalones', 'Vestidos', 'Conjuntos', 'Casacas', 'Accesorios', 'Otros']

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const datos = await obtenerProductosActivos()
        setProductos(datos)
      } catch (error) {
        console.error("Error al cargar productos:", error)
      } finally {
        // Un pequeño delay opcional para que el skeleton se aprecie si la red es ultra rápida
        setTimeout(() => setCargando(false), 800)
      }
    }
    
    fetchData()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200 
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva === 'Todas' || producto.categoria === categoriaActiva
    return coincideBusqueda && coincideCategoria
  })

  // Componente del Esqueleto de la Tarjeta
  const SkeletonCard = () => (
    <div className="h-full animate-pulse">
      <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-[22px] flex flex-col h-full">
        <div className="aspect-[4/5] w-full rounded-xl bg-neutral-800 mb-4"></div>
        <div className="h-4 bg-neutral-800 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-neutral-800 rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-neutral-800 rounded w-1/3 mb-6"></div>
        <div className="h-12 bg-neutral-800 rounded-xl w-full mt-auto"></div>
      </div>
    </div>
  )

  // Componente interno para el carrusel de imágenes de cada producto
  const ImageCarousel = ({ imagenes, nombreProducto }: { imagenes: string[] | null | undefined, nombreProducto: string }) => {
    const [indiceActual, setIndiceActual] = useState(0);
    const listaImagenes = imagenes && imagenes.length > 0 
      ? imagenes 
      : ['https://via.placeholder.com/400?text=Sin+Imagen'];
    
    const tieneMultiplesImagenes = listaImagenes.length > 1;

    const irAAnterior = (e: React.MouseEvent) => {
      e.preventDefault(); // Evitar que el click en la flecha active el link de WhatsApp
      e.stopPropagation();
      setIndiceActual((prev) => (prev === 0 ? listaImagenes.length - 1 : prev - 1));
    };

    const irASiguiente = (e: React.MouseEvent) => {
      e.preventDefault(); // Evitar que el click en la flecha active el link de WhatsApp
      e.stopPropagation();
      setIndiceActual((prev) => (prev === listaImagenes.length - 1 ? 0 : prev + 1));
    };

    return (
      <div className="aspect-[4/5] w-full rounded-xl overflow-hidden mb-4 bg-neutral-800 relative group">
        <img
          src={listaImagenes[indiceActual]}
          alt={`${nombreProducto} - Imagen ${indiceActual + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {tieneMultiplesImagenes && (
          <>
            {/* Flecha Izquierda - Sutil, blanca con sombra para visibilidad, fondo transparente */}
            <button 
              onClick={irAAnterior}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full text-white/70 hover:text-white hover:bg-black/20 transition-all drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              aria-label="Imagen anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            {/* Flecha Derecha - Sutil, blanca con sombra para visibilidad, fondo transparente */}
            <button 
              onClick={irASiguiente}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full text-white/70 hover:text-white hover:bg-black/20 transition-all drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              aria-label="Siguiente imagen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Indicadores de posición (puntos pequeños abajo) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 p-1 px-2 rounded-full bg-black/20 backdrop-blur-sm">
              {listaImagenes.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === indiceActual ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarsBackground starDensity={0.00015} allStarsTwinkle={true} />
        <ShootingStars minSpeed={10} maxSpeed={30} starColor="#9E00FF" trailColor="#2EB9DF" />
      </div>

      <div className="relative z-10 p-4 pb-10 max-w-7xl mx-auto">
        <header className="text-center my-10 md:my-16 relative">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter drop-shadow-2xl flex flex-row justify-center items-center gap-0">
            <TypingAnimation 
              className="text-white text-6xl md:text-8xl font-black tracking-tighter"
              duration={100}
            >
              Anto
            </TypingAnimation>

            <AuroraText 
              speed={2} 
              colors={["#9E00FF", "#2EB9DF", "#FF0080", "#00F0FF", "#9E00FF"]}
            >
              <TypingAnimation 
                className="text-6xl md:text-8xl font-black tracking-tighter"
                duration={100} 
                delay={400} 
              >
                Moda
              </TypingAnimation>
            </AuroraText>
          </h1>

          <TypingAnimation 
            className="text-neutral-300 mt-4 text-xl md:text-2xl font-semibold max-w-lg mx-auto drop-shadow block"
            duration={50}
            delay={1000}
            startOnView={true}
          >
            Tu estilo, al mejor precio en Tarapoto
          </TypingAnimation>
        </header>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 md:p-6 mb-12 shadow-2xl border border-white/10 relative z-20">
          <div className="mb-5">
            <input
              type="text"
              placeholder="🔍 Buscar prendas por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner bg-white/90 placeholder-gray-500 text-gray-900 transition-all"
            />
          </div>

          <div className="relative flex items-center group">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 z-30 bg-neutral-900/90 p-2.5 rounded-full shadow-lg text-white hover:bg-purple-600 transition-colors border border-white/10 -ml-2 md:ml-0"
              aria-label="Desplazar a la izquierda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-3 py-2 px-12 md:px-14 w-full scrollbar-hide scroll-smooth z-10"
            >
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex-shrink-0 ${
                    categoriaActiva === cat
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(158,0,255,0.5)] transform scale-105 border border-purple-400/50'
                      : 'bg-neutral-800/80 text-gray-300 border border-white/10 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 z-30 bg-neutral-900/90 p-2.5 rounded-full shadow-lg text-white hover:bg-purple-600 transition-colors border border-white/10 -mr-2 md:mr-0"
              aria-label="Desplazar a la derecha"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
          {cargando ? (
            // Mostramos 10 esqueletos mientras carga
            Array.from({ length: 10 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))
          ) : (
            productosFiltrados.map((producto) => (
              <div key={producto.id} className="h-full">
                <BackgroundGradient 
                  className="p-3 sm:p-4 flex flex-col h-full"
                  containerClassName="h-full"
                  animate={true}
                >
                  {/* Reemplazamos el div de imagen estática por el componente ImageCarousel */}
                  <div className="relative group">
                    <ImageCarousel 
                      imagenes={producto.imagenes} 
                      nombreProducto={producto.nombre} 
                    />
                    
                    {producto.stock > 0 && producto.stock <= 3 && (
                      <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg border border-red-400/50 z-20">
                        ¡Últimos!
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-sm md:text-base font-medium text-gray-100 line-clamp-2 flex-grow px-1 mb-2">
                    {producto.nombre}
                  </h3>
                  
                  <div className="mb-4 px-1">
                    <span className="text-xl font-extrabold text-white">
                      S/ {producto.precio.toFixed(2)}
                    </span>
                  </div>

                  <a 
                    href={generarLinkWhatsApp(producto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-auto"
                  >
                    <ShimmerButton
                      shimmerColor="#ffffff"
                      shimmerSize="0.1em"
                      shimmerDuration="2s"
                      background="#22c55e" 
                      borderRadius="0.75rem"
                      className="w-full text-sm md:text-base font-bold shadow-2xl"
                    >
                      Pedir por WhatsApp
                    </ShimmerButton>
                  </a>
                </BackgroundGradient>
              </div>
            ))
          )}
        </div>

        {!cargando && productosFiltrados.length === 0 && (
          <div className="text-center py-24 text-gray-300 bg-white/5 backdrop-blur-md rounded-3xl mt-4 border border-white/10 shadow-xl">
            <p className="text-2xl font-bold text-white">No encontramos prendas</p>
            <p className="text-base mt-2 opacity-80">Intenta buscar con otra palabra o selecciona otra categoría.</p>
          </div>
        )}
      </div>
    </div>
  )
}