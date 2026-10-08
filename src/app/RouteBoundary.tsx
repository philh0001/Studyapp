import {Component,type ReactNode} from 'react';

export class RouteBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<section className="card" role="alert"><h1>This study tool could not open</h1><p>Your saved study data remains in this browser. Check your connection or offline installation, then reload to try again.</p><button onClick={()=>window.location.reload()}>Reload study app</button><a className="button secondary" href="#/home">Return home</a></section>:this.props.children}
}

export function RouteLoading(){return <p className="loading" role="status" aria-live="polite">Opening study tool…</p>}
