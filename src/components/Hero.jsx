import Spline from '@splinetool/react-spline'

function Hero() {
  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-white/80" />
        <div className="relative">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500">
            EchoLearn
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-700">
            Hands-free learning with voice and gestures. Your AI tutor that listens, sees, and responds.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Hero
