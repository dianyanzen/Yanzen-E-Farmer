import type {SVGProps} from 'react';
type Name='home'|'wallet'|'sprout'|'harvest'|'chart'|'calculator'|'plus'|'arrow-right'|'eye'|'eye-off'|'log-out'|'check'|'folder'|'receipt';
const paths:Record<Name,React.ReactNode>={
 home:<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
 wallet:<><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M16 13h5M3 9h18"/><circle cx="16" cy="13" r=".7" fill="currentColor" stroke="none"/></>,
 sprout:<><path d="M12 22V11M12 16C5 16 3 12 3 5c7 0 9 4 9 11ZM12 14c0-7 3-10 9-10 0 7-3 10-9 10Z"/></>,
 harvest:<><path d="M4 7h16l-2 13H6L4 7ZM8 7V5a4 4 0 0 1 8 0v2M3 7h18"/></>,
 chart:<><path d="M4 20V11M10 20V5M16 20v-8M22 20V3M2 21h21"/></>,
 calculator:<><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2"/></>,
 plus:<path d="M12 5v14M5 12h14"/>,
 'arrow-right':<path d="M5 12h14m-6-6 6 6-6 6"/>,
 eye:<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
 'eye-off':<><path d="m3 3 18 18M10.6 5.1A11 11 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-3 3.7M6 6.7C3.5 8.5 2 12 2 12s4 7 10 7a10 10 0 0 0 4.3-.9"/><path d="M10 10a3 3 0 0 0 4 4"/></>,
 'log-out':<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>,
 check:<path d="m4 12 5 5L20 6"/>,
 folder:<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z"/>,
 receipt:<><path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM9 8h6M9 12h6M9 16h4"/></>
};
export default function FarmIcon({name,size=22,...props}:SVGProps<SVGSVGElement>&{name:Name;size?:number}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>}
