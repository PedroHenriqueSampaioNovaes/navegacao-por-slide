import debounce from './debounce.js';

export class Slide {
  constructor(wrapper, slide) {
    this.wrapper = document.querySelector(wrapper);
    this.slide = document.querySelector(slide);
    this.activeClass = 'active';
    this.eventChangeSlide = new Event('changeSlide');

    this.dist = { startX: 0, finalPosition: 0, movement: 0 };
  }

  transition(type) {
    this.slide.style.transition = type ? 'transform .3s' : '';
  }

  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6; // movement tem que ser positivo mesmo empurrando o cursor para a esquerda porque no changeSlideOnEnd é feita a condição com essa propriedade verificando se o cursor foi empurrado + 120px para mandar o container slide para à esquerda e, consequentemente, nos mostrar o slide à direita. Enquanto se o mouse for empurrado -120px para mandar o container slide para à direita e, por consequência, nos mostrar o slide à esquerda
    return this.dist.finalPosition - this.dist.movement;
  }

  moveSlide(distX) {
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  onStart(event) {
    let moveType;
    if (event.type === 'mousedown') {
      event.preventDefault();
      this.dist.startX = event.clientX;
      moveType = 'mousemove';
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      moveType = 'touchmove';
    }
    this.transition(false);
    this.wrapper.addEventListener(moveType, this.onMove);
  }

  onMove(event) {
    const moveType =
      event.type === 'mousemove'
        ? event.clientX
        : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(moveType);
    this.moveSlide(finalPosition);
  }

  onEnd(event) {
    const moveType = event.type === 'mouseup' ? 'mousemove' : 'touchmove';
    this.wrapper.removeEventListener(moveType, this.onMove);
    this.changeSlideOnEnd();
    this.transition(true);
  }

  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slidesArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return {
        position,
        element,
      };
    });
  }

  indexSlideNav(index) {
    const lastIndex = this.slidesArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === lastIndex ? undefined : index + 1,
    };
  }

  changeSlideOnEnd() {
    if (this.dist.movement >= 120 && this.index.next !== undefined) {
      this.activeNextSlide(this.index.next);
    } else if (this.dist.movement <= 120 && this.index.prev !== undefined) {
      this.activePrevSlide(this.index.prev);
    } else {
      this.changeSlide(this.index.active);
    }
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
  }

  activeNextSlide() {
    if (this.index.next !== undefined) this.changeSlide(this.index.next);
  }

  changeSlide(index) {
    const activeSlide = this.slidesArray[index];
    this.moveSlide(activeSlide.position);
    this.indexSlideNav(index);
    this.dist.finalPosition = activeSlide.position;
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.eventChangeSlide);
  }

  changeActiveClass() {
    this.slidesArray.forEach((slide) =>
      slide.element.classList.remove(this.activeClass),
    );
    this.slidesArray[this.index.active].element.classList.add(this.activeClass);
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 100);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onMove = this.onMove.bind(this);
    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);

    this.onResize = debounce(this.onResize.bind(this), 200);
  }

  addSlideEvents() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
    this.wrapper.addEventListener('touchstart', this.onStart);
    this.wrapper.addEventListener('touchend', this.onEnd);
  }

  addResizeEvent() {
    window.addEventListener('resize', this.onResize);
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    this.slidesConfig();
    this.transition(true);
    this.changeSlide(2);
    this.addResizeEvent();

    return this;
  }
}

export default class SlideNav extends Slide {
  constructor(wrapper, slide) {
    super(wrapper, slide);
    
    this.bindControlEvents();
  }

  addArrow(prev, next) {
    this.prevArrow = document.querySelector(prev);
    this.nextArrow = document.querySelector(next);
    this.addArrowEvent();
  }

  addArrowEvent() {
    this.prevArrow.addEventListener('click', this.activePrevSlide);
    this.nextArrow.addEventListener('click', this.activeNextSlide);
  }

  createControls() {
    const control = document.createElement('ul');
    control.dataset.control = 'slide';

    this.slidesArray.forEach((slide, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${index + 1}</a></li>`;
    });

    this.wrapper.appendChild(control);
    return control;
  }

  addControlEvent(item, index) {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      this.changeSlide(index);
    });
    
    this.wrapper.addEventListener('changeSlide', this.activeControlItem);
  }

  activeControlItem() {
    this.controlsArray.forEach((item) => item.classList.remove(this.activeClass));
    this.controlsArray[this.index.active].classList.add(this.activeClass);
  }

  addControl(controls) {
    this.controls = document.querySelector(controls) || this.createControls();
    this.controlsArray = [...this.controls.children];
    this.activeControlItem();
    this.controlsArray.forEach(this.addControlEvent);
  }

  bindControlEvents() {
    this.addControlEvent = this.addControlEvent.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
