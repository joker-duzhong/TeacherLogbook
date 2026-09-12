import { expect, test } from '@playwright/test';
import { fixture, navigate } from './fixtures/workspace';

test('mobile records: readable cards, discard protection, editing and deletion', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await fixture(page);
  await navigate(page, 'students');
  await expect(page.locator('.business-table')).toHaveCount(0);
  await expect(page.locator('.record-card')).toContainText('家长联系方式');
  await page.locator('.record-card').getByRole('button', { name: '编辑', exact: true }).click();
  const input = page.locator('#field-name');
  await input.fill('陈晓雨');
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.locator('.confirmation-dialog')).toContainText('尚未保存');
  await page.getByRole('button', { name: '继续编辑', exact: true }).click();
  await expect(input).toHaveValue('陈晓雨');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.locator('.record-card h2')).toHaveText('陈晓雨');
  await page.screenshot({ path: info.outputPath('mobile-students.png'), fullPage: true });
  await page.getByRole('button', { name: '陈晓雨的更多操作' }).click();
  await page.getByRole('menuitem', { name: '删除记录' }).click();
  await page.locator('.confirmation-dialog').getByRole('button', { name: '取消', exact: true }).click();
  expect(state.rows.students).toHaveLength(1);
  await page.getByRole('button', { name: '陈晓雨的更多操作' }).click();
  await page.getByRole('menuitem', { name: '删除记录' }).click();
  await page.locator('.confirmation-dialog').getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('heading', { name: '暂无记录' })).toBeVisible();
  expect(state.rows.students).toHaveLength(0);
  expect(state.errors).toEqual([]);
});

test('mobile filters: date errors stay in sheet, apply and reset recover results', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const state = await fixture(page);
  await navigate(page, 'leave');
  await page.getByRole('button', { name: '筛选', exact: true }).click();
  const sheet = page.getByRole('dialog', { name: '筛选记录' });
  await sheet.getByLabel('开始日期').fill('2026-09-10');
  await sheet.getByLabel('结束日期').fill('2026-09-01');
  await sheet.getByRole('button', { name: '查看结果' }).click();
  await expect(sheet.getByRole('alert')).toContainText('开始日期不能晚于结束日期');
  await sheet.getByLabel('结束日期').fill('2026-09-20');
  await page.screenshot({ path: info.outputPath('mobile-filter.png') });
  await sheet.getByRole('button', { name: '查看结果' }).click();
  await expect(sheet).not.toBeVisible();
  await expect(page.getByRole('heading', { name: '没有符合条件的记录' })).toBeVisible();
  await page.getByRole('button', { name: '重置筛选', exact: true }).click();
  await expect(page.locator('.record-card')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(state.errors).toEqual([]);
});

test('navigation search and keyboard focus stay within the mobile drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fixture(page);
  const trigger = page.getByRole('button', { name: '展开导航', exact: true });
  await trigger.click();
  const close = page.getByRole('button', { name: '收起导航' });
  await expect(close).toBeFocused();
  await page.getByLabel('查找功能').fill('排座位');
  await expect(page.locator('.business-nav nav a:visible')).toHaveCount(1);
  await page.locator('.business-nav nav a:visible').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.workspace-brand')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.locator('.nav-backdrop')).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.position)).not.toBe('fixed');
});

test('unsaved records protect browser back and validation focuses the invalid field', async ({ page }) => {
  const state = await fixture(page);
  await navigate(page, 'students');
  await page.getByRole('button', { name: '新增', exact: true }).click();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.locator('#field-name')).toBeFocused();
  await page.locator('#field-name').fill('未保存学生');
  await page.evaluate(() => history.back());
  await expect(page.locator('.confirmation-dialog')).toBeVisible();
  await page.getByRole('button', { name: '继续编辑' }).click();
  await expect(page).toHaveURL(/\/workspace\/students$/);
  await expect(page.locator('#field-name')).toHaveValue('未保存学生');
  await page.evaluate(() => history.back());
  await page.getByRole('button', { name: '放弃修改', exact: true }).click();
  await expect(page).toHaveURL(/\/workspace\/dashboard$/);
  expect(state.writes).toHaveLength(0);
  expect(state.errors).toEqual([]);
});

test('import preview is invalidated when file or duplicate handling changes', async ({ page }) => {
  const state = await fixture(page);
  await navigate(page, 'data');
  const file = { name: 'students.csv', mimeType: 'text/csv', buffer: Buffer.from('name,gender,contact\r\n学生,男,\r\n', 'utf8') };
  const submit = page.getByRole('button', { name: '导入学生', exact: true });
  await page.locator('input[type=file]').first().setInputFiles(file);
  await expect(submit).toBeDisabled();
  await page.getByRole('button', { name: '预检查', exact: true }).click();
  await expect(submit).toBeEnabled();
  await page.getByRole('combobox', { name: '重复学生处理' }).click();
  await page.getByRole('option').filter({ hasText: '仍然创建' }).click();
  await expect(submit).toBeDisabled();
  await page.getByRole('button', { name: '预检查', exact: true }).click();
  await expect(submit).toBeEnabled();
  await page.locator('input[type=file]').first().setInputFiles({ ...file, name: 'other.csv' });
  await expect(submit).toBeDisabled();
  expect(state.errors).toEqual([]);
});

test('visual review covers primary screens on desktop and phone with long content', async ({ page }, info) => {
  const state = await fixture(page);
  state.rows.students = ['陈晓雨', '林子涵', '张思源', '王梓宁', '赵亦安', '欧阳明轩'].map((name, index) => ({ ...state.rows.students[0], id: 'visual-'+index, name, contact: index ? '妈妈 13800138000' : '家长联系方式尚未补充', gender: index % 2 ? '女' : '男' }));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    for (const id of ['dashboard','students','seats','classes','data','settings']) {
      await navigate(page, id);
      await page.screenshot({ path: info.outputPath(id+'-'+width+'.png'), fullPage: true, animations: 'disabled' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), id+' '+width).toBe(true);
    }
  }
  expect(state.errors).toEqual([]);
});
