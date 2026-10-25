import type {ReactNode} from 'react';
import Link from 'next/link';
import FarmIcon from '@/components/farm-icon';

type IconName = 'home'|'wallet'|'sprout'|'harvest'|'chart'|'calculator'|'plus'|'arrow-right'|'eye'|'eye-off'|'log-out'|'check'|'folder'|'receipt';

export function FarmSectionHeading({title,action}:{title:string;action?:{href:string;label:string}}){
 return <div className="farm-section-heading"><h2 className="farm-section-title">{title}</h2>{action?<Link href={action.href} className="farm-section-action">{action.label}</Link>:null}</div>;
}

export function FarmFeatureCard({href,icon,title,description}:{href:string;icon:IconName;title:string;description:string}){
 return <Link href={href} className="farm-card farm-feature-card"><span className="farm-icon"><FarmIcon name={icon}/></span><strong className="farm-feature-title">{title}</strong><span className="farm-feature-description">{description}</span></Link>;
}

export function FarmMetricCard({icon,label,children,hint}:{icon:IconName;label:string;children:ReactNode;hint?:string}){
 return <div className="farm-kpi"><span className="farm-icon farm-icon-sm"><FarmIcon name={icon} size={19}/></span><p className="farm-kpi-label farm-metric-label">{label}</p><p className="farm-kpi-value">{children}</p>{hint?<p className="farm-feature-description">{hint}</p>:null}</div>;
}

export function FarmProjectCard({href,name,crop,area,total}:{href:string;name:string;crop:string;area:number;total:string}){
 return <Link href={href} className="farm-card farm-project-card">
  <div className="farm-project-heading">
   <div className="farm-project-name"><span className="farm-project-eyebrow">PROYEK PERTANIAN</span><h2 className="farm-project-title">{name}</h2><p className="farm-feature-description">{crop} · {area.toLocaleString('id-ID')} tumbak</p></div>
   <span className="farm-project-arrow" aria-hidden="true"><FarmIcon name="arrow-right" size={19}/></span>
  </div>
  <div className="farm-project-divider"><p className="farm-feature-description">Total rencana anggaran</p><p className="farm-money farm-project-total">{total}</p></div>
 </Link>;
}
