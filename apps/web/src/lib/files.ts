export function downloadText(content: unknown, filename: string, mime = 'application/json;charset=utf-8') {
  if (typeof content !== 'string') throw new Error('下载响应不是文件内容。');
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
