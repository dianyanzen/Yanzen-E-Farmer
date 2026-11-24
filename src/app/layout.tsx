import type { Metadata } from 'next';
import './globals.css';
import './tokens.css';
import './components.css';
import './farm-template.css';
import './brand-overrides.css';
import FarmAccountBar from '@/components/farm-account-bar';
import FarmBottomNav from '@/components/farm-bottom-nav';
export const metadata:Metadata={title:'Yanzen E-Farmer',description:'Manajemen lahan, anggaran, operasional, panen dan keuangan pertanian',applicationName:'Yanzen E-Farmer',manifest:'/manifest.webmanifest',icons:{icon:[{url:'/brand/yz-favicon-32.png',type:'image/png',sizes:'32x32'},{url:'/icon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/brand/yz-favicon-32.png',apple:[{url:'/apple-icon.png',type:'image/png',sizes:'192x192'}]}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{process.env.NEXT_PUBLIC_YZ_GAME_PLAYTEST==='1'?null:<FarmAccountBar/>}{children}{process.env.NEXT_PUBLIC_YZ_GAME_PLAYTEST==='1'?null:<FarmBottomNav/>}</body></html>}
