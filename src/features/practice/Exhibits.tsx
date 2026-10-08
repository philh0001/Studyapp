import type {Question} from '../../content/types';
import './formats.css';

export function QuestionContext({question}:{question:Question}){
 return <>{question.caseStudy&&<aside className="case-context" aria-label="Shared case study"><span className="eyebrow">Case study</span><h3>{question.caseStudy.title}</h3><p>{question.caseStudy.overview}</p></aside>}{question.exhibits?.map((exhibit,index)=><figure className="question-exhibit" key={index}>{exhibit.type==='table'?<div className="exhibit-scroll"><table><caption>{exhibit.title}</caption><thead><tr>{exhibit.columns?.map((column,i)=><th key={i} scope="col">{column}</th>)}</tr></thead><tbody>{exhibit.rows?.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>:<><figcaption>{exhibit.title}</figcaption><pre tabIndex={0} aria-label={exhibit.title}><code>{exhibit.text}</code></pre></>}</figure>)}</>;
}
export function answerText(question:Question,ids:readonly string[]):string{
 const text=(id:string)=>question.options.find(option=>option.id===id)?.text??'Unanswered';
 if(question.type==='matching')return (question.matchPrompts??[]).map((prompt,i)=>`${prompt.text}: ${ids[i]?text(ids[i]):'Unanswered'}`).join('; ');
 if(!ids.length)return 'Unanswered';
 return ids.map(text).join(question.type==='ordering'?' → ':'; ');
}
export function AnswerComparison({question,selectedOptionIds}:{question:Question;selectedOptionIds:readonly string[]}){
 return <div className="comparison"><p><strong>Your answer:</strong> {answerText(question,selectedOptionIds)}</p><p><strong>Correct answer:</strong> {answerText(question,question.correctOptionIds)}</p></div>;
}
