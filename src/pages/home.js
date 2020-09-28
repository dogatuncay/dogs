import Page from '../lib/Page.js';
import template from './home.tmpl';
import { goForward } from '../lib/pageHistory.js'
import database from '../lib/database.js';
import HistoryPage from './history.js';
import BreedSelectionPage from '../pages/breedSelection.js';
import { getRandomBreedImage } from '../lib/api.js';

export default class HomePage extends Page {
  template() {
    return template;
  }

  update() {
    console.log('image:', database.getMostRecentImage());
    document.getElementById('current-breed-name').innerText = database.getCurrentBreed();
    if(database.getMostRecentImage())
      document.getElementById('current-dog-image').src = database.getMostRecentImage();
    document.getElementById('error').innerText = database.getApiError();
  }

  afterMount() {
    let activeDogRequest = false;
    document.getElementById('request-dog-button').onclick = () => {
      if(activeDogRequest) return;
      activeDogRequest = true;
      getRandomBreedImage(database.getCurrentBreed(), database.getCurrentSubBreed())
        .then((image) =>
          database.addImage(image)
        )
        .finally(() => {
          database.notify();
          activeDogRequest = false
        });
    };

    document.getElementById('change-breed-button').onclick = () => {
      goForward(BreedSelectionPage);
    };

    document.getElementById('history-button').onclick = function() {
      goForward(HistoryPage);
    };
  }
}

HomePage.pageTitle = 'Home';