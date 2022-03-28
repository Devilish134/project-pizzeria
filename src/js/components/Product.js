import {select, utils, templates, classNames} from './settings.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.prepareCartProduct();
  }

  renderInMenu(){
    const thisProduct = this;

    /*generate HTML bbased on template*/
    const generateHTML = templates.menuProduct(thisProduct.data);

    /*create element using utils.createElementFromHTML*/
    thisProduct.element = utils.createDOMFromHTML(generateHTML);

    /*find menu container*/
    const menuContainer = document.querySelector(select.containerOf.menu);

    /*add element to menu*/
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.dom = {};
    
    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
    
  initAccordion(){
    const thisProduct = this;
    
    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      const activeProducts = document.querySelectorAll(select.all.menuProducts);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      for(let activeProduct of activeProducts){
        if(activeProduct != thisProduct.element) {
          activeProduct.classList.remove('active');
        } else thisProduct.element.classList.toggle('active'); /* <-- toggle active class on thisProduct.element */
      }
    });
  }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);

    thisProduct.dom.amountWidgetElem.addEventListener('updated', function (){
      thisProduct.processOrder();
    });
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};
    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    productSummary.params = thisProduct.prepareCartProductParams();

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};
    const paramsId = thisProduct.data.params;

    for(let paramId in paramsId){
      const param = paramsId[paramId];

      params[paramId] = {
        label: param.label,
        options: {}
      };
      for(let optionId in param.options){
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(optionSelected){
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }

  addToCart(){
    const thisProduct = this;

    const event = new CustomEvent('add-to=cart', {
      bubbles: true,
      detail: {
        Product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  processOrder(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
      
    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        const categorySelected = formData.hasOwnProperty(paramId);
        const thisImage  = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

        if (thisImage) {
          thisImage.classList.add(classNames.menuProduct.imageVisible);
        }

        if(categorySelected){
          const productSelect = formData[paramId].includes(optionId);
            
          if(productSelect && !option.default){
            const priceOption = option.price;
            price += priceOption;

          } else if(!productSelect && option.default){
            const priceOption = option.price;
            price -= priceOption;

            if (thisImage) {
              thisImage.classList.remove(classNames.menuProduct.imageVisible);
            }

          } else if(!productSelect && !option.default){
            if (thisImage) {
              thisImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        } 
      }  
    }
    thisProduct.priceSingle = price; 
    // update calculated price in the HTML
    price *= thisProduct.amountWidget.value;
    thisProduct.dom.priceElem.innerHTML = price;          
  }
}

export default Product;