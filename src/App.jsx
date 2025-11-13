import { useEffect, useRef, useState } from 'react'
import { Mic, Volume2, Hand, Play, Square, List } from 'lucide-react'
import Hero from './components/Hero'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useSpeech() {
  const recognitionRef = useRef(null)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      setSupported(true)
      const recog = new SR()
      recog.lang = 'en-US'
      recog.interimResults = true
      recog.continuous = true

      recog.onresult = (e) => {
        let text = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript
        }
        setTranscript(text.trim())
      }

      recog.onend = () => setListening(false)
      recognitionRef.current = recog
    }
  }, [])

  const start = () => {
    if (!supported) return
    try {
      recognitionRef.current?.start()
      setListening(true)
    } catch {}
  }

  const stop = () => {
    try {
      recognitionRef.current?.stop()
    } catch {}
    setListening(false)
  }

  return { supported, listening, transcript, start, stop }
}

function ttsSpeak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1
    u.pitch = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {}
}

function App() {
  const { supported, listening, transcript, start, stop } = useSpeech()
  const [aiReply, setAiReply] = useState('')
  const [lessons, setLessons] = useState([])

  useEffect(() => {
    // Preload lessons
    fetch(`${BACKEND_URL}/api/lessons`).then(r => r.json()).then(setLessons).catch(() => {})
  }, [])

  const sendTranscript = async () => {
    if (!transcript) return
    const res = await fetch(`${BACKEND_URL}/api/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    })
    const data = await res.json()
    setAiReply(data.ai_response || '')
    ttsSpeak(data.ai_response || '')
  }

  useEffect(() => {
    // Simple voice loop: if phrase ends with a period or user says 'send', auto send
    const lower = transcript.toLowerCase()
    if (!lower) return
    if (lower.endsWith('.') || lower.includes('send') || lower.includes('okay echo')) {
      sendTranscript()
    }
  }, [transcript])

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      <Hero />

      <main className="max-w-6xl mx-auto px-6 pb-24">
        <section className="grid md:grid-cols-2 gap-8 items-start">
          <div className="p-6 rounded-2xl border bg-gradient-to-br from-purple-50 to-blue-50">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-purple-900">
              <Mic className="w-5 h-5" /> Voice Console
            </h2>
            <p className="mt-1 text-sm text-gray-600">Speak naturally — I’ll interpret and respond.</p>

            <div className="mt-4 flex items-center gap-3">
              <button onClick={start} disabled={!supported || listening} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-50">
                <Play className="w-4 h-4" /> Start
              </button>
              <button onClick={stop} disabled={!supported || !listening} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50">
                <Square className="w-4 h-4" /> Stop
              </button>
              <span className={`text-sm ${supported ? 'text-green-700' : 'text-red-700'}`}>
                {supported ? (listening ? 'Listening…' : 'Ready') : 'Speech API not supported'}
              </span>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-white border h-32 overflow-auto font-mono text-sm" aria-live="polite">
              {transcript || 'Awaiting speech…'}
            </div>

            <div className="mt-4">
              <button onClick={sendTranscript} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Send Now</button>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-white">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-blue-900">
              <Volume2 className="w-5 h-5" /> Echo Response
            </h2>
            <p className="mt-1 text-sm text-gray-600">Responses are also spoken aloud for full hands-free use.</p>
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border min-h-[6rem]" aria-live="polite">
              {aiReply || 'I will speak my responses here.'}
            </div>
          </div>
        </section>

        <section className="mt-10 p-6 rounded-2xl border bg-white">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <List className="w-5 h-5" /> Available Lessons
          </h3>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map(l => (
              <div key={l.id} className="p-4 rounded-xl border bg-gradient-to-br from-white to-purple-50">
                <div className="text-sm text-purple-700 font-medium uppercase">{l.level}</div>
                <div className="mt-1 text-lg font-semibold">{l.title}</div>
                <p className="mt-1 text-sm text-gray-600">{l.description}</p>
                <div className="mt-2 text-xs text-gray-500">{(l.topics || []).join(' • ')}</div>
              </div>
            ))}
            {lessons.length === 0 && (
              <div className="text-sm text-gray-600">No lessons loaded yet.</div>
            )}
          </div>
        </section>

        <section className="mt-10 p-6 rounded-2xl border bg-white">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Hand className="w-5 h-5" /> Gesture Preview
          </h3>
          <p className="mt-1 text-sm text-gray-600">Gesture recognition will appear here in future updates (MediaPipe / TensorFlow.js). For now, the voice-first flow is ready.</p>
        </section>
      </main>
    </div>
  )
}

export default App
