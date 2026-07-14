// hooks/useVoiceAssistant.ts
// Hook central del asistente clínico de voz
// Integra Web Speech API (reconocimiento) + Synthesis (respuestas)

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { findCommand } from '@/lib/voice/commandRegistry';
import type { VoiceCommandContext } from '@/lib/voice/commandRegistry';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

export interface UseVoiceAssistantReturn {
  isListening: boolean;
  isProcessing: boolean;
  isSilentMode: boolean;
  lastTranscript: string;
  lastCommand: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  toggleSilentMode: () => void;
  speak: (texto: string) => void;
}

// ── HOOK ──────────────────────────────────────────────────────────────────────

export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Verificar soporte del navegador
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // ── Función speak ─────────────────────────────────────────────────────────

  const speak = useCallback(
    (texto: string) => {
      if (isSilentMode || !isSupported) return;

      const synth = window.speechSynthesis;
      synth.cancel(); // Cancelar habla anterior

      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-PE';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      synth.speak(utterance);
    },
    [isSilentMode, isSupported]
  );

  // ── Procesar transcripción ────────────────────────────────────────────────

  const processTranscript = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) return;

      setLastTranscript(transcript);
      setIsProcessing(true);

      const result = findCommand(transcript);

      if (result) {
        setLastCommand(result.command.descripcion);

        const ctx: VoiceCommandContext = {
          router,
          tenantId: '', // Se puede pasar desde el contexto si se necesita
          speak,
        };

        try {
          await result.command.action(result.match, ctx);
        } catch (err) {
          console.error('[VoiceAssistant] Error ejecutando comando:', err);
          speak('Ocurrió un error. Intenta de nuevo.');
        }
      } else {
        speak('No entendí el comando. Di "ayuda" para ver los comandos disponibles.');
      }

      setIsProcessing(false);
    },
    [router, speak]
  );

  // ── Inicializar SpeechRecognition ─────────────────────────────────────────

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

    const recognition: SpeechRecognition = new SpeechRecognitionClass();
    recognition.lang = 'es-PE';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim();
        processTranscript(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return; // Ignorar silencio
      console.error('[VoiceAssistant] Error SpeechRecognition:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Si sigue activo (no se detuvo manualmente), reiniciar
      if (recognitionRef.current && isListening) {
        try {
          recognition.start();
        } catch {
          // Ignorar si ya está activo
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [isSupported, isListening, processTranscript]);

  // ── Controles ─────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      speak('Asistente activado. Escuchando.');
    } catch {
      // Ya está escuchando
    }
  }, [isSupported, speak]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    setLastCommand(null);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const toggleSilentMode = useCallback(() => {
    setIsSilentMode((prev) => !prev);
  }, []);

  // ── Atajo de teclado Alt+M ────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

  return {
    isListening,
    isProcessing,
    isSilentMode,
    lastTranscript,
    lastCommand,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    toggleSilentMode,
    speak,
  };
}
