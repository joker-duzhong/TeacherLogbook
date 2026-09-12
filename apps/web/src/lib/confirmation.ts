import { ref } from 'vue';

interface Options { inputValue?: string; inputValidator?: (value: string) => string | true; type?: string; confirmButtonText?: string; cancelButtonText?: string }
export const confirmationState = ref<{ message: string; title: string; input: boolean; options: Options }>();
let pending: { resolve: (result: { value: string }) => void; reject: (reason: string) => void } | undefined;
function close() { confirmationState.value=undefined;pending?.reject('cancel');pending=undefined; }
function ask(message: string, title: string, input: boolean, options: Options = {}) {
  close();
  return new Promise<{value:string}>((resolve,reject)=>{pending={resolve,reject};confirmationState.value={message,title,input,options};});
}
export function acceptConfirmation(value: string) { const current=pending;pending=undefined;confirmationState.value=undefined;current?.resolve({value}); }
export const confirmation = { close, confirm: (message:string,title:string,options?:Options)=>ask(message,title,false,options), prompt: (message:string,title:string,options?:Options)=>ask(message,title,true,options) };
