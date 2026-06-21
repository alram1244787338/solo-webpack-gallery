import '@/styles/global.scss';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Gallery from '@/components/Gallery';
import { useStore, useBus } from '@/utils/state';
import mockImages from '@/data/images';

class App {
  constructor() {
    this.app = document.getElementById('app');
    this.navbar = new Navbar();
    this.sidebar = new Sidebar();
    this.gallery = new Gallery();
    this.store = useStore();
    this.bus = useBus();
  }

  init() {
    this.initStore();
    this.render();
    this.initComponents();
    this.bindGlobalEvents();
    console.log('图片画廊应用已启动');
  }

  initStore() {
    this.store.set('images', mockImages);
    this.store.set('filterTag', '全部');
    this.store.set('sortBy', 'newest');
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
  }

  initComponents() {
    this.navbar.init();
    this.sidebar.init();
    this.gallery.init();
  }

  bindGlobalEvents() {
    this.bus.on('image:click', (image) => {
      console.log('点击图片:', image);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
