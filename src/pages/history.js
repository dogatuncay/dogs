import Page from '../lib/Page.js';
import { goBackward } from '../lib/pageHistory.js';
import template from './history.tmpl';
import database from '../lib/database.js';

export default class HistoryPage extends Page {
  template() {
    return template;
  }

  update() {
    let ul = document.getElementById("history-view");
    ul.innerHTML = "";
    database.getImageHistory().forEach(image => {
      const li = document.createElement("li");
      let img = document.createElement("img");
      img.src = image;
      img.height = 200;
      li.appendChild(img);
      ul.appendChild(li);
    });
  }

  afterMount() {
    document.getElementById('back-button').onclick = function() {
      goBackward();
    };
  }
}

HistoryPage.pageTitle = 'History';