class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

const eventBus = new EventBus();

class State {
  constructor(initialState = {}) {
    this.state = { ...initialState };
  }

  get(key) {
    return key ? this.state[key] : { ...this.state };
  }

  set(key, value) {
    const oldValue = this.state[key];
    if (oldValue === value) return;
    this.state[key] = value;
    eventBus.emit(`state:${key}`, { oldValue, newValue: value });
    eventBus.emit('state:change', { key, oldValue, newValue: value });
  }

  replace(newState) {
    const oldState = { ...this.state };
    this.state = { ...newState };
    Object.keys(newState).forEach(key => {
      if (oldState[key] !== newState[key]) {
        eventBus.emit(`state:${key}`, { oldValue: oldState[key], newValue: newState[key] });
      }
    });
    eventBus.emit('state:change', { state: this.state });
  }
}

const store = new State({
  images: [],
  filterTag: '全部',
  sortBy: 'newest',
});

export function useStore() {
  return store;
}

export function useBus() {
  return eventBus;
}

export function getFilteredImages() {
  const images = store.get('images') || [];
  const filterTag = store.get('filterTag');
  const sortBy = store.get('sortBy');

  let result = [...images];

  if (filterTag !== '全部') {
    result = result.filter(img => img.tags.includes(filterTag));
  }

  if (sortBy === 'newest') {
    result.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  } else if (sortBy === 'random') {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
  }

  return result;
}

export function getStats() {
  const images = store.get('images') || [];
  const tagsSet = new Set();
  images.forEach(img => {
    img.tags.forEach(tag => tagsSet.add(tag));
  });

  return {
    totalImages: images.length,
    totalTags: tagsSet.size,
  };
}
