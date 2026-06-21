import './Navbar.scss';
import { useStore } from '@/utils/state';
import { debounce } from '@/utils';

class Navbar {
  constructor() {
    this.element = null;
    this.searchBtn = null;
    this.searchBox = null;
    this.searchInput = null;
    this.clearBtn = null;
    this.store = useStore();
    this.searchExpanded = false;
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
          <div class="search-box">
            <input
              type="text"
              class="search-input"
              placeholder="搜索图片标题..."
            />
            <button class="search-clear" title="清除搜索">
              ✕
            </button>
          </div>
          <button class="nav-btn nav-btn--search" title="搜索">
            🔍
          </button>
          <button class="nav-btn" title="上传">
            ⬆️
          </button>
        </div>
      </div>
    `;

    this.searchBtn = this.element.querySelector('.nav-btn--search');
    this.searchBox = this.element.querySelector('.search-box');
    this.searchInput = this.element.querySelector('.search-input');
    this.clearBtn = this.element.querySelector('.search-clear');

    return this.element;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.searchBtn.addEventListener('click', () => this.toggleSearch());
    this.clearBtn.addEventListener('click', () => this.clearSearch());

    const handleInput = debounce((e) => {
      this.store.set('searchKeyword', e.target.value);
    }, 200);

    this.searchInput.addEventListener('input', handleInput);
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
        this.collapseSearch();
      }
      if (e.key === 'Enter') {
        e.target.blur();
      }
    });

    this.element.querySelectorAll('.nav-btn')[1].addEventListener('click', () => {
      console.log('上传按钮点击');
    });
  }

  toggleSearch() {
    if (this.searchExpanded) {
      if (this.searchInput.value) {
        this.clearSearch();
      }
      this.collapseSearch();
    } else {
      this.expandSearch();
    }
  }

  expandSearch() {
    this.searchExpanded = true;
    this.searchBox.classList.add('search-box--expanded');
    this.searchBtn.classList.add('nav-btn--active');
    setTimeout(() => this.searchInput.focus(), 200);
  }

  collapseSearch() {
    this.searchExpanded = false;
    this.searchBox.classList.remove('search-box--expanded');
    this.searchBtn.classList.remove('nav-btn--active');
  }

  clearSearch() {
    this.searchInput.value = '';
    this.store.set('searchKeyword', '');
  }
}

export default Navbar;
