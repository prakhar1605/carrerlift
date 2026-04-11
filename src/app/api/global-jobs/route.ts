import { NextRequest, NextResponse } from 'next/server';
import { GITHUB_URLS } from '@/lib/config';

function stripAll(s:string){return(s||'').replace(/<[^>]+>/g,'').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/🔒|🔥/g,'').trim();}
function extractHref(cell:string){const h=cell.match(/href="([^"]+)"/);if(h)return h[1];const m=cell.match(/\]\(([^)]+)\)/);return m?m[1]:'';}
function parseAge(age:string):number{const now=Date.now();if(!age)return now-30*86400000;const m=age.match(/^(\d+)(h|d|w|mo)$/i);if(!m)return now-7*86400000;const n=+m[1],u=m[2].toLowerCase(),ms=u==='h'?n*3600000:u==='d'?n*86400000:u==='w'?n*7*86400000:n*30*86400000;return now-ms;}

function parseTable(markdown:string,type:string){
  const lines=markdown.split('\n');const jobs:any[]=[];let hi=-1;
  for(let i=0;i<lines.length;i++){const l=lines[i].toLowerCase();if(lines[i].startsWith('|')&&l.includes('company')&&l.includes('position')){hi=i;break;}}
  if(hi===-1)return jobs;
  for(let i=hi+2;i<lines.length;i++){
    const line=lines[i].trim();if(!line.startsWith('|'))continue;
    const c=line.split('|').slice(1);if(c.length<3)continue;
    const company=stripAll(c[0]).trim(),role=stripAll(c[1]).trim(),location=stripAll(c[2]).trim(),salary=stripAll(c[3]).trim();
    if(!company||company.startsWith(':---'))continue;if((c[1]||'').includes('🔒'))continue;
    const applyLink=extractHref(c[4]||'')||extractHref(c[1]||'')||extractHref(c[0]||'');
    const salaryClean=(c[3]||'').includes('href')?'':salary;
    const ageRaw=stripAll(c[5]||c[4]||'').trim();
    jobs.push({company,role,location,salary:salaryClean,applyLink,jobType:type,source:'speedyapply',postedAt:parseAge(ageRaw)});
  }
  return jobs;
}

export async function GET(req:NextRequest){
  const type=req.nextUrl.searchParams.get('type')||'all';
  const toFetch=type==='all'?Object.entries(GITHUB_URLS):Object.entries(GITHUB_URLS).filter(([k])=>k===type);
  try{
    const results=await Promise.allSettled(toFetch.map(async([key,url])=>{
      const r=await fetch(url,{headers:{'User-Agent':'CarrerLift/2.0'},next:{revalidate:3600}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      return parseTable(await r.text(),key);
    }));
    let all:any[]=[];
    results.forEach(r=>{if(r.status==='fulfilled')all=all.concat(r.value);});
    const seen=new Set<string>();
    const unique=all.filter(j=>{const k=`${j.company}||${j.role}`;if(seen.has(k))return false;seen.add(k);return true;});
    return NextResponse.json({success:true,count:unique.length,jobs:unique},{headers:{'Cache-Control':'s-maxage=3600,stale-while-revalidate=7200'}});
  }catch(e:any){return NextResponse.json({error:e.message},{status:500});}
}
