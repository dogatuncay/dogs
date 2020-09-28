import Page from '../lib/Page.js';
import template from './breedSelection.tmpl';
import { goBackward, goForward } from '../lib/pageHistory.js';
import { getRandomBreedImage } from '../lib/api.js';
import HomePage from '../pages/home.js';
import database from '../lib/database.js';

export default class BreedSelectionPage extends Page {
  template() {
    return template;
  }

  selectBreed(breed, subBreed) {
    return getRandomBreedImage(breed, subBreed)
      .then((image) => {
        database.setCurrentBreed(breed, subBreed);
        database.addImage(image);
      })
      .then(() => {
        goForward(HomePage);
        database.notify()
      })
      .catch(() => database.notify());
  }

  update() {
    const ul = document.getElementById("breeds");
    ul.innerHTML = "";
    database.forEachBreed((breed, subBreed) => {
      const li = document.createElement("li");
      li.onclick = () => this.selectBreed(breed, subBreed);

      const img = document.createElement("img");
      img.src = database.getBreedImage(breed, subBreed);
      img.height = 50;
      img.width = 50;

      const subBreedText = subBreed ? ` (${subBreed})` : '';
      const breedText = breed + subBreedText;

      li.appendChild(img);
      li.appendChild(document.createTextNode(breedText));
      ul.appendChild(li);
    })
  }

  afterMount() {
    document.getElementById('back-button').onclick = function() {
      goBackward();
    };
  }
}

BreedSelectionPage.pageTitle = 'Breed Selection';