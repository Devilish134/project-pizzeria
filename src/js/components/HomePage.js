
class HomePage{
  constructor(element){
    const thisHompage = this;

  }
  render(element){
    const thisHompage = this;

    const generatedHTML = templates.homeWidget();
    thisHompage.dom = {};
    thisHompage.dom.wrapper = element;
    thisHompage.dom.wrapper.innerHTML = generatedHTML;
  }
}

export default HomePage;