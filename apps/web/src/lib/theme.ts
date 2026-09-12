import { themes } from '@teacher-logbook/shared';

export function webThemeVariables(id: string): Record<string, string> {
  const theme = themes.find(item=>item.id===id) ?? themes.find(item=>item.id==='mint')!;
  const primary = theme.id==='mr' ? '#53675c' : theme.brand;
  const sidebar = theme.id==='mr' ? '#edf0eb' : theme.id==='ngrok' ? '#eeeaf4' : theme.sidebar;
  const soft = theme.id==='mr' ? '#e5ece5' : theme.accent;
  return {
    '--background': theme.paper, '--foreground': theme.ink, '--card': theme.panel, '--card-foreground': theme.ink,
    '--popover': theme.panel, '--popover-foreground': theme.ink, '--primary':primary, '--primary-foreground':'#ffffff',
    '--secondary':soft, '--secondary-foreground':theme.ink, '--muted':'#f0f1ed', '--muted-foreground':theme.muted,
    '--accent':soft, '--accent-foreground':theme.ink, '--border':theme.id==='mr'?'#d9ddd7':theme.line,
    '--input':theme.id==='mr'?'#d9ddd7':theme.line, '--ring':primary, '--sidebar':sidebar, '--sidebar-foreground':theme.ink,
  };
}
