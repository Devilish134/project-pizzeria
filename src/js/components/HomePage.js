import {templates} from '../settings.js';

class HomePage{
  constructor(element){
    const thisHomePage = this;

    thisHomePage.render(element);
    thisHomePage.initPlugin();
  }
    
    
  render(element){
    const thisHomePage = this;
    
    const generatedHTML = templates.homeWidget();
    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = element;
    thisHomePage.dom.wrapper.innerHTML = generatedHTML;
  }

  initPlugin(){
    const elem = document.querySelector('.main-carousel');

    const flkty = new Flickity(elem, {
      cellAlign: 'left',
      contain: true,
      autoPlay: 3000,
      adaptiveHeight: true,
      prevNextButtons: false,
      draggable: '>1',
    });
  }
}

export default HomePage;