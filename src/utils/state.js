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
  searchKeyword: '',
});

export function useStore() {
  return store;
}

export function useBus() {
  return eventBus;
}

function cloneImages(arr) {
  return arr.map(img => ({ ...img, tags: [...img.tags] }));
}

export function getFilteredImages() {
  const images = store.get('images') || [];
  const filterTag = store.get('filterTag');
  const sortBy = store.get('sortBy');
  const searchKeyword = (store.get('searchKeyword') || '').trim().toLowerCase();

  let result = cloneImages(images);

  if (filterTag !== '全部') {
    result = result.filter(img => img.tags.includes(filterTag));
  }

  if (searchKeyword) {
    result = result.filter(img =>
      img.title.toLowerCase().includes(searchKeyword)
    );
  }

  const sorted = [...result];

  if (sortBy === 'newest') {
    sorted.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  } else if (sortBy === 'random') {
    for (let i = sorted.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    }
  }

  return sorted;
}

export function getStats() {
  const images = store.get('images') || [];
  let totalTagOccurrences = 0;
  images.forEach(img => {
    totalTagOccurrences += img.tags.length;
  });

  return {
    totalImages: images.length,
    totalTags: totalTagOccurrences,
  };
}
