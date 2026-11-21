import { ApiError } from './api-error';
import tags from './demo-tags.json';
const now = '2026-10-02T12:00:00';
const project = { id:'demo', title:'雾岛来信', status:'ACTIVE', confirmed:true, current_chapter:3, created_at:now, updated_at:now,
 request:{audience_channel:'女频',genre:'悬疑',preferred_title:'雾岛来信',experiences:['悬疑探秘'],elements:['旧日谜团'],protagonist_tags:[],romance:null,idea:'一封迟到七年的信，揭开一座岛的秘密。',must_have:[],nice_to_have:[],exclude:[],chapter_target_chars:2200,daily_chapters:1,reserve_target:5,require_plan_confirmation:true},
 brief:{selected_title:'雾岛来信',title_candidates:['雾岛来信'],synopsis:'七年前，一座岛与一群人共同消失。如今，一封来自失踪者的信打破了林见微平静的生活。她必须在记忆与现实的裂缝中，找到被隐藏的真相。',target_readers:'喜欢悬疑与人物故事的读者',selling_points:['旧日谜团','失踪者来信'],protagonist:'林见微',protagonist_name:'林见微',protagonist_profile:'旧书店店主，谨慎而敏锐。',main_conflict:'追寻失踪的父亲与雾岛的真相',reader_contract:'循序揭开谜团',core_expectation:'悬疑与情感并行',world_rules:['雾岛从公开地图上消失'],total_chapters:100,volume_count:4,opening_three_chapters:['雨夜收到来信','地下室的灯亮起','一张地图出现'],update_plan:'每日一章',style_guide:['细节中埋设悬念']} };
const chapters = [
 ['雨夜来信','雨是在傍晚落下来的。\n\n林见微站在旧书店门口，看着街对面的灯一盏盏亮起。最后一班电车驶过，车窗里的人影像一段被匆忙擦去的旧梦。\n\n她正准备关门，一封信从门缝底下滑了进来。信封没有邮票，只有她的名字，字迹熟悉得让她的手指微微一顿。\n\n写信的人，七年前就已经失踪了。\n\n她拆开信。里面只有一句话：如果你还记得那座岛，明天日落之前，不要打开书店地下室的门。'],
 ['地下室的灯','第二天，林见微比平时早到了一个小时。\n\n书店里安静得能听见钟摆的声音。她把信放在柜台上，又一次确认那行字没有改变。\n\n地下室的门锁着，门缝里却透出一道细细的光。\n\n门后传来一声轻响，像有人翻过了一页书。'],
 ['消失的地图','地下室的灯在她碰到门把手之前熄灭了。\n\n林见微没有立刻进去。她想起父亲说过，面对一件不合理的事，先去寻找第二件。\n\n柜台上的信不见了，取而代之的是一张折叠整齐的地图。']
].map(([title,content],i)=>({id:`chapter-${i+1}`,number:i+1,title,content,summary:content.slice(0,60),status:'READY',version:1,created_at:now}));
const detail={project,chapters,latest_events:[],characters:[{id:'c1',name:'林见微',role:'主角',immutable_facts:['旧书店店主'],current_state:{目标:'寻找父亲失踪的真相',位置:'旧书店'}},{id:'c2',name:'林远山',role:'重要人物',immutable_facts:['林见微的父亲','七年前失踪'],current_state:{状态:'失踪'}}],world_facts:[{category:'地点',statement:'雾岛从公开地图上消失',locked:true}],timeline:[{chapter_number:1,event:'林见微收到父亲的信'},{chapter_number:2,event:'地下室的灯亮起'}],research_sources:[],semantic_document_count:0,reserve_count:3,chapter_failures:[]};
const summary={...project,audience_channel:'女频',genre:'悬疑',chapter_count:3,content_chars:chapters.reduce((n,c)=>n+c.content.length,0)};
let drafts: Record<number, any> = {};
const projects: Record<string, any> = { demo: detail };
let preferences: any = {daily_chapters:2,reserve_target:5,budget_limit:0,debug_mode:false};
let llmView: any = {provider:'deepseek',provider_label:'DeepSeek（示例）',base_url:'https://api.deepseek.com',model:'deepseek-chat',enabled:false,has_api_key:false,api_key_mask:null,verification_status:'unverified',last_tested_at:null,last_error_code:null,source:'offline',version:1,timeout_seconds:120,max_retries:2,card_status:'unconfigured',presets:[{provider:'deepseek',provider_label:'DeepSeek',base_url:'https://api.deepseek.com',model:'deepseek-chat'},{provider:'dashscope',provider_label:'通义千问',base_url:'https://dashscope.aliyuncs.com/compatible-mode/v1',model:'qwen-plus'},{provider:'openai',provider_label:'OpenAI',base_url:'https://api.openai.com/v1',model:'gpt-4o-mini'}]};
const runtime = {llm:{card_status:'unconfigured'},search:{configured:false},embedding:{configured:false},publisher:{configured:true},story_skills:{enabled:true},oh_story:{enabled:true}};
const filterOptions = {project_ids:['demo'],model_providers:['DeepSeek'],model_ids:['deepseek-chat'],categories:['writing','planning','review'],operations:['write','plan','review'],statuses:['success'],project_options:[{value:'demo',label:'雾岛来信'}],model_options:[{value:'deepseek-chat',label:'deepseek-chat'}]};
const today = new Date();
const dateAgo = (days:number) => {const d=new Date(today);d.setDate(d.getDate()-days);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const series = Array.from({length:70},(_,i)=>({date:dateAgo(69-i),user_word_delta:i%4===0?280+i*3:0,agent_word_delta:i%3===0?1200+i*7:0,import_word_delta:0}));
const modelSeries = series.filter((_,i)=>i%3===0).map((item,i)=>({date:item.date,key:'deepseek-chat',label:'deepseek-chat',calls:2+i%5,tokens_total:3000+i*180,avg_latency_ms:2100+i*20}));
const records = Array.from({length:12},(_,i)=>({id:`record-${i}`,created_at:`${dateAgo(i)}T10:30:00`,project_id:'demo',project_title:'雾岛来信',chapter_id:`chapter-${i%3+1}`,category:['writing','planning','review'][i%3],operation:['write','plan','review'][i%3],model_id:'deepseek-chat',model_provider:'DeepSeek',tokens_input:1200+i*30,tokens_output:600+i*15,tokens_total:1800+i*45,token_cache:0,latency_ms:2200+i*130,first_token_ms:null,status:'success',error_type:null,error_message:null,error_status_code:null,retry_count:0}));
const sessions: Record<string, any> = {};
const messages: Record<string, any[]> = {};
const changes: Record<string, any[]> = {};
let sequence = 0;
const stats={summary:{calls_total:86,success_total:86,tokens_total:168500,tokens_input_total:108000,tokens_output_total:60500,avg_latency_ms:2680,avg_first_token_ms:null},model_time_series:modelSeries,by_model:[{key:'deepseek-chat',label:'deepseek-chat',calls:86,tokens_total:168500}],by_project:[{key:'demo',label:'雾岛来信',calls:86,tokens_total:168500}],options:filterOptions};
export async function demoRequest(path:string, options:{method?:string;body?:unknown}={}):Promise<any> {
 const method=options.method || 'GET'; const url=path.split('?')[0]; const body=(options.body || {}) as any;
 const params = new URLSearchParams(path.split('?')[1] || '');
 if(url==='/api/tags') return tags;
 if(url==='/api/dashboard/writing') {const start=params.get('start_at')?.slice(0,10)||'';const end=params.get('end_at')?.slice(0,10)||'9999';const selected=series.filter(x=>x.date>=start && x.date<=end);return {summary:{active_days:selected.filter(x=>x.user_word_delta+x.agent_word_delta>0).length,creative_chapters:3},time_series:selected};}
 if(url==='/api/dashboard/llm-api/stats') return stats;
 if(url==='/api/dashboard/llm-api/records') {let items=records.filter(x=>['project_id','model_id','model_provider','category','status'].every(k=>!params.get(k)||String((x as any)[k])===params.get(k))).filter(x=>!params.get('search')||JSON.stringify(x).toLowerCase().includes(params.get('search')!.toLowerCase())).filter(x=>(!params.get('start_at')||x.created_at>=params.get('start_at')!)&&(!params.get('end_at')||x.created_at<=params.get('end_at')!));const key=params.get('sort_by')||'created_at', direction=params.get('sort_order')==='asc'?1:-1;items.sort((a,b)=>{const av=(a as any)[key],bv=(b as any)[key];return av===bv?0:av==null?1:bv==null?-1:av>bv?direction:-direction});const total=items.length;const page=Number(params.get('page')||1),size=Number(params.get('page_size')||20);items=items.slice((page-1)*size,page*size);return {options:filterOptions,records:{items,total,page,page_size:size}};}
 if(url==='/api/settings') {if(method==='PUT') preferences={...preferences,...body};return {preferences,runtime};}
 if(url==='/api/settings/llm/test') return {ok:false,code:'DEMO',message:'演示模式：未连接模型，未发送密钥。',latency_ms:0,tested_at:now};
 if(url==='/api/settings/llm') {if(method==='PUT') llmView={...llmView,provider:body.provider,base_url:body.base_url,model:body.model,enabled:false,has_api_key:false,api_key_mask:null,card_status:'unconfigured'};return llmView;}
 if(url==='/api/novels' && method==='POST') {const id='demo-new';const title=body.preferred_title||'未命名的故事';const p={...project,id,title,status:'DRAFT',confirmed:false,current_chapter:0,request:body,brief:{...project.brief,selected_title:title,synopsis:`示例创作方案：${body.idea||'从一个想法开始。'}`}};projects[id]={...detail,project:p,chapters:[],reserve_count:0};return p;}
 const projectMatch=url.match(/^\/api\/novels\/([^/]+)(?:\/(.*))?$/);const id=projectMatch?.[1];const suffix=projectMatch?.[2]||'';const data=id?projects[id]:null;
 if(data && !suffix && method==='GET') return data;
 if(data && suffix==='confirm') {data.project.confirmed=true;data.project.status='ACTIVE';return data.project;}
 if(data && (suffix==='pause'||suffix==='resume')) {data.project.status=suffix==='pause'?'PAUSED':'ACTIVE';return data.project;}
 if(data && suffix==='brief-versions') return {items:[{version:1,source:'initial',brief:data.project.brief,created_at:now}]};
 if(data && suffix==='brief' && method==='PUT') {data.project.brief=body;return data.project;}
 if(data && (suffix==='brief-regenerate'||suffix==='brief-restore')) return data.project;
 if(data && suffix==='runs') {const n=data.chapters.length+1;const c={...chapters[(n-1)%chapters.length],id:`chapter-${n}`,number:n,title:`第 ${n} 章 · 新的线索`};data.chapters.push(c);data.project.current_chapter=n;data.reserve_count=data.chapters.length;data.latest_events=[{node:'plan',message:'示例：章节规划完成',progress:25},{node:'write',message:'示例：正文生成完成',progress:55},{node:'review',message:'示例：审核通过',progress:85},{node:'commit',message:'示例：章节与记忆已入库',progress:100}];return {items:[{chapter:c,events:data.latest_events}]};}
 if(data && /^chapters\/\d+\/rework$/.test(suffix)) {const n=Number(suffix.split('/')[1]);const c=data.chapters[n-1];if(c){c.version++;c.summary='示例：已根据反馈重做章节。'}return {chapter:c};}
 if(data && suffix==='characters/rebuild') return {processed_chapters:data.chapters.length,character_count:data.characters.length,failures:[]};
 if(data && suffix==='metadata' && method==='PUT') {data.project.title=body.title;return {...summary,...data.project,genre:data.project.request.genre,audience_channel:data.project.request.audience_channel,chapter_count:data.chapters.length,content_chars:0};}
 if(data && !suffix && method==='DELETE') {delete projects[id!];return null;}
 if(url.endsWith('/opening-repair-snapshots/latest')) return {snapshot:null};
 const versionRestore=url.match(/^\/api\/novels\/([^/]+)\/chapters\/(\d+)\/versions\/\d+\/restore$/);
 if(versionRestore){const n=Number(versionRestore[2]),c=projects[versionRestore[1]].chapters[n-1];drafts[n]={chapter_id:c.id,project_id:versionRestore[1],base_version:c.version,title:c.title,content:c.content,source:'restore',applied_change_ids:[],content_hash:`demo-${n}`,created_at:now,updated_at:now};return drafts[n];}
 const rollback=url.match(/^\/api\/assistant\/sessions\/([^/]+)\/rollback$/);
 if(rollback){const session=sessions[rollback[1]],n=session.chapterNumber,c=projects[session.project_id].chapters[n-1];drafts[n]={chapter_id:c.id,project_id:session.project_id,base_version:c.version,title:c.title,content:c.content,source:'rollback',applied_change_ids:[],content_hash:`demo-${n}`,created_at:now,updated_at:now};return drafts[n];}
 const sessionMatch=url.match(/^\/api\/novels\/([^/]+)\/chapters\/(\d+)\/assistant\/sessions$/);
 if(sessionMatch && method==='POST') {const sid=`session-${++sequence}`;sessions[sid]={id:sid,project_id:sessionMatch[1],chapter_id:`chapter-${sessionMatch[2]}`,title:'示例会话',created_at:now,updated_at:now,chapterNumber:Number(sessionMatch[2])};messages[sid]=[];changes[sid]=[];return sessions[sid];}
 const decision=url.match(/^\/api\/assistant\/changes\/([^/]+)\/(approve|reject)$/);
 if(decision) {const entry=Object.values(changes).flat().find((c:any)=>c.id===decision[1]);if(!entry) throw new ApiError('建议不存在');entry.status=decision[2]==='approve'?'approved':'rejected';if(decision[2]==='reject') return entry;const session=sessions[entry.session_id], n=session.chapterNumber, ch=projects[session.project_id].chapters[n-1];drafts[n]={chapter_id:ch.id,project_id:session.project_id,base_version:ch.version,title:ch.title,content:entry.after_content,source:'assistant',applied_change_ids:[entry.id],content_hash:`demo-${n}`,created_at:now,updated_at:now};return {change_set:entry,draft:drafts[n]};}
 const chat=url.match(/^\/api\/assistant\/sessions\/([^/]+)\/(messages|changes)$/);
 if(chat){const sid=chat[1];if(method==='GET') return {items:chat[2]==='messages'?(messages[sid]||[]):(changes[sid]||[])};const user={id:`msg-${++sequence}`,session_id:sid,sequence,role:'user',mode:body.mode,content:body.content,created_at:now};const assistant={id:`msg-${++sequence}`,session_id:sid,sequence,role:'assistant',mode:body.mode,content:'【演示回复】可以通过环境细节和人物动作增强悬念，让读者跟随主角逐步发现线索。此回复为预设示例。',created_at:now};messages[sid]=[...(messages[sid]||[]),user,assistant];let change=null;if(body.mode==='editor'||body.quick_action){const session=sessions[sid],n=session.chapterNumber,ch=projects[session.project_id].chapters[n-1],before=drafts[n]?.content||ch.content;const after=before+'\n\n窗外的雨突然停了。她抬起头，看见玻璃上映出一个陌生人的影子。';change={id:`change-${++sequence}`,session_id:sid,message_id:assistant.id,chapter_id:ch.id,operation:'replace',base_version:ch.version,base_draft_hash:drafts[n]?.content_hash||'',before_title:ch.title,before_content:before,after_title:ch.title,after_content:after,diff_json:{sections:[{lines:[{type:'added',text:'窗外的雨突然停了。她抬起头，看见玻璃上映出一个陌生人的影子。'}]}]},explanation:'示例修改：增加一个视觉细节，为下一段制造悬念。',status:'proposed',created_at:now};changes[sid]=[...(changes[sid]||[]),change];}return {user_message:user,assistant_message:assistant,change_set:change};}

 if(url==='/api/health') return {mode:'offline',apis:{}};
 if(url==='/api/novels' && method==='GET') return {items:Object.values(projects).map((d:any)=>({...summary,...d.project,audience_channel:d.project.request.audience_channel,genre:d.project.request.genre,chapter_count:d.chapters.length,content_chars:d.chapters.reduce((n:number,c:any)=>n+(c.content||'').length,0)}))};
 if(url==='/api/novels/demo' && method==='GET') return detail;
 if(url.endsWith('/opening-repair-snapshots/latest')) return null;
 const match=url.match(/^\/api\/novels\/([^/]+)\/chapters\/(\d+)\/(workspace|edit-draft|revisions)$/);
 if(match){const number=Number(match[2]); const chapter=projects[match[1]]?.chapters[number-1]; if(!chapter) throw new ApiError('章节不存在');
  if(match[3]==='edit-draft' && method==='PUT'){const body=options.body as {title:string;content:string}; drafts[number]={chapter_id:chapter.id,project_id:'demo',base_version:1,title:body.title,content:body.content,source:'manual',applied_change_ids:[],content_hash:`demo-${number}`,created_at:now,updated_at:now};return drafts[number]}
  if(match[3]==='edit-draft' && method==='DELETE'){delete drafts[number];return null}
  if(match[3]==='revisions' && drafts[number]) {chapter.title=drafts[number].title;chapter.content=drafts[number].content;chapter.version++;delete drafts[number];return {chapter,reset_chapters:[],warnings:[]}}
  return {project:{id:match[1],title:projects[match[1]].project.title,status:projects[match[1]].project.status},chapter,draft:drafts[number]||null,editable:true,capabilities:{edit_draft:true,use_assistant:true,commit_revision:true,submit_for_review:false,replan:false,accept_with_warnings:false},read_only_reason:null,downstream:{count:0,first_number:null,last_number:null},versions:[{version:chapter.version,kind:'OFFICIAL',title:chapter.title,source:'demo',is_official:true,content:chapter.content,created_at:now}],sessions:[]};}
 throw new ApiError('作品集演示仅支持浏览与临时编辑，不连接后端或 AI。');
}
