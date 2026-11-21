import { ApiError } from './api-error';
import { demoRequest } from './demo';
export type RequestOptions = { method?:string; body?:unknown; signal?:AbortSignal; headers?:Record<string,string> };
export async function requestJson<T>(path:string, options:RequestOptions = {}):Promise<T> { return demoRequest(path,options) as Promise<T>; }
export function createCancellableGetter() {
 let controller:AbortController|null=null; let generation=0;
 return { abort(){controller?.abort();controller=null;generation++}, async run<T>(fn:(signal:AbortSignal)=>Promise<T>):Promise<T>{this.abort();controller=new AbortController();const id=generation;const result=await fn(controller.signal);if(id!==generation) throw new ApiError('请求已过期',{kind:'aborted'});return result} };
}
