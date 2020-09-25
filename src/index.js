import {init} from './lib/pageHistory.js';
import HomePage from './pages/home.js';
import {getAllBreeds} from './lib/api.js';

// make initial requests to seed the database on page load
getAllBreeds();

// mount the home page
init(HomePage);