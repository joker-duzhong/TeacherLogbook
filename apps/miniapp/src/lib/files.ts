declare const wx: { env: { USER_DATA_PATH: string } };
export function chooseFile(extension:string):Promise<string>{return new Promise((resolve,reject)=>uni.chooseMessageFile({count:1,type:'file',extension:[extension],success:response=>{const file=response.tempFiles[0];if(file)resolve(file.path);else reject(new Error('未选择文件'));},fail:()=>reject(new Error('未选择文件'))}));}
export function shareText(content:unknown,name:string):Promise<void>{
  if(typeof content!=='string')return Promise.reject(new Error('文件内容无效'));
  const path=`${wx.env.USER_DATA_PATH}/${Date.now()}-${name}`;
  const manager=uni.getFileSystemManager();
  return new Promise((resolve,reject)=>manager.writeFile({filePath:path,data:content,encoding:'utf8',success:()=>uni.shareFileMessage({filePath:path,fileName:name,success:()=>resolve(),fail:()=>reject(new Error('文件分享未完成')),complete:()=>manager.unlink({filePath:path})}),fail:()=>reject(new Error('文件生成失败'))}));
}
