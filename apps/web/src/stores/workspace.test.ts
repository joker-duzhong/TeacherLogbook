import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
const api = vi.hoisted(() => ({ allRecords: vi.fn(), listClasses: vi.fn(), getSkin: vi.fn() }));
vi.mock('./auth', () => ({ useAuthStore: () => ({ api }) }));
import { useWorkspaceStore } from './workspace';

beforeEach(() => { setActivePinia(createPinia()); vi.resetAllMocks(); });
describe('workspace request lifecycle', () => {
  it('ignores class references completing after logout', async () => {
    let finish: (value: unknown[]) => void = () => {};
    api.allRecords.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce([]);
    const workspace = useWorkspaceStore();
    const pending = workspace.selectClass('class-one');
    workspace.reset();
    finish([{ id: 'student-one', name: '学生' }]);
    await pending;
    expect(workspace.students).toEqual([]);
    expect(workspace.classId).toBe('');
  });
  it('does not overwrite a newer class selection', async () => {
    let finish: (value: unknown[]) => void = () => {};
    api.allRecords.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'student-two', name: '二班学生' }]).mockResolvedValueOnce([]);
    const workspace = useWorkspaceStore();
    const first = workspace.selectClass('class-one');
    await workspace.selectClass('class-two');
    finish([{ id: 'student-one', name: '一班学生' }]);
    await first;
    expect(workspace.students[0]?.id).toBe('student-two');
  });
  it('discards class lists completing after reset', async () => {
    let finish: (value: unknown[]) => void = () => {};
    api.listClasses.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const workspace = useWorkspaceStore();
    const pending = workspace.load();
    workspace.reset();
    finish([{ id: 'class-one', name: '一班' }]);
    await pending;
    expect(workspace.classes).toEqual([]);
    expect(workspace.busy).toBe(false);
    expect(api.getSkin).not.toHaveBeenCalled();
  });
});
