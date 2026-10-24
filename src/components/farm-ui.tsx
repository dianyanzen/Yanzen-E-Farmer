import type {ReactNode} from 'react';
import Link from 'next/link';
import FarmIcon from '@/components/farm-icon';

type IconName = 'home'|'wallet'|'sprout'|'harvest'|'chart'|'calculator'|'plus'|'arrow-right'|'eye'|'eye-off'|'log-out'|'check'|'folder'|'receipt';

export function FarmSectionHeading({title,action}:{title:string;action?:{href:string;label:string}}){
 return <div className="flex items-center justify-between gap-3"><h2 className="farm-section-title">{title}</h2>{action?<Link href={action.href} className="farm-section-action">{action.label}</Link>:null}</div>;
}

export function FarmFeatureCard({href,icon,title,description}:{href:string;icon:IconName;title:string;description:string}){
 return <Link href={href} className="farm-card farm-feature-card p-4 sm:p-5"><span className="farm-icon"><FarmIcon name={icon}/></span><strong className="mt-4 block">{title}</strong><span className="mt-1 block text-xs text-[#718177]">{description}</span></Link>;
}

export function FarmMetricCard({icon,label,children,hint}:{icon:IconName;label:string;children:ReactNode;hint?:string}){
 return <div className="farm-kpi"><span className="farm-icon farm-icon-sm"><FarmIcon name={icon} size={19}/></span><p className="farm-kpi-label mt-3">{label}</p><p className="farm-kpi-value">{children}</p>{hint?<p className="mt-1 text-xs text-[#718177]">{hint}</p>:null}</div>;
}

export function FarmProjectCard({href,name,crop,area,total}:{href:string;name:string;crop:string;area:number;total:string}){
 return <Link href={href} className="farm-card farm-project-card block p-5">
  <div className="flex items-start justify-between gap-3">
   <div className="min-w-0"><span className="farm-project-eyebrow">PROYEK PERTANIAN</span><h2 className="mt-2 break-words text-lg font-bold">{name}</h2><p className="mt-1 text-sm text-[#718177]">{crop} · {area.toLocaleString('id-ID')} tumbak</p></div>
   <span className="farm-project-arrow" aria-hidden="true"><FarmIcon name="arrow-right" size={19}/></span>
  </div>
  <div className="farm-project-divider mt-5 pt-4"><p className="text-xs font-semibold text-[#718177]">Total rencana anggaran</p><p className="farm-money mt-1 text-xl">{total}</p></div>
 </Link>;
}
