export interface Theme { id: string; name: string; paper: string; panel: string; ink: string; muted: string; line: string; brand: string; sidebar: string; sidebarInk: string; radius: string; accent: string }
export const themes: Theme[] = [
  { id: 'mr', name: 'MR 工作室', paper: '#f7f5ee', panel: '#fffefa', ink: '#171717', muted: '#68665e', line: '#171717', brand: '#c73820', sidebar: '#171717', sidebarInk: '#f5f5f5', radius: '0px', accent: '#dfff00' },
  { id: 'mint', name: '浅薄荷绿', paper: '#f3f1eb', panel: '#ffffff', ink: '#222222', muted: '#666666', line: '#cdd2cb', brand: '#357266', sidebar: '#edf3ed', sidebarInk: '#263a32', radius: '6px', accent: '#eeffed' },
  { id: 'ngrok', name: 'ngrok', paper: '#f8f7f3', panel: '#ffffff', ink: '#211b3f', muted: '#686379', line: '#d7d2df', brand: '#9d245a', sidebar: '#211b3f', sidebarInk: '#f8f7f3', radius: '4px', accent: '#fbd9e7' },
  { id: 'apple', name: 'Apple', paper: '#f5f5f7', panel: '#ffffff', ink: '#1d1d1f', muted: '#6e6e73', line: '#d2d2d7', brand: '#0071e3', sidebar: '#fbfbfd', sidebarInk: '#1d1d1f', radius: '8px', accent: '#e8f3ff' },
];
export function registerTheme(theme: Theme) {
  if (!/^[A-Za-z0-9_-]{1,50}$/.test(theme.id) || themes.some(item => item.id === theme.id)) throw new Error('皮肤标识无效或重复');
  for (const value of [theme.paper, theme.panel, theme.ink, theme.muted, theme.line, theme.brand, theme.sidebar, theme.sidebarInk, theme.accent]) if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error('皮肤颜色无效');
  if (!/^\d+(\.\d+)?px$/.test(theme.radius)) throw new Error('皮肤圆角无效');
  themes.push(theme);
}
export function themeVariables(id: string): Record<string, string> {
  const theme = themes.find(item => item.id === id) ?? themes[0]!;
  return { '--paper': theme.paper, '--panel': theme.panel, '--ink': theme.ink, '--muted': theme.muted, '--line': theme.line, '--brand': theme.brand, '--sidebar': theme.sidebar, '--sidebar-ink': theme.sidebarInk, '--radius': theme.radius, '--accent': theme.accent, '--el-color-primary': theme.brand, '--el-bg-color': theme.panel, '--el-text-color-primary': theme.ink, '--el-border-radius-base': theme.radius };
}
