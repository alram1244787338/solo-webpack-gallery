import './Sidebar.scss';
import { tags } from '@/data/images';
import { useStore, useBus, getStats } from '@/utils/state';

class Sidebar {
  constructor() {
    this.element = null;
    this.tagListEl = null;
    this.statsImagesEl = null;
    this.statsTagsEl = null;
    this.store = useStore();
    this.bus = useBus();
  }

  render() {
    this.element = document.createElement('aside');
    this.element.className = 'sidebar';

    this.element.innerHTML = `
      <div class="sidebar-inner">
        <div class="sidebar-section">
          <h3 class="section-title">标签筛选</h3>
          <div class="tag-list"></div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">排序方式</h3>
          <div class="sort-options">
            <label class="sort-option">
              <input type="radio" name="sort" value="newest" checked>
              <span>最新上传</span>
            </label>
            <label class="sort-option">
              <input type="radio" name="sort" value="random">
              <span>随机浏览</span>
            </label>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">统计信息</h3>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-value" id="statImages">0</span>
              <span class="stat-label">图片总数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value" id="statTags">0</span>
              <span class="stat-label">标签数量</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.tagListEl = this.element.querySelector('.tag-list');
    this.statsImagesEl = this.element.querySelector('#statImages');
    this.statsTagsEl = this.element.querySelector('#statTags');

    this.renderTags();

    return this.element;
  }

  init() {
    this.subscribeState();
    this.updateStats();
    this.bindEvents();
  }

  renderTags() {
    const currentTag = this.store.get('filterTag');
    this.tagListEl.innerHTML = '';

    tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = tag;
      tagEl.dataset.tag = tag;

      if (tag === currentTag) {
        tagEl.classList.add('tag--active');
      }

      this.tagListEl.appendChild(tagEl);
    });
  }

  subscribeState() {
    this.bus.on('state:images', () => this.updateStats());
    this.bus.on('state:filterTag', () => this.highlightActiveTag());
  }

  updateStats() {
    const { totalImages, totalTags } = getStats();
    this.statsImagesEl.textContent = totalImages;
    this.statsTagsEl.textContent = totalTags;
  }

  highlightActiveTag() {
    const currentTag = this.store.get('filterTag');
    const tagEls = this.tagListEl.querySelectorAll('.tag');
    tagEls.forEach(tagEl => {
      if (tagEl.dataset.tag === currentTag) {
        tagEl.classList.add('tag--active');
      } else {
        tagEl.classList.remove('tag--active');
      }
    });
  }

  bindEvents() {
    this.tagListEl.addEventListener('click', (e) => {
      const tagEl = e.target.closest('.tag');
      if (tagEl) {
        const tag = tagEl.dataset.tag;
        if (tag && tag !== this.store.get('filterTag')) {
          this.store.set('filterTag', tag);
        }
      }
    });

    const sortRadios = this.element.querySelectorAll('input[name="sort"]');
    sortRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        this.store.set('sortBy', sortBy);
      });
    });
  }
}

export default Sidebar;
