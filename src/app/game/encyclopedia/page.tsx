import type {Metadata} from 'next';
import EncyclopediaClient from './encyclopedia-client';
import './encyclopedia.css';
export const metadata:Metadata={
 title:'Ensiklopedia Warga | YZ Farm Life',
 description:'Katalog 248 karakter fiksi YZ Farm Life dengan potret, profesi, 12 kategori Character Bible dan rancangan ceritanya.'
};
export default function Page(){return <EncyclopediaClient/>;}
