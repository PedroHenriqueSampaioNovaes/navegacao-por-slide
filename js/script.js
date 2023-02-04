import SlideNav from './modules/slide.js';

const slide = new SlideNav('.slide-wrapper', '.slide');
slide.init();
slide.addArrow('.prev', '.next');
slide.addControl('.custom-controls');
