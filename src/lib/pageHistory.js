import pageIndex from './pageIndex.js'

let currentPage = null;

function swap(PageClass) {
  if(currentPage == null)
    throw new Error('cannot swap pages until application is initialized');
  currentPage.unmount();
  currentPage = new PageClass();
  currentPage.mount();
}

function init(PageClass) {
  if(currentPage != null)
    throw new Error('can only initialize application once');
  currentPage = new PageClass();
  currentPage.mount();
  window.history.replaceState({ pageClass: PageClass.name }, PageClass.pageTitle);
  document.title = PageClass.pageTitle;

  window.onpopstate = function(e) {
    swap(pageIndex[e.state.pageClass]);
  }
}

function goForward(PageClass) {
  window.history.pushState({ pageClass: PageClass.name }, PageClass.pageTitle);
  document.title = PageClass.pageTitle;
  swap(PageClass);
}

function goBackward() {
  window.history.go(-1);
}

export {init, goForward, goBackward};