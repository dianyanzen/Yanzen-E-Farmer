import type { Metadata } from 'next';
import './globals.css';
import './tokens.css';
import './components.css';
import './farm-template.css';
import './brand-overrides.css';
import FarmAccountBar from '@/components/farm-account-bar';
import FarmBottomNav from '@/components/farm-bottom-nav';
export const metadata:Metadata={title:'Yanzen E-Farmer',description:'Manajemen lahan, anggaran, operasional, panen dan keuangan pertanian',applicationName:'Yanzen E-Farmer',manifest:'/manifest.webmanifest',icons:{icon:[{url:'/icon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/icon.svg',apple:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body><FarmAccountBar/>{children}<FarmBottomNav/></body></html>}
