export function summarizeRecords(resource:string,rows:ReadonlyArray<Record<string,string|number|null>>):Array<[string,string|number]> {
  const count=(key:string,value:string)=>rows.filter(row=>row[key]===value).length;
  const sum=(key:string,type?:string)=>rows.filter(row=>!type||row.type===type).reduce((total,row)=>total+Math.round(Number(row[key]??0)*100),0)/100;
  if(resource==='finance-records')return [['收入',sum('amount','收入').toFixed(2)],['支出',sum('amount','支出').toFixed(2)],['结余',(sum('amount','收入')-sum('amount','支出')).toFixed(2)]];
  if(resource==='homework-records')return [['作业记录',rows.length],['未交人次',sum('unsubmitted')],['学科数',new Set(rows.map(row=>row.subject)).size]];
  if(resource==='alerts')return [['待处理',count('status','待处理')],['跟进中',count('status','跟进中')],['已关闭',count('status','已关闭')]];
  if(resource==='training-records')return [['总学时',sum('hours').toFixed(2)],['培训',count('category','培训')],['讲座及活动',count('category','讲座')+count('category','活动')]];
  if(resource==='exams')return [['科目记录',rows.length],['科目数',new Set(rows.map(row=>row.subject)).size],['考试数',new Set(rows.map(row=>row.name)).size]];
  return [['记录数',rows.length],['涉及学生',new Set(rows.map(row=>row.studentId).filter(Boolean)).size]];
}
