export interface SpeechSection {id: string; title: string; text: string}
export interface SpeechPosition {sectionId: string; chunk: number}
export interface SpeechHighlight {sectionId: string; start: number; end: number; wordStart?: number; wordEnd?: number}
export interface SpeechChunkRange {text: string; start: number; end: number}
/** Small utterances avoid mobile engines dropping the tail of a long lesson. */
export function speechChunks(text: string): string[] {
  const chunks: string[] = [];
  const sentences = text.trim().split(/(?<=[.!?])\s+|\n+/u).filter(Boolean);
  for (const sentence of sentences) {
    let remaining = sentence.trim();
    while (remaining.length > 240) {
      const boundary = remaining.lastIndexOf(' ',240);
      const end = boundary > 0 ? boundary : 240;
      chunks.push(remaining.slice(0,end));
      remaining = remaining.slice(end).trimStart();
    }
    if (remaining) chunks.push(remaining);
  }
  return chunks;
}

export function speechQueue(sections: SpeechSection[]) {
  return sections.map(section => {
    const ranges = speechChunkRanges(section.text);
    return {...section,ranges,chunks:ranges.map(range => range.text)};
  }).filter(section => section.chunks.length);
}

/** Original-text offsets keep visual highlights correct around trimmed whitespace. */
export function speechChunkRanges(text: string): SpeechChunkRange[] {
  let offset = 0;
  return speechChunks(text).map(chunk => {
    const start = text.indexOf(chunk,offset);
    const end = start + chunk.length;
    offset = end;
    return {text:chunk,start,end};
  });
}

export function speechCursor(queue: ReturnType<typeof speechQueue>, saved?: SpeechPosition) {
  const index = Math.max(0,queue.findIndex(section => section.id === saved?.sectionId));
  const chunk = saved && queue[index] && saved.sectionId === queue[index].id && Number.isFinite(saved.chunk)
    ? Math.max(0,Math.min(Math.floor(saved.chunk),queue[index].chunks.length - 1)) : 0;
  return {index,chunk};
}
