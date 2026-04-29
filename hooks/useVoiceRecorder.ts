"use client"

import { useCallback, useRef, useState } from "react"

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const chunksRef = useRef<Blob[]>([])
  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    chunksRef.current = []
    const rec = new MediaRecorder(stream)
    mediaRef.current = rec
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }
    rec.start(200)
    setIsRecording(true)
  }, [])

  const stop = useCallback(async (): Promise<Blob | null> => {
    const rec = mediaRef.current
    const stream = streamRef.current
    if (!rec || rec.state === "inactive") {
      stream?.getTracks().forEach((t) => t.stop())
      setIsRecording(false)
      return null
    }

    return await new Promise<Blob | null>((resolve) => {
      rec.onstop = () => {
        stream?.getTracks().forEach((t) => t.stop())
        mediaRef.current = null
        streamRef.current = null
        setIsRecording(false)
        const blob =
          chunksRef.current.length > 0 ? new Blob(chunksRef.current, { type: "audio/webm" }) : null
        resolve(blob)
      }
      rec.stop()
    })
  }, [])

  return { isRecording, start, stop }
}
