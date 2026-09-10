import { describe, expect, it } from 'vitest';
import { summarizeRecords } from './summary';

describe('shared business summaries', () => {
  it('sums finance in cents without floating point artifacts', () => {
    expect(summarizeRecords('finance-records', [
      { type: '收入', amount: '0.10' }, { type: '收入', amount: '0.20' }, { type: '支出', amount: '0.15' },
    ])).toEqual([['收入', '0.30'], ['支出', '0.15'], ['结余', '0.15']]);
  });
  it('counts homework omissions as instances and distinguishes subjects', () => {
    expect(summarizeRecords('homework-records', [{ subject: '数学', unsubmitted: 3 }, { subject: '数学', unsubmitted: 2 }]))
      .toEqual([['作业记录', 2], ['未交人次', 5], ['学科数', 1]]);
  });
  it('does not count missing student identifiers', () => {
    expect(summarizeRecords('violations', [{ studentId: 'one' }, { studentId: 'one' }, { studentId: null }]))
      .toEqual([['记录数', 3], ['涉及学生', 1]]);
  });
});
