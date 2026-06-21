import './Navbar.scss';

class Navbar {
  constructor() {
    this.element = null;
  }

  render() {
    this.element = document.createElement('nav');
    this.element.className = 'navbar';

    this.element.innerHTML = `
      <div class="navbar-inner">
        <div class="navbar-brand">
          <span class="logo">🖼️</span>
          <h1 class="title">图片画廊</h1>
        </div>
        <div class="navbar-actions">
          <button class="nav-btn" id="searchBtn" title="搜索">
            🔍
          </button>
          <button class="nav-btn" id="uploadBtn" title="上传">
            ⬆️
          </button>
        </div>
      </div>
    `;

    return this.element;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const searchBtn = this.element.querySelector('#searchBtn');
    const uploadBtn = this.element.querySelector('#uploadBtn');

    searchBtn.addEventListener('click', () => {
      console.log('搜索按钮点击');
    });

    uploadBtn.addEventListener('click', () => {
      console.log('上传按钮点击');
    });
  }
}

export default Navbar;
