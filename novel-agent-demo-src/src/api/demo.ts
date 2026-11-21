import { ApiError } from './api-error';
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
export async function demoRequest(path:string, options:{method?:string;body?:unknown}={}):Promise<any> {
 const method=options.method || 'GET'; const url=path.split('?')[0];
 if(url==='/api/health') return {mode:'offline',apis:{}};
 if(url==='/api/novels' && method==='GET') return {items:[summary]};
 if(url==='/api/novels/demo' && method==='GET') return detail;
 if(url.endsWith('/opening-repair-snapshots/latest')) return null;
 const match=url.match(/^\/api\/novels\/demo\/chapters\/(\d+)\/(workspace|edit-draft)$/);
 if(match){const number=Number(match[1]); const chapter=chapters[number-1]; if(!chapter) throw new ApiError('章节不存在');
  if(match[2]==='edit-draft' && method==='PUT'){const body=options.body as {title:string;content:string}; drafts[number]={chapter_id:chapter.id,project_id:'demo',base_version:1,title:body.title,content:body.content,source:'manual',applied_change_ids:[],content_hash:`demo-${number}`,created_at:now,updated_at:now};return drafts[number]}
  if(match[2]==='edit-draft' && method==='DELETE'){delete drafts[number];return null}
  return {project:{id:'demo',title:project.title,status:project.status},chapter,draft:drafts[number]||null,editable:true,capabilities:{edit_draft:true,use_assistant:false,commit_revision:false,submit_for_review:false,replan:false,accept_with_warnings:false},read_only_reason:null,downstream:{count:0,first_number:null,last_number:null},versions:[],sessions:[]};}
 throw new ApiError('作品集演示仅支持浏览与临时编辑，不连接后端或 AI。');
}
