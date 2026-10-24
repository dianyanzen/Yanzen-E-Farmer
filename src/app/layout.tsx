import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Yanzen E-Farmer',description:'Manajemen biaya dan panen pertanian'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}
