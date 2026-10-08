export function navigate(route:string){window.location.hash=route}
export function currentRoute(){return window.location.hash.slice(1)||'/home'}
