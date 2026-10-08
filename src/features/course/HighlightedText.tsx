import type {SpeechHighlight} from './speech';
/** Range offsets refer to the exact lesson text supplied to speech synthesis. */
export function HighlightedText({text,offset,sectionId,highlight}:{text:string;offset:number;sectionId:string;highlight:SpeechHighlight|null}){
 if(!highlight||highlight.sectionId!==sectionId||!Number.isFinite(highlight.start)||!Number.isFinite(highlight.end))return <>{text}</>;
 const start=Math.max(0,highlight.start-offset),end=Math.min(text.length,highlight.end-offset);
 if(start>=end)return <>{text}</>;
 const wordStart=Math.max(start,(highlight.wordStart??highlight.end)-offset),wordEnd=Math.min(end,(highlight.wordEnd??highlight.end)-offset);
 return <>{text.slice(0,start)}<mark className="course-reading-passage">{wordStart<wordEnd?<>{text.slice(start,wordStart)}<strong className="course-spoken-word">{text.slice(wordStart,wordEnd)}</strong>{text.slice(wordEnd,end)}</>:text.slice(start,end)}</mark>{text.slice(end)}</>;
}
