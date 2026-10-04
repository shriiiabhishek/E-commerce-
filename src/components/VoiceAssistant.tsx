import React, { useState } from 'react';
import { Mic, MicOff, Volume2, X, CornerDownLeft } from 'lucide-react';

interface VoiceAssistantProps {
  onExecuteCommand: (rawText: string) => { handled: boolean; responseMessage: string };
}

const SAMPLE_VOICE_COMMANDS = [
  'Search laptop',
  'Open mobile phones',
  'Show my orders',
  'Open cart',
  'Go to home',
  'Show shoes',
  'Open profile',
  'Buy laptop',
];

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onExecuteCommand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [assistantReply, setAssistantReply] = useState(
    'Click the microphone or select a voice command below.'
  );
  const [manualSpeechInput, setManualSpeechInput] = useState('');

  const handleRunCommand = (phrase: string) => {
    setRecognizedText(phrase);
    const result = onExecuteCommand(phrase);
    setAssistantReply(result.responseMessage);
  };

  const startBrowserSpeechRecognition = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAssistantReply(
        'Browser microphone recognition is unavailable in this frame. Use the simulated voice command buttons or type a spoken phrase below.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setRecognizedText('');
      setAssistantReply('Listening...');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleRunCommand(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setAssistantReply(
          "Microphone access blocked or no speech detected. Try clicking any command preset below."
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setAssistantReply('Unable to start microphone. Try a preset voice phrase below.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSpeechInput.trim()) return;
    handleRunCommand(manualSpeechInput.trim());
    setManualSpeechInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-xl bg-[#18181B] text-[#FBFBF9] shadow-2xl border border-zinc-800 p-5 transition-all duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm font-semibold tracking-tight">
                ShopSphere Voice Assistant
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Close voice assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-300 leading-relaxed">
                {isListening ? (
                  <span className="text-amber-400 font-medium">Listening... Speak now</span>
                ) : (
                  <span>{assistantReply}</span>
                )}
              </div>
              <button
                type="button"
                onClick={startBrowserSpeechRecognition}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  isListening
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isListening ? 'Listening...' : 'Speak'}
              </button>
            </div>

            {recognizedText && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                <div className="text-zinc-400">You said:</div>
                <div className="text-amber-300 font-mono-tabular mt-0.5 font-medium">
                  "{recognizedText}"
                </div>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={manualSpeechInput}
                onChange={(e) => setManualSpeechInput(e.target.value)}
                placeholder='Say e.g. "Search watches"...'
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1 whitespace-nowrap"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                Run
              </button>
            </form>

            <div className="pt-2 border-t border-zinc-800/80">
              <div className="text-[11px] text-zinc-400 mb-2">
                Instant Voice Command Presets (Click to Test):
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {SAMPLE_VOICE_COMMANDS.map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => handleRunCommand(cmd)}
                    className="text-left px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-200 truncate transition-colors border border-zinc-800"
                  >
                    "{cmd}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-12 px-4 rounded-full bg-[#18181B] hover:bg-zinc-800 text-[#FBFBF9] shadow-lg border border-zinc-700 flex items-center gap-2.5 transition-transform duration-150 hover:-translate-y-0.5"
        aria-label="Open ShopSphere Voice Assistant"
      >
        <span className="text-base" aria-hidden="true">🎤</span>
        <span className="text-xs font-medium whitespace-nowrap">Voice Assistant</span>
      </button>
    </div>
  );
};
