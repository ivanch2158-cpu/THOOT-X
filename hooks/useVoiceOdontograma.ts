// hooks/useVoiceOdontograma.ts
// Hook para control por voz del odontograma
// Gestiona escucha continua, parsing de comandos y confirmación

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { parseOdontogramaCommand, parseControlCommand } from '@/lib/voice/parser';
import type { OdontogramaCommand } from '@/lib/voice/parser';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

export interface UseVoiceOdontogramaReturn {
  isListening: boolean;
  pendingCommand: OdontogramaCommand | null;
  lastSaved: OdontogramaCommand | null;
  statusMessage: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  confirmCommand: () => void;
  cancelCommand: () => void;
  undoLastCommand: () => void;
}

// ── HOOK ──────────────────────────────────────────────────────────────────────

export function useVoiceOdontograma(
  onSaveHallazgo: (comando: OdontogramaCommand) => Promise<void>,
  onUndoLast: () => Promise<void>
): UseVoiceOdontogramaReturn {
  const [isListening, setIsListening] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<OdontogramaCommand | null>(null);
  const [lastSaved, setLastSaved] = useState<OdontogramaCommand | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // ── Síntesis de voz ───────────────────────────────────────────────────────

  const speak = useCallback((texto: string) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-PE';
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  }, [isSupported]);

  // ── Procesar transcripción ────────────────────────────────────────────────

  const processTranscript = useCallback(
    async (transcript: string) => {
      const control = parseControlCommand(transcript);

      if (control) {
        if (control === 'confirmar' && pendingCommand) {
          // Confirmar hallazgo pendiente
          await onSaveHallazgo(pendingCommand);
          setLastSaved(pendingCommand);
          setPendingCommand(null);
          setStatusMessage('Hallazgo guardado. Continúa.');
          speak('Guardado. Continúa.');
          return;
        }

        if (control === 'cancelar') {
          setPendingCommand(null);
          setStatusMessage('Cancelado. Repite el comando.');
          speak('Cancelado. Repite el comando.');
          return;
        }

        if (control === 'deshacer') {
          await onUndoLast();
          setLastSaved(null);
          setStatusMessage('Último hallazgo eliminado.');
          speak('Deshecho.');
          return;
        }

        if (control === 'terminar') {
          stopListening();
          speak('Modo voz desactivado.');
          return;
        }
      }

      // Intentar parsear como comando de odontograma
      const cmd = parseOdontogramaCommand(transcript);

      if (cmd) {
        setPendingCommand(cmd);
        const superficieLabel = cmd.superficie.charAt(0).toUpperCase() + cmd.superficie.slice(1);
        const condicionLabel = cmd.condicion.charAt(0).toUpperCase() + cmd.condicion.slice(1);
        const msg = `Diente ${cmd.numero_diente}, ${superficieLabel}, ${condicionLabel}. ¿Confirmar?`;
        setStatusMessage(msg);
        speak(msg);
      } else {
        setStatusMessage('No entendí. Repite el comando.');
        speak('No entendí, repite el comando.');
      }
    },
    [pendingCommand, onSaveHallazgo, onUndoLast, speak]
  );

  // ── Workaround para referencia mutable ───────────────────────────────────

  const processTranscriptRef = useRef(processTranscript);
  useEffect(() => {
    processTranscriptRef.current = processTranscript;
  }, [processTranscript]);

  // ── Inicializar SpeechRecognition ─────────────────────────────────────────

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

    const recognition: SpeechRecognition = new SpeechRecognitionClass();
    recognition.lang = 'es-PE';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        processTranscriptRef.current(lastResult[0].transcript.trim());
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== 'no-speech') {
        setStatusMessage('Error de micrófono. Intenta de nuevo.');
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Reiniciar si sigue activo
      if (recognitionRef.current) {
        try { recognition.start(); } catch { /* ya activo */ }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [isSupported]);

  // ── Controles ─────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setStatusMessage('Escuchando...');
      speak('Modo voz activado. Indica el diente, la superficie y la condición.');
    } catch { /* ya activo */ }
  }, [speak]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    const r = recognitionRef.current;
    recognitionRef.current = null;
    r.stop();
    setIsListening(false);
    setPendingCommand(null);
    setStatusMessage('');
  }, []);

  const confirmCommand = useCallback(async () => {
    if (!pendingCommand) return;
    await onSaveHallazgo(pendingCommand);
    setLastSaved(pendingCommand);
    setPendingCommand(null);
    setStatusMessage('Hallazgo guardado. Continúa.');
    speak('Guardado. Continúa.');
  }, [pendingCommand, onSaveHallazgo, speak]);

  const cancelCommand = useCallback(() => {
    setPendingCommand(null);
    setStatusMessage('Cancelado. Repite el comando.');
    speak('Cancelado.');
  }, [speak]);

  const undoLastCommand = useCallback(async () => {
    await onUndoLast();
    setLastSaved(null);
    setStatusMessage('Último hallazgo eliminado.');
    speak('Deshecho.');
  }, [onUndoLast, speak]);

  return {
    isListening,
    pendingCommand,
    lastSaved,
    statusMessage,
    isSupported,
    startListening,
    stopListening,
    confirmCommand,
    cancelCommand,
    undoLastCommand,
  };
}
