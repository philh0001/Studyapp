import {useEffect, useMemo, useRef, useState} from 'react';
import {speechCursor, speechQueue, type SpeechHighlight, type SpeechPosition, type SpeechSection} from './speech';
export interface CourseSpeechProps {
 sections: SpeechSection[];
 initialPosition?: SpeechPosition;
 rate: number;
 voiceURI: string;
 onPreferences: (rate: number, voiceURI: string) => void;
 onPosition: (sectionId: string, chunk: number) => void;
 onSection?: (sectionId: string) => void;
 onHighlight?: (highlight: SpeechHighlight | null) => void;
}
type Playback = 'idle' | 'playing' | 'paused' | 'finished';

export function CourseSpeech(props: CourseSpeechProps) {
  // Content identity, rather than array identity, prevents a persistence render
  // from cancelling playback every time the saved cursor changes.
  const signature = JSON.stringify(props.sections);
  const queue = useMemo(() => speechQueue(JSON.parse(signature) as SpeechSection[]),[signature]);
  const supported = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
  const synth = supported ? speechSynthesis : null;
  const cursor = useRef(speechCursor(queue,props.initialPosition));
  const generation = useRef(0);
  const active = useRef<SpeechSynthesisUtterance | null>(null);
  const playback = useRef<Playback>('idle');
  const callbacks = useRef(props);
  callbacks.current = props;
  const [state,setState] = useState<Playback>('idle');
  const [displayCursor,setDisplayCursor] = useState(cursor.current);
  const [error,setError] = useState('');
  const [voices,setVoices] = useState<SpeechSynthesisVoice[]>([]);

  function cancel(clearHighlight = true) {
    generation.current++;
    if (active.current) {
      active.current.onend = null;
      active.current.onerror = null;
      active.current.onboundary = null;
      active.current = null;
    }
    synth?.cancel();
    if (clearHighlight) callbacks.current.onHighlight?.(null);
  }
  function transition(next: Playback) {
    playback.current = next;
    setState(next);
  }
  function saveCursor() {
    setDisplayCursor({...cursor.current});
    const selected = queue[cursor.current.index];
    if (selected) {
      callbacks.current.onPosition(selected.id,cursor.current.chunk);
      callbacks.current.onSection?.(selected.id);
    }
  }

  useEffect(() => {
    cancel();
    cursor.current = speechCursor(queue,callbacks.current.initialPosition);
    setDisplayCursor({...cursor.current});
    playback.current = 'idle';
    setState('idle');
    setError('');
    return () => cancel();
    // A preference or persistence callback change must not reset the queue.
  },[queue]);

  useEffect(() => {
    if (!supported) return;
    const update = () => setVoices(synth!.getVoices());
    update();
    synth!.addEventListener?.('voiceschanged',update);
    return () => synth!.removeEventListener?.('voiceschanged',update);
  },[supported]);

  function speakChunk(token: number) {
    if (!supported || token !== generation.current || playback.current !== 'playing') return;
    const selected = queue[cursor.current.index];
    if (!selected) return;
    try {
      const passage = selected.ranges[cursor.current.chunk];
      const highlight = {sectionId:selected.id,start:passage.start,end:passage.end};
      const utterance = new SpeechSynthesisUtterance(passage.text);
      const {rate,voiceURI} = callbacks.current;
      utterance.rate = [.75,1,1.25,1.5].includes(rate) ? rate : 1;
      utterance.voice = synth!.getVoices().find(voice => voice.voiceURI === voiceURI) ?? null;
      utterance.onend = () => {
        if (token !== generation.current || playback.current !== 'playing' || active.current !== utterance) return;
        active.current = null;
        if (cursor.current.chunk + 1 < selected.chunks.length) {
          cursor.current = {...cursor.current,chunk:cursor.current.chunk + 1};
        } else if (cursor.current.index + 1 < queue.length) {
          cursor.current = {index:cursor.current.index + 1,chunk:0};
        } else {
          transition('finished');
          callbacks.current.onHighlight?.(null);
          return;
        }
        saveCursor();
        speakChunk(token);
      };
      utterance.onerror = () => {
        if (token !== generation.current || playback.current !== 'playing' || active.current !== utterance) return;
        active.current = null;
        generation.current++;
        transition('idle');
        callbacks.current.onHighlight?.(null);
        setError('Reading stopped in this browser. Try again, or continue with the text.');
      };
      utterance.onboundary = event => {
        if (token !== generation.current || playback.current !== 'playing' || active.current !== utterance || event.name !== 'word') return;
        const index = event.charIndex, length = event.charLength;
        if (!Number.isInteger(index) || index < 0 || index >= passage.text.length || !Number.isInteger(length) || length < 0) return;
        let start = index, end = Math.min(passage.text.length,index + length);
        if (!length) {
          const word = [...passage.text.matchAll(/\S+/gu)].find(match => match.index + match[0].length > index);
          if (!word) return;
          start = word.index;
          end = start + word[0].length;
        }
        callbacks.current.onHighlight?.({...highlight,wordStart:passage.start + start,wordEnd:passage.start + end});
      };
      active.current = utterance;
      callbacks.current.onHighlight?.(highlight);
      // cancel() leaves the browser's global paused flag unchanged.
      if (synth!.paused) synth!.resume();
      synth!.speak(utterance);
    } catch {
      cancel();
      transition('idle');
      setError('Reading could not start. Try again, or continue with the text.');
    }
  }
  function play() {
    cancel();
    if (playback.current === 'finished') cursor.current = {index:0,chunk:0};
    setError('');
    transition('playing');
    saveCursor();
    speakChunk(generation.current);
  }
  function navigate(direction: number) {
    const previousState = playback.current;
    cancel();
    cursor.current = {index:Math.max(0,Math.min(queue.length - 1,cursor.current.index + direction)),chunk:0};
    setError('');
    transition(previousState === 'playing' ? 'playing' : 'idle');
    saveCursor();
    if (previousState === 'playing') speakChunk(generation.current);
  }

  if (!supported) return <p className="fine-print">Read aloud is unavailable in this browser. You can still read all course notes as text.</p>;
  const current = queue[displayCursor.index];
  const unavailableVoice = props.voiceURI && !voices.some(voice => voice.voiceURI === props.voiceURI);
  return <section aria-label="Listen to course notes">
    <div className={`button-row course-playback-controls${state === 'playing' || state === 'paused' ? ' course-playback-active' : ''}`}>
      {state === 'playing'
        ? <button type="button" onClick={() => {cancel(false); transition('paused');}}>Pause reading</button>
        : <button type="button" disabled={!queue.length} onClick={play}>{state === 'paused' ? 'Resume reading' : 'Play course notes'}</button>}
      <button type="button" disabled={state !== 'playing' && state !== 'paused'} onClick={() => {cancel(); transition('idle');}}>Stop reading</button>
      <button type="button" disabled={!queue.length || displayCursor.index === 0} aria-label="Previous section" onClick={() => navigate(-1)}><span aria-hidden="true">←</span><span className="course-section-label"> Previous section</span></button>
      <button type="button" disabled={!queue.length || displayCursor.index >= queue.length - 1} aria-label="Next section" onClick={() => navigate(1)}><span aria-hidden="true">→</span><span className="course-section-label"> Next section</span></button>
    </div>
    <label>Listening speed<select value={props.rate} disabled={state === 'playing'} onChange={event => props.onPreferences(Number(event.target.value),props.voiceURI)}>
      {[.75,1,1.25,1.5].map(rate => <option key={rate} value={rate}>{rate}×</option>)}
    </select></label>
    <label>Listening voice<select value={props.voiceURI} disabled={state === 'playing'} onChange={event => props.onPreferences(props.rate,event.target.value)}>
      <option value="">Device default</option>
      {unavailableVoice && <option value={props.voiceURI}>Saved voice unavailable — device default</option>}
      {voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang}){voice.localService ? ' · on device' : ''}</option>)}
    </select></label>
    <p role="status">{state === 'finished' ? 'Finished listening.' : current ? `${state === 'playing' ? 'Reading' : state === 'paused' ? 'Paused' : 'Ready'}: ${current.title} · part ${displayCursor.chunk + 1} of ${current.chunks.length}` : 'No notes selected for listening.'}</p>
    {error && <p role="alert">{error}</p>}
    <p className="fine-print">Pause resumes at the start of the current short passage. Browser speech may stop when your screen locks. Available voices and offline speech depend on your device.</p>
  </section>;
}
