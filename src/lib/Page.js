import database from './database.js'

export default class Page {
  constructor() {
    if(this.constructor === Page)
      throw new Error('Cannot construct abstract class Page');
  }

  template() {
    throw new Error(`Missing template for ${this.constructor.name}`);
  }

  mount() {
    document.getElementById('root').innerHTML = this.template();
    this.afterMount();
    this.update();
    this.__unsubscribe = database.subscribe(() => this.update());
  }
  
  unmount() {
    this.__unsubscribe();
    this.beforeUnmount();
    document.getElementById('root').innerHTML = '';
  }

  update() {}
  afterMount() {}
  beforeUnmount() {}
}