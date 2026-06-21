import '@/styles/global.scss';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Gallery from '@/components/Gallery';

class App {
  constructor() {
    this.app = document.getElementById('app');
    this.navbar = new Navbar();
    this.sidebar = new Sidebar();
    this.gallery = new Gallery();
  }

  init() {
    this.render();
    this.bindEvents();
    console.log('图片画廊应用已启动');
  }

  render() {
    const layout = document.createElement('div');
    layout.className = 'app-layout';

    const navbarEl = this.navbar.render();
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';

    const sidebarEl = this.sidebar.render();
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';
    const galleryEl = this.gallery.render();

    contentArea.appendChild(galleryEl);
    mainWrapper.appendChild(sidebarEl);
    mainWrapper.appendChild(contentArea);

    layout.appendChild(navbarEl);
    layout.appendChild(mainWrapper);

    this.app.appendChild(layout);

    this.navbar.init();
    this.sidebar.init();
    this.gallery.init();
  }

  bindEvents() {
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
