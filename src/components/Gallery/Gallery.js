import './Gallery.scss';

class Gallery {
  constructor() {
    this.element = null;
  }

  render() {
    this.element = document.createElement('main');
    this.element.className = 'gallery';

    this.element.innerHTML = `
      <div class="gallery-header">
        <h2 class="gallery-title">全部图片</h2>
        <p class="gallery-count">共 0 张图片</p>
      </div>
      <div class="gallery-grid">
        <div class="gallery-empty">
          <div class="empty-icon">🖼️</div>
          <p class="empty-text">暂无图片</p>
          <p class="empty-hint">图片画廊内容将在这里展示</p>
        </div>
      </div>
    `;

    return this.element;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
  }
}

export default Gallery;
