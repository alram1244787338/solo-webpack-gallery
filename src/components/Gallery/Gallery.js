import './Gallery.scss';
import { useStore, useBus, getFilteredImages } from '@/utils/state';
import { formatDate } from '@/utils';

class Gallery {
  constructor() {
    this.element = null;
    this.gridEl = null;
    this.titleEl = null;
    this.countEl = null;
    this.store = useStore();
    this.bus = useBus();
  }

  render() {
    this.element = document.createElement('main');
    this.element.className = 'gallery';

    this.element.innerHTML = `
      <div class="gallery-header">
        <h2 class="gallery-title"></h2>
        <p class="gallery-count"></p>
      </div>
      <div class="gallery-grid"></div>
    `;

    this.titleEl = this.element.querySelector('.gallery-title');
    this.countEl = this.element.querySelector('.gallery-count');
    this.gridEl = this.element.querySelector('.gallery-grid');

    return this.element;
  }

  init() {
    this.subscribeState();
    this.renderImages();
    this.bindEvents();
  }

  subscribeState() {
    this.bus.on('state:filterTag', () => this.renderImages());
    this.bus.on('state:sortBy', () => this.renderImages());
    this.bus.on('state:images', () => this.renderImages());
  }

  renderImages() {
    const filterTag = this.store.get('filterTag');
    const images = getFilteredImages();

    this.titleEl.textContent = filterTag === '全部' ? '全部图片' : `${filterTag} · 图片`;
    this.countEl.textContent = `共 ${images.length} 张图片`;

    if (images.length === 0) {
      this.renderEmpty();
      return;
    }

    this.gridEl.innerHTML = '';
    images.forEach(image => {
      const card = this.createImageCard(image);
      this.gridEl.appendChild(card);
    });
  }

  renderEmpty() {
    this.gridEl.innerHTML = `
      <div class="gallery-empty">
        <div class="empty-icon">🖼️</div>
        <p class="empty-text">暂无图片</p>
        <p class="empty-hint">该分类下还没有图片</p>
      </div>
    `;
  }

  createImageCard(image) {
    const card = document.createElement('figure');
    card.className = 'image-card';
    card.dataset.id = image.id;

    const tagsHtml = image.tags
      .map(tag => `<span class="card-tag">${tag}</span>`)
      .join('');

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${image.thumbnail}" alt="${image.title}" loading="lazy" />
        <div class="image-overlay">
          <div class="overlay-info">
            <h3 class="card-title">${image.title}</h3>
            <p class="card-date">${formatDate(image.uploadDate)}</p>
          </div>
        </div>
      </div>
      <figcaption class="card-footer">
        <div class="card-tags">${tagsHtml}</div>
      </figcaption>
    `;

    return card;
  }

  bindEvents() {
    this.gridEl.addEventListener('click', (e) => {
      const card = e.target.closest('.image-card');
      if (card) {
        const id = parseInt(card.dataset.id, 10);
        const image = this.store.get('images').find(img => img.id === id);
        if (image) {
          this.bus.emit('image:click', image);
        }
      }
    });
  }
}

export default Gallery;
