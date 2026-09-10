import { describe, expect, it } from 'vitest';
import { pages, modules, groups, validateRecord, moduleFor, csvText } from './catalog';
import { themes, themeVariables } from './themes';

describe('full migration catalogue', () => {
  it('covers seven groups and every data module', () => {
    expect(groups).toHaveLength(7);
    expect(new Set(pages.map(page => page.id)).size).toBe(pages.length);
    expect(modules).toHaveLength(19);
    for (const module of modules) expect(pages.some(page => page.resource === module.resource)).toBe(true);
  });
  it('validates amounts, URLs and course time order', () => {
    expect(validateRecord(moduleFor('finance-records'), { type: '收入', amount: '1.001', note: '记录', date: '2026-09-09' })).toHaveProperty('amount');
    expect(validateRecord(moduleFor('links'), { title: '网址', url: 'javascript:alert(1)' })).toHaveProperty('url');
    expect(validateRecord(moduleFor('courses'), { course: '语文', teacher: '教师', day: '周一', startTime: '10:00', endTime: '09:00' })).toHaveProperty('endTime');
  });
  it('quotes CSV and prevents spreadsheet formula execution', () => {
    expect(csvText(['姓名'], [['=1+1'], ['含"引号']])).toContain('"\'=1+1"');
    expect(csvText(['姓名'], [['含"引号']])).toContain('"含""引号"');
  });
  it('provides all original skins with distinct variables', () => {
    expect(themes.map(theme => theme.id).sort()).toEqual(['apple', 'mint', 'mr', 'ngrok']);
    expect(new Set(themes.map(theme => themeVariables(theme.id)['--brand'])).size).toBe(4);
  });
});
