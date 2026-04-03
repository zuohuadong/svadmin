<script lang="ts">
  import { Mic, MicOff, Loader2 } from 'lucide-svelte';
  import TooltipButton from './TooltipButton.svelte';

  // Web Speech API type declarations
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
  interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
  }

  interface Props {
    /** Called when a speech recognition result is finalized */
    onresult?: (text: string) => void;
    /** Called when the engine starts listening */
    onstart?: () => void;
    /** Called when the engine stops listening */
    onend?: () => void;
    /** Standard button size */
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';
    /** Custom class for the button */
    class?: string;
  }

  let { 
    onresult, 
    onstart, 
    onend, 
    size = 'icon', 
    class: className = '' 
  }: Props = $props();

  let isListening = $state(false);
  let notSupported = $state(false);
  let recognition: SpeechRecognitionInstance | null = null;

  // Initialize SpeechRecognition on mount
  $effect(() => {
    const SpeechRecognitionCtor = (
      (globalThis as Record<string, unknown>).SpeechRecognition ||
      (globalThis as Record<string, unknown>).webkitSpeechRecognition
    ) as (new () => SpeechRecognitionInstance) | undefined;
    
    if (!SpeechRecognitionCtor) {
      notSupported = true;
      return;
    }

    recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = () => {
      isListening = true;
      if (onstart) onstart();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result: SpeechRecognitionResult) => result[0])
        .map((result: SpeechRecognitionAlternative) => result.transcript)
        .join('');
      
      if (onresult && transcript) {
        onresult(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('SpeechRecognition error:', event.error);
      isListening = false;
      if (onend) onend();
    };

    recognition.onend = () => {
      isListening = false;
      if (onend) onend();
    };
  });

  function toggleListening(e?: MouseEvent) {
    if (e) e.preventDefault();
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }
</script>

<TooltipButton 
  tooltip={notSupported ? "Voice input not supported in this browser" : (isListening ? "Stop listening" : "Start voice input")}
  variant={isListening ? "destructive" : "ghost"} 
  {size}
  class="{isListening ? 'animate-pulse' : ''} {className}"
  onclick={toggleListening}
  disabled={notSupported}
>
  {#if isListening}
    <Loader2 class="h-4 w-4 animate-spin -ml-1 mr-1.5 inline-block sm:hidden" />
    <MicOff class="h-4 w-4" />
  {:else}
    <Mic class="h-4 w-4" />
  {/if}
</TooltipButton>
