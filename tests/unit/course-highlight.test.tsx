import {render,screen} from '@testing-library/react';
import {expect,it} from 'vitest';
import {HighlightedText} from '../../src/features/course/HighlightedText';
it('highlights the spoken passage and its current word without changing teaching text',()=>{
 const text='Azure roles grant access.';
 const ui=render(<p><HighlightedText text={text} offset={20} sectionId="lesson" highlight={{sectionId:'lesson',start:20,end:20+text.length,wordStart:26,wordEnd:31}}/></p>);
 expect(ui.container.textContent).toBe(text);expect(ui.container.querySelector('mark')).toHaveTextContent(text);expect(ui.container.querySelector('.course-spoken-word')).toHaveTextContent('roles');
});
it('clips a chunk across teaching paragraphs and does not highlight another lesson',()=>{
 const ui=render(<p><HighlightedText text="Second point." offset={50} sectionId="lesson" highlight={{sectionId:'lesson',start:40,end:56}}/></p>);
 expect(ui.container.querySelector('mark')).toHaveTextContent('Second');expect(ui.container.textContent).toBe('Second point.');
 ui.rerender(<p><HighlightedText text="Second point." offset={50} sectionId="lesson" highlight={{sectionId:'other',start:50,end:56}}/></p>);
 expect(ui.container.querySelector('mark')).toBeNull();expect(screen.getByText('Second point.')).toBeVisible();
});
