import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {CourseSpeech} from '../../src/features/course/CourseSpeech';
import {speechChunkRanges, speechChunks} from '../../src/features/course/speech';

class Utterance {
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onboundary: ((event: {name:string;charIndex:number;charLength:number}) => void) | null = null;
  constructor(public text: string) {}
}
let spoken: Utterance[];
let api: {speak: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn>; getVoices: ReturnType<typeof vi.fn>; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn>};
const sections = [{id:'one', title:'First', text:'First sentence. Second sentence.'}, {id:'two', title:'Second', text:'Last sentence.'}];
const preferences = vi.fn(), position = vi.fn(), section = vi.fn();
function reader(extra: Partial<Parameters<typeof CourseSpeech>[0]> = {}) {
  return <CourseSpeech sections={sections} rate={1} voiceURI="" onPreferences={preferences} onPosition={position} onSection={section} {...extra}/>;
}
beforeEach(() => {
  spoken = [];
  api = {speak:vi.fn((u: Utterance) => spoken.push(u)), cancel:vi.fn(), getVoices:vi.fn(() => []), addEventListener:vi.fn(), removeEventListener:vi.fn()};
  vi.stubGlobal('speechSynthesis',api);
  vi.stubGlobal('SpeechSynthesisUtterance',Utterance);
  vi.clearAllMocks();
});
afterEach(() => vi.unstubAllGlobals());

it('keeps all teaching text in bounded speech chunks, including a long unbroken word', () => {
  const text = 'Short sentence.\n\n' + 'An Azure setting matters. '.repeat(30) + 'x'.repeat(510);
  const chunks = speechChunks(text);
  expect(chunks.length).toBeGreaterThan(3);
  expect(chunks.every(c => c.length > 0 && c.length <= 240)).toBe(true);
  expect(chunks.join('').replace(/\s/g,'')).toBe(text.replace(/\s/g,''));
});
it('does not autoplay and reads the queue in section order after Play', () => {
  render(reader());
  expect(spoken).toHaveLength(0);
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  expect(spoken[0].text).toBe('First sentence.');
  act(() => spoken[0].onend?.());
  expect(spoken[1].text).toBe('Second sentence.');
  act(() => spoken[1].onend?.());
  expect(spoken[2].text).toBe('Last sentence.');
  expect(position).toHaveBeenLastCalledWith('two',0);
  act(() => spoken[2].onend?.());
  expect(screen.getByRole('status')).toHaveTextContent('Finished');
});
it('pauses without advancing from late callbacks and resumes the saved short chunk', () => {
  render(reader());
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  const lateEnd = spoken[0].onend;
  fireEvent.click(screen.getByRole('button',{name:'Pause reading'}));
  act(() => lateEnd?.());
  expect(spoken).toHaveLength(1);
  fireEvent.click(screen.getByRole('button',{name:'Resume reading'}));
  expect(spoken[1].text).toBe('First sentence.');
  act(() => lateEnd?.());
  expect(spoken).toHaveLength(2);
});
it('Stop keeps the cursor and rejects old callbacks after restart', () => {
  render(reader({initialPosition:{sectionId:'one',chunk:1}}));
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  const lateEnd = spoken[0].onend;
  fireEvent.click(screen.getByRole('button',{name:'Stop reading'}));
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  expect(spoken[1].text).toBe('Second sentence.');
  act(() => lateEnd?.());
  expect(spoken).toHaveLength(2);
});
it('replaces a queue without autoplay or advancing on stale end/error events', () => {
  const {rerender,unmount} = render(reader());
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  const lateEnd = spoken[0].onend, lateError = spoken[0].onerror;
  rerender(reader({sections:[{id:'new',title:'New',text:'New notes.'}]}));
  act(() => {lateEnd?.(); lateError?.();});
  expect(spoken).toHaveLength(1);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  expect(spoken[1].text).toBe('New notes.');
  unmount();
  expect(api.cancel).toHaveBeenCalled();
});
it('navigates sections while idle without speaking and skips active speech safely', () => {
  render(reader());
  fireEvent.click(screen.getByRole('button',{name:'Next section'}));
  expect(spoken).toHaveLength(0);
  expect(position).toHaveBeenLastCalledWith('two',0);
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  const lateEnd = spoken[0].onend;
  fireEvent.click(screen.getByRole('button',{name:'Previous section'}));
  expect(spoken[1].text).toBe('First sentence.');
  act(() => lateEnd?.());
  expect(spoken).toHaveLength(2);
});
it('reports speech failure and lets the user retry the same cursor', () => {
  render(reader());
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  act(() => spoken[0].onerror?.());
  expect(screen.getByRole('alert')).toHaveTextContent('Try again');
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  expect(spoken[1].text).toBe('First sentence.');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
it('applies a saved voice and rate while exposing preference changes', () => {
  const voice = {voiceURI:'voice-a',name:'Local English',lang:'en-GB',localService:true};
  api.getVoices.mockReturnValue([voice]);
  render(reader({rate:1.25,voiceURI:'voice-a'}));
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  expect(spoken[0].rate).toBe(1.25);
  expect(spoken[0].voice).toBe(voice);
  fireEvent.click(screen.getByRole('button',{name:'Stop reading'}));
  fireEvent.change(screen.getByLabelText('Listening speed'),{target:{value:'0.75'}});
  expect(preferences).toHaveBeenLastCalledWith(0.75,'voice-a');
});
it('keeps text reading usable when browser speech is unsupported', () => {
  vi.stubGlobal('speechSynthesis',undefined);
  render(reader());
  expect(screen.getByText(/Read aloud is unavailable/)).toBeVisible();
  expect(screen.queryByRole('button',{name:'Play course notes'})).not.toBeInTheDocument();
});
it('does not skip text if an old utterance fires duplicate end or error events', () => {
  render(reader());
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  const end = spoken[0].onend, error = spoken[0].onerror;
  act(() => end?.());
  expect(spoken[1].text).toBe('Second sentence.');
  act(() => {end?.(); error?.();});
  expect(spoken).toHaveLength(2);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  act(() => spoken[1].onend?.());
  expect(spoken[2].text).toBe('Last sentence.');
});
it('does not cancel speech on a persistence-only rerender with an equivalent queue', () => {
  const {rerender} = render(reader());
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  const cancelCount = api.cancel.mock.calls.length;
  rerender(reader({sections:sections.map(s => ({...s})),initialPosition:{sectionId:'one',chunk:0},onPosition:vi.fn()}));
  expect(api.cancel.mock.calls).toHaveLength(cancelCount);
  act(() => spoken[0].onend?.());
  expect(spoken[1].text).toBe('Second sentence.');
});
it('loads later voices and leaves an unavailable saved voice on the device default', () => {
  render(reader({voiceURI:'not-installed'}));
  expect(screen.getByLabelText('Listening voice')).toHaveValue('not-installed');
  api.getVoices.mockReturnValue([{voiceURI:'new',name:'New voice',lang:'en-GB',localService:true}]);
  act(() => api.addEventListener.mock.calls[0][1]());
  expect(screen.getByRole('option',{name:/New voice/})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  expect(spoken[0].voice).toBeNull();
});
it('ignores callbacks captured before unmount', () => {
  const {unmount} = render(reader());
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  const end = spoken[0].onend, error = spoken[0].onerror;
  unmount();
  act(() => {end?.(); error?.();});
  expect(spoken).toHaveLength(1);
});
it('clamps a malformed saved cursor and retries after a synchronous engine failure', () => {
  api.speak.mockImplementationOnce(() => {throw new Error('unavailable');});
  render(reader({initialPosition:{sectionId:'one',chunk:999}}));
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  expect(screen.getByRole('alert')).toHaveTextContent('Try again');
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  expect(spoken[0].text).toBe('Second sentence.');
});
it('offers no Play action for a queue without teaching text', () => {
  render(reader({sections:[{id:'empty',title:'No teaching notes',text:'  '}]}));
  expect(screen.getByRole('button',{name:'Play course notes'})).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('No notes selected');
});
it('maps repeated sentences and split long passages back to their exact original offsets', () => {
  const text = '  Repeat.\n\nRepeat.\n\n' + 'Important Azure setting '.repeat(25) + 'x'.repeat(510);
  const ranges = speechChunkRanges(text);
  expect(ranges.map(range => range.text)).toEqual(speechChunks(text));
  expect(ranges[0]).toEqual({text:'Repeat.',start:2,end:9});
  expect(ranges[1]).toEqual({text:'Repeat.',start:11,end:18});
  expect(ranges.every((range,index) => text.slice(range.start,range.end) === range.text && (!index || range.start >= ranges[index - 1].end))).toBe(true);
});
it('highlights each passage before speech and maps word boundary offsets to source text', () => {
  const highlight = vi.fn();
  render(reader({sections:[{id:'words',title:'Words',text:'  Azure role.\n\nNext point.'}],onHighlight:highlight}));
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  expect(highlight).toHaveBeenLastCalledWith({sectionId:'words',start:2,end:13});
  act(() => spoken[0].onboundary?.({name:'word',charIndex:6,charLength:4}));
  expect(highlight).toHaveBeenLastCalledWith({sectionId:'words',start:2,end:13,wordStart:8,wordEnd:12});
  act(() => spoken[0].onend?.());
  expect(highlight).toHaveBeenLastCalledWith({sectionId:'words',start:15,end:26});
});
it('derives zero-length word boundaries and ignores invalid, nonword or late events', () => {
  const highlight = vi.fn();
  render(reader({onHighlight:highlight}));
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  const boundary = spoken[0].onboundary;
  act(() => boundary?.({name:'word',charIndex:6,charLength:0}));
  expect(highlight).toHaveBeenLastCalledWith({sectionId:'one',start:0,end:15,wordStart:6,wordEnd:15});
  const calls = highlight.mock.calls.length;
  act(() => {
    boundary?.({name:'sentence',charIndex:0,charLength:5});
    boundary?.({name:'word',charIndex:NaN,charLength:5});
    boundary?.({name:'word',charIndex:-1,charLength:5});
    boundary?.({name:'word',charIndex:999,charLength:5});
    boundary?.({name:'word',charIndex:0,charLength:Infinity});
  });
  expect(highlight).toHaveBeenCalledTimes(calls);
  act(() => spoken[0].onend?.());
  const advancedCalls = highlight.mock.calls.length;
  act(() => boundary?.({name:'word',charIndex:0,charLength:5}));
  expect(highlight).toHaveBeenCalledTimes(advancedCalls);
});
it('retains the highlight on Pause but clears it on Stop, completion and failure', () => {
  const highlight = vi.fn();
  render(reader({sections:[{id:'one',title:'First',text:'First sentence.'}],onHighlight:highlight}));
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  const boundary = spoken[0].onboundary;
  fireEvent.click(screen.getByRole('button',{name:'Pause reading'}));
  expect(highlight).toHaveBeenLastCalledWith({sectionId:'one',start:0,end:15});
  const calls = highlight.mock.calls.length;
  act(() => boundary?.({name:'word',charIndex:0,charLength:5}));
  expect(highlight).toHaveBeenCalledTimes(calls);
  fireEvent.click(screen.getByRole('button',{name:'Stop reading'}));
  expect(highlight).toHaveBeenLastCalledWith(null);
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  act(() => spoken[1].onend?.());
  expect(highlight).toHaveBeenLastCalledWith(null);
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  act(() => spoken[2].onerror?.());
  expect(highlight).toHaveBeenLastCalledWith(null);
});
it('clears the highlight on queue replacement and unmount without accepting stale boundaries', () => {
  const highlight = vi.fn();
  const {rerender,unmount} = render(reader({onHighlight:highlight}));
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  const boundary = spoken[0].onboundary;
  rerender(reader({sections:[{id:'new',title:'New',text:'New text.'}],onHighlight:highlight}));
  expect(highlight).toHaveBeenLastCalledWith(null);
  const calls = highlight.mock.calls.length;
  act(() => boundary?.({name:'word',charIndex:0,charLength:5}));
  expect(highlight).toHaveBeenCalledTimes(calls);
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  unmount();
  expect(highlight).toHaveBeenLastCalledWith(null);
});
it('starts reading when the browser engine was left paused by another reader', () => {
  const engine = Object.assign(api,{paused:true,resume:vi.fn(() => {engine.paused = false;})});
  api.speak.mockImplementation((utterance: Utterance) => {if (!engine.paused) spoken.push(utterance);});
  render(reader());
  fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
  expect(spoken[0]?.text).toBe('First sentence.');
});
