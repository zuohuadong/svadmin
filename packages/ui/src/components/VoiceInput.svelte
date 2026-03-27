<script lang="ts">
  import { Mic, MicOff, Loader2 } from 'lucide-svelte';
  import TooltipButton from './TooltipButton.svelte';

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
  let recognition: any = null;

  // Initialize SpeechRecognition on mount
  $effect(() => {
    // @ts-ignore - Browser specific APIs
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      notSupported = true;
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    // Tries to return interim results, but we mainly care about final
    recognition.interimResults = false;
    // Uses the browser locale by default
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = () => {
      isListening = true;
      if (onstart) onstart();
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      if (onresult && transcript) {
        onresult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event.error);
      isListening = false;
      if (onend) onend();
    };

    recognition.onend = () => {
      isListening = false;
      if (onend) onend();
    };
  });

  function toggleListening() {
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
