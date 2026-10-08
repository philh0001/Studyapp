import {it,expect} from 'vitest';
import {render,screen} from '@testing-library/react';
import {SelectionExplanation} from '../../src/features/analytics/SelectionExplanation';
import {question} from '../fixtures';
it('shows the actual selected question reasons and exact supplied shortage',()=>{const q=question();render(<SelectionExplanation input={{questions:[q],trust:[],reviewItems:[],objectiveStats:[],previousSessionIds:[],attemptedIds:[],requestedCount:5,mode:'draft-preview',useReserved:false,now:new Date(),random:()=>0}} result={{questions:[q],requestedCount:5,availableCount:1,shortages:['Only 1 unique question is available'],releasesReservedIds:[],allocations:[2,1,1,1]}}/>);expect(screen.getByText('q1: unseen')).toBeInTheDocument();expect(screen.getByText('Only 1 unique question is available')).toBeInTheDocument()});
