import { describe, it, expect } from './runner.js';
import { useStore, useBus, getFilteredImages, getStats, cloneImages } from '../src/utils/state.js';

const store = useStore();
const bus = useBus();

const testImages = [
  { id: 1, title: 'Mountain Sunset', tags: ['风景'], uploadDate: '2026-06-20', thumbnail: '', url: '' },
  { id: 2, title: 'Cute Cat', tags: ['动物'], uploadDate: '2026-06-18', thumbnail: '', url: '' },
  { id: 3, title: 'City Skyline', tags: ['建筑', '风景'], uploadDate: '2026-06-22', thumbnail: '', url: '' },
  { id: 4, title: 'Dog Playing', tags: ['动物'], uploadDate: '2026-06-15', thumbnail: '', url: '' },
  { id: 5, title: 'mountain peak', tags: ['风景'], uploadDate: '2026-06-10', thumbnail: '', url: '' },
];

function setupTestState() {
  store.set('images', testImages);
  store.set('filterTag', '全部');
  store.set('sortBy', 'newest');
  store.set('searchKeyword', '');
}

describe('getFilteredImages', () => {
  setupTestState();

  describe('标签筛选', () => {
    it('全部: 返回所有图片', () => {
      store.set('filterTag', '全部');
      const result = getFilteredImages();
      expect(result.length).toBe(5);
    });

    it('风景: 只返回带风景标签的图片', () => {
      store.set('filterTag', '风景');
      const result = getFilteredImages();
      expect(result.length).toBe(3);
      result.forEach(img => {
        expect(img.tags).toContain('风景');
      });
    });

    it('动物: 只返回带动物标签的图片', () => {
      store.set('filterTag', '动物');
      const result = getFilteredImages();
      expect(result.length).toBe(2);
      result.forEach(img => {
        expect(img.tags).toContain('动物');
      });
    });

    it('建筑: 只返回带建筑标签的图片', () => {
      store.set('filterTag', '建筑');
      const result = getFilteredImages();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('City Skyline');
    });
  });

  describe('排序', () => {
    setupTestState();

    it('newest: 按 uploadDate 降序排列', () => {
      store.set('sortBy', 'newest');
      store.set('filterTag', '全部');
      const result = getFilteredImages();
      expect(result.length).toBe(5);

      for (let i = 0; i < result.length - 1; i++) {
        const curr = new Date(result[i].uploadDate);
        const next = new Date(result[i + 1].uploadDate);
        expect(curr >= next).toBeTruthy();
      }

      expect(result[0].title).toBe('City Skyline');
      expect(result[result.length - 1].title).toBe('mountain peak');
    });

    it('random: 每次顺序可能不同（多次调用结果不完全相同）', () => {
      store.set('sortBy', 'random');
      store.set('filterTag', '全部');
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(getFilteredImages().map(img => img.id).join(','));
      }
      const unique = [...new Set(results)];
      expect(unique.length).toBeGreaterThan(1);
    });

    it('切换排序后再切回 newest，顺序能正确恢复', () => {
      store.set('sortBy', 'random');
      getFilteredImages();
      getFilteredImages();

      store.set('sortBy', 'newest');
      const result = getFilteredImages();

      expect(result[0].title).toBe('City Skyline');
      expect(result[1].title).toBe('Mountain Sunset');
      expect(result[result.length - 1].title).toBe('mountain peak');
    });
  });

  describe('搜索关键词', () => {
    setupTestState();

    it('空关键词: 返回全部图片', () => {
      store.set('searchKeyword', '');
      const result = getFilteredImages();
      expect(result.length).toBe(5);
    });

    it('mountain: 匹配标题包含 mountain 的图片（大小写不敏感）', () => {
      store.set('searchKeyword', 'mountain');
      const result = getFilteredImages();
      expect(result.length).toBe(2);
      const titles = result.map(img => img.title);
      expect(titles).toContain('Mountain Sunset');
      expect(titles).toContain('mountain peak');
    });

    it('Mountain 大写: 同样匹配不区分大小写', () => {
      store.set('searchKeyword', 'Mountain');
      const result = getFilteredImages();
      expect(result.length).toBe(2);
    });

    it('Cat: 只匹配一张', () => {
      store.set('searchKeyword', 'Cat');
      const result = getFilteredImages();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Cute Cat');
    });

    it('不存在的关键词: 返回空数组', () => {
      store.set('searchKeyword', 'nothing matches this');
      const result = getFilteredImages();
      expect(result.length).toBe(0);
    });
  });

  describe('筛选组合', () => {
    setupTestState();

    it('标签 + 搜索: 风景标签 + mountain 关键词', () => {
      store.set('filterTag', '风景');
      store.set('searchKeyword', 'mountain');
      store.set('sortBy', 'newest');
      const result = getFilteredImages();
      expect(result.length).toBe(2);
      result.forEach(img => {
        expect(img.tags).toContain('风景');
        expect(img.title.toLowerCase().includes('mountain')).toBeTruthy();
      });
    });
  });
});

describe('getStats', () => {
  setupTestState();

  it('totalImages: 返回图片总数', () => {
    const stats = getStats();
    expect(stats.totalImages).toBe(5);
  });

  it('totalTags: 返回所有图片标签出现的总次数', () => {
    const stats = getStats();
    expect(stats.totalTags).toBe(6);
  });

  it('空数据时统计正确', () => {
    store.set('images', []);
    const stats = getStats();
    expect(stats.totalImages).toBe(0);
    expect(stats.totalTags).toBe(0);
    setupTestState();
  });
});

describe('cloneImages', () => {
  it('深拷贝后修改副本不影响原数据', () => {
    const original = [
      { id: 1, title: 'Test', tags: ['a', 'b'], uploadDate: '2026-01-01' },
    ];
    const cloned = cloneImages(original);

    cloned[0].title = 'Modified';
    cloned[0].tags.push('c');

    expect(original[0].title).toBe('Test');
    expect(original[0].tags.length).toBe(2);
    expect(original[0].tags).not.toContain('c');

    expect(cloned[0].title).toBe('Modified');
    expect(cloned[0].tags.length).toBe(3);
  });

  it('拷贝后结构一致', () => {
    const original = [
      { id: 1, title: 'A', tags: ['风景'], uploadDate: '2026-01-01', thumbnail: '', url: '' },
      { id: 2, title: 'B', tags: ['动物', '人物'], uploadDate: '2026-02-01', thumbnail: '', url: '' },
    ];
    const cloned = cloneImages(original);
    expect(cloned.length).toBe(2);
    expect(cloned[0].id).toBe(1);
    expect(cloned[1].tags).toEqual(['动物', '人物']);
  });

  it('空数组返回空数组', () => {
    const result = cloneImages([]);
    expect(result).toEqual([]);
  });
});

describe('EventBus', () => {
  it('on + emit: 注册监听器后 emit 能触发回调', () => {
    let called = false;
    let receivedData = null;

    bus.on('test-event', (data) => {
      called = true;
      receivedData = data;
    });

    bus.emit('test-event', { foo: 'bar' });

    expect(called).toBeTruthy();
    expect(receivedData).toEqual({ foo: 'bar' });
  });

  it('off: 移除后 emit 不再触发', () => {
    let count = 0;
    const handler = () => { count++; };

    bus.on('count-event', handler);
    bus.emit('count-event');
    expect(count).toBe(1);

    bus.off('count-event', handler);
    bus.emit('count-event');
    expect(count).toBe(1);
  });

  it('多个监听器都能触发', () => {
    let a = 0;
    let b = 0;
    bus.on('multi-event', () => { a++; });
    bus.on('multi-event', () => { b++; });
    bus.emit('multi-event');
    expect(a).toBe(1);
    expect(b).toBe(1);
  });

  it('emit 未注册的事件不会报错', () => {
    expect(() => bus.emit('nonexistent-event', {})).not.toThrow();
  });

  it('off 未注册的事件不会报错', () => {
    expect(() => bus.off('nonexistent-event', () => {})).not.toThrow();
  });
});
