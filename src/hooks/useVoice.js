"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Custom hook for Voice Input/Output
 * Uses Web Speech API (SpeechRecognition for input, SpeechSynthesis for output)
 */
export default function useVoice({ onResult, language = "en-US" } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    setIsSupported(!!SpeechRecognition && !!speechSynthesis);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          setIsListening(false);
          onResult?.(finalTranscript);
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          alert("Microphone access is required for voice input. Please allow microphone access in your browser settings.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    synthRef.current = speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language, onResult]);

  /**
   * Start voice recognition
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    try {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Failed to start listening:", error);
      setIsListening(false);
    }
  }, []);

  /**
   * Stop voice recognition
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  /**
   * Text-to-Speech output
   * Reads the given text aloud using SpeechSynthesis
   */
  const speak = useCallback(
    (text) => {
      if (!synthRef.current) {
        console.warn("Speech synthesis not supported");
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      // Clean markdown formatting for better speech
      const cleanText = text
        .replace(/```[\s\S]*?```/g, "code block omitted")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/#{1,6}\s/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .trim();

      // Split long text into chunks (SpeechSynthesis has character limits)
      const maxChunkLength = 200;
      const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
      const chunks = [];
      let currentChunk = "";

      sentences.forEach((sentence) => {
        if ((currentChunk + sentence).length > maxChunkLength) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += sentence;
        }
      });
      if (currentChunk) chunks.push(currentChunk.trim());

      setIsSpeaking(true);

      chunks.forEach((chunk, index) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = language;
        utterance.rate = 1;
        utterance.pitch = 1;

        // Get a natural-sounding voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Google") ||
              v.name.includes("Natural") ||
              v.name.includes("Samantha"))
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        if (index === chunks.length - 1) {
          utterance.onend = () => setIsSpeaking(false);
        }

        synthRef.current.speak(utterance);
      });
    },
    [language]
  );

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
