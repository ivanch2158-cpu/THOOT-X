// components/auth/VoiceLoginForm.tsx
// Formulario de login por voz (reconocimiento de nombre + PIN de 4 dígitos)

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mic, MicOff, Volume2 } from 'lucide-react';

// Type para SpeechRecognition
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function VoiceLoginForm() {
  const router = useRouter();
  const [doctorName, setDoctorName] = useState('');
  const [pin, setPin] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Inicializar Web Speech API
  useEffect(() => {
    const win = window as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'es-ES';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcript + ' ');
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const parseVoiceInput = (text: string) => {
    // Buscar patrón: "Doctor [nombre] PIN [4 dígitos]"
    const pattern = /doctor\s+(\w+)\s+pin\s+(\d{4})/i;
    const match = text.match(pattern);

    if (match) {
      const [, name, pinCode] = match;
      setDoctorName(name);
      setPin(pinCode);
      setSuccess(`Reconocido: Doctor ${name}, PIN ${pinCode}`);
      return true;
    }

    setError('No se reconoció el patrón. Di: "Doctor [nombre] PIN [4 dígitos]"');
    return false;
  };

  const handleVoiceSubmit = () => {
    if (!transcript) {
      setError('No se capturó audio');
      return;
    }

    if (parseVoiceInput(transcript)) {
      setTimeout(() => {
        handleLogin();
      }, 1500);
    }
  };

  const handleLogin = async () => {
    if (!doctorName || !pin) {
      setError('Faltan datos: nombre del doctor o PIN');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      const response = await fetch('/api/auth/voice-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName,
          pin,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al iniciar sesión');
        return;
      }

      setSuccess('¡Sesión iniciada correctamente!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error('Voice login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const playInstruction = () => {
    const utterance = new SpeechSynthesisUtterance(
      'Por favor di: Doctor, seguido de tu nombre, luego PI-EN, y tus 4 dígitos del código PIN'
    );
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (transcript) handleVoiceSubmit();
        else handleLogin();
      }}
      className="space-y-4 w-full max-w-md"
    >
      {/* Alerta de Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Alerta de Éxito */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Instrucciones */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
        <p className="font-semibold mb-2">Instrucciones de voz:</p>
        <p>Di: <strong>"Doctor [nombre] PIN [4 dígitos]"</strong></p>
        <p className="text-xs text-gray-600 mt-2">Ejemplo: "Doctor Juan PIN 1234"</p>
      </div>

      {/* Botón para escuchar instrucción */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={playInstruction}
      >
        <Volume2 className="w-4 h-4 mr-2" />
        Escuchar Instrucción
      </Button>

      {/* Micrófono - Reconocimiento de voz */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Entrada de Voz
        </label>
        <Button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`w-full ${
            isListening
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 mr-2 animate-pulse" />
              Detener Grabación
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Presiona para Grabar
            </>
          )}
        </Button>

        {transcript && (
          <div className="bg-gray-50 rounded p-3 mt-2">
            <p className="text-xs font-medium text-gray-600 mb-1">Capturado:</p>
            <p className="text-sm text-gray-800">{transcript}</p>
          </div>
        )}
      </div>

      {/* Entrada manual - Nombre del doctor */}
      <div className="space-y-2 border-t pt-4">
        <label htmlFor="doctorName" className="text-sm font-medium text-gray-700">
          Nombre del Doctor (Manual)
        </label>
        <Input
          id="doctorName"
          type="text"
          placeholder="Juan"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Entrada manual - PIN */}
      <div className="space-y-2">
        <label htmlFor="pin" className="text-sm font-medium text-gray-700">
          PIN de 4 Dígitos
        </label>
        <Input
          id="pin"
          type="password"
          placeholder="••••"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          {pin.length}/4 dígitos
        </p>
      </div>

      {/* Botón Submit */}
      <Button
        type="submit"
        disabled={isLoading || !doctorName || !pin}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Iniciando Sesión...
          </>
        ) : (
          'Iniciar Sesión por Voz'
        )}
      </Button>

      {/* Link a login normal */}
      <p className="text-center text-sm text-gray-600">
        <a href="/login" className="text-blue-600 hover:underline font-medium">
          Login por email
        </a>
      </p>
    </form>
  );
}
