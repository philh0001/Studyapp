import type {CourseLesson} from './types';
export interface LessonReadingBlock{kind:'title'|'point'|'section-title'|'paragraph'|'step'|'code';text:string;start:number;end:number;sectionIndex?:number;itemIndex?:number}
/** Rendering and speech share exactly the same text and offsets. Existing quick points stay first. */
export function lessonReading(lesson:CourseLesson){
 const blocks:LessonReadingBlock[]=[];let offset=0;
 const add=(kind:LessonReadingBlock['kind'],text:string,sectionIndex?:number,itemIndex?:number)=>{blocks.push({kind,text,start:offset,end:offset+text.length,sectionIndex,itemIndex});offset+=text.length+2};
 add('title',lesson.title);lesson.points.forEach((point,index)=>add('point',point,undefined,index));
 lesson.sections?.forEach((section,index)=>{add('section-title',section.title,index);section.paragraphs.forEach((paragraph,item)=>add('paragraph',paragraph,index,item));section.steps?.forEach((step,item)=>add('step',step,index,item));if(section.code)add('code',section.code.text,index)});
 return {blocks,text:blocks.map(block=>block.text).join('\n\n')};
}
