import './Sidebar.scss';

class Sidebar {
  constructor() {
    this.element = null;
  }

  render() {
    this.element = document.createElement('aside');
    this.element.className = 'sidebar';

    this.element.innerHTML = `
      <div class="sidebar-inner">
        <div class="sidebar-section">
          <h3 class="section-title">标签筛选</h3>
          <div class="tag-list">
            <span class="tag tag--active">全部</span>
            <span class="tag">风景</span>
            <span class="tag">人物</span>
            <span class="tag">动物</span>
            <span class="tag">建筑</span>
            <span class="tag">美食</span>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">排序方式</h3>
          <div class="sort-options">
            <label class="sort-option">
              <input type="radio" name="sort" value="newest" checked>
              <span>最新上传</span>
            </label>
            <label class="sort-option">
              <input type="radio" name="sort" value="popular">
              <span>最受欢迎</span>
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
              <span class="stat-value">0</span>
              <span class="stat-label">图片总数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">0</span>
              <span class="stat-label">标签数量</span>
            </div>
          </div>
        </div>
      </div>
    `;

    return this.element;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const tags = this.element.querySelectorAll('.tag');
    tags.forEach(tag => {
      tag.addEventListener('click', () => {
        tags.forEach(t => t.classList.remove('tag--active'));
        tag.classList.add('tag--active');
        console.log('选中标签:', tag.textContent);
      });
    });

    const sortRadios = this.element.querySelectorAll('input[name="sort"]');
    sortRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        console.log('排序方式:', e.target.value);
      });
    });
  }
}

export default Sidebar;
