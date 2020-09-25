import HomePage from '../pages/home.js';
import HistoryPage from '../pages/history.js';
import BreedSelectionPage from '../pages/breedSelection.js';

const pages = [HomePage, HistoryPage, BreedSelectionPage];

let pageIndex = {};
pages.forEach(pageClass => {
  pageIndex[pageClass.name] = pageClass;
});

export default pageIndex;