// import { useState, useCallback } from 'react';

// export const useVoiceChat = (onTranscriptReady) => {
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);

//   const startListening = useCallback(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Speech recognition is not supported in this browser. Try using Chrome or Edge.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.lang = 'en-US';
//     recognition.interimResults = false;
//     recognition.maxAlternatives = 1;

//     recognition.onstart = () => {
//       setIsListening(true);
//     };

//     recognition.onresult = (event) => {
//       const speechToText = event.results[0][0].transcript;
//       if (onTranscriptReady) {
//         onTranscriptReady(speechToText);
//       }
//     };

//     recognition.onerror = (event) => {
//       console.error("Speech recognition error", event.error);
//       setIsListening(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//     };

//     recognition.start();
//   }, [onTranscriptReady]);

//   const speakText = useCallback((text) => {
//     if (!('speechSynthesis' in window)) return;
    
//     // Stop any ongoing speech
//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 1.0;
//     utterance.pitch = 1.0;

//     utterance.onstart = () => setIsSpeaking(true);
//     utterance.onend = () => setIsSpeaking(false);
//     utterance.onerror = () => setIsSpeaking(false);

//     window.speechSynthesis.speak(utterance);
//   }, []);

//   const stopSpeaking = useCallback(() => {
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//       setIsSpeaking(false);
//     }
//   }, []);

//   return { isListening, isSpeaking, startListening, speakText, stopSpeaking };
// };

//Update -2 - Fixing it to be aligned with mobile safari and chrome browser + Update 1

import { useState, useCallback, useRef } from 'react';

export const useVoiceChat = (onTranscriptReady) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // CRITICAL FIX for Mobile Safari: Store utterance in a ref to prevent garbage collection mid-speech
  const utteranceRef = useRef(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try using Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      if (onTranscriptReady) {
        onTranscriptReady(speechToText);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Recognition start error:", err);
      setIsListening(false);
    }
  }, [onTranscriptReady]);

  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech first
    window.speechSynthesis.cancel();

    // Create a new utterance instance
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.rate = 1.0;
    utteranceRef.current.pitch = 1.0;

    utteranceRef.current.onstart = () => {
      setIsSpeaking(true);
    };

    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };

    // Trigger speech synthesis
    window.speechSynthesis.speak(utteranceRef.current);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { isListening, isSpeaking, startListening, speakText, stopSpeaking };
};