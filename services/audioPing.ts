export function playIncomingSound() {
  if (typeof window === "undefined") {
    return
  }
  try {
    const ctx = new AudioContext()
    if (ctx.state === "suspended") {
      void ctx.resume()
    }
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = "sine"
    o.frequency.value = 880
    g.gain.value = 0.08
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.12)
  } catch {
    const a = new Audio("/sounds/incoming.mp3")
    void a.play().catch(() => {})
  }
}
