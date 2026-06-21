import { describe, it, expect } from './runner.js';
import { formatDate, debounce, throttle } from '../src/utils/index.js';

describe('formatDate', () => {
  it('正常日期格式化为 YYYY-MM-DD', () => {
    const date = new Date('2026-06-20');
    expect(formatDate(date)).toBe('2026-06-20');
  });

  it('月份小于 10 时补零', () => {
    const date = new Date('2026-03-05');
    expect(formatDate(date)).toBe('2026-03-05');
  });

  it('日期小于 10 时补零', () => {
    const date = new Date('2026-11-01');
    expect(formatDate(date)).toBe('2026-11-01');
  });

  it('跨月日期：12 月 31 日', () => {
    const date = new Date('2026-12-31');
    expect(formatDate(date)).toBe('2026-12-31');
  });

  it('年初日期：1 月 1 日', () => {
    const date = new Date('2026-01-01');
    expect(formatDate(date)).toBe('2026-01-01');
  });

  it('接受字符串日期输入', () => {
    expect(formatDate('2026-06-20')).toBe('2026-06-20');
  });

  it('接受时间戳输入', () => {
    const ts = new Date('2026-06-20').getTime();
    expect(formatDate(ts)).toBe('2026-06-20');
  });
});

describe('debounce', () => {
  it('返回一个函数', () => {
    const fn = debounce(() => {}, 100);
    expect(typeof fn).toBe('function');
  });

  it('多次调用只执行最后一次', async () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 50);

    fn();
    fn();
    fn();

    expect(count).toBe(0);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(count).toBe(1);
  });

  it('等待时间内不会触发', async () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);

    fn();
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(count).toBe(0);

    await new Promise(resolve => setTimeout(resolve, 80));
    expect(count).toBe(1);
  });
});

describe('throttle', () => {
  it('返回一个函数', () => {
    const fn = throttle(() => {}, 100);
    expect(typeof fn).toBe('function');
  });

  it('第一次调用立即执行', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
  });

  it('限制时间内多次调用只执行一次', async () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);

    fn();
    fn();
    fn();
    expect(count).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 150));
    fn();
    expect(count).toBe(2);
  });
});
