import {render,screen} from '@testing-library/react';
import {expect,it,vi} from 'vitest';
import {RouteBoundary,RouteLoading} from '../../src/app/RouteBoundary';

it('offers recovery after a route failure and allows another route to open',()=>{
 const consoleError=vi.spyOn(console,'error').mockImplementation(()=>{});
 function Broken():never{throw Error('offline chunk unavailable')}
 try{const view=render(<RouteBoundary key="broken"><Broken/></RouteBoundary>);expect(screen.getByRole('alert')).toHaveTextContent('Your saved study data remains');expect(screen.getByRole('button',{name:'Reload study app'})).toBeVisible();expect(screen.getByRole('link',{name:'Return home'})).toHaveAttribute('href','#/home');view.rerender(<RouteBoundary key="home"><h1>Home restored</h1></RouteBoundary>);expect(screen.getByRole('heading',{name:'Home restored'})).toBeVisible();expect(screen.queryByRole('alert')).toBeNull()}finally{consoleError.mockRestore()}
});
it('announces loading while route code is retrieved',()=>{render(<RouteLoading/>);expect(screen.getByRole('status')).toHaveAttribute('aria-live','polite')});
