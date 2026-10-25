import type { Metadata } from 'next';
import './globals.css';
import './tokens.css';
import './components.css';
import './farm-template.css';
import FarmBottomNav from '@/components/farm-bottom-nav';
export const metadata:Metadata={title:'Yanzen E-Farmer',description:'Manajemen biaya dan panen pertanian'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}<FarmBottomNav/></body></html>}
