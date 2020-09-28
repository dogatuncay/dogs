import Page from './Page.js';

class Database {
  constructor() {
    this.__data = {
      breeds: {},
      imageHistory: [],
      currentBreed: 'shiba',
      currentSubBreed: null,
      apiError: null
    };
    this.__currentPage = null;
  }

  notify() {
    this.__currentPage.update();
  }
  
  setCurrentPage(page) {
    if(!(page instanceof Page))
      throw new Error('cannot set non-Page object as current page');
    this.__currentPage = page
  }

  getCurrentBreed() {
    return this.__data.currentBreed;
  }

  getCurrentSubBreed() {
    return this.__get((data) => getPath(data, ['currentSubBreed']));
  }

  getImageHistory() {
    return this.__get((data) => getPath(data, ['imageHistory']));
  }

  getMostRecentImage() {
    return this.__get((data) => getPath(data, ['imageHistory', 0]));
  }

  getBreedImage(breed, subBreed = 'main') {
    return this.__get((data) => getPath(data, ['breeds', breed, subBreed]));
  }

  hasBreedImage(breed, subBreed = 'main') {
    return this.__get((data) => Result.success(breed in data.breeds && subBreed in data.breeds[breed]));
  }

  getApiError() {
    return this.__get((data) => getPath(data, ['apiError']));
  }

  setBreedImage(breed, subBreed = 'main', breedImage) {
    const breedData = breed in this.__data.breeds ? this.__data.breeds[breed] : {};
    breedData[subBreed] = breedImage;
    this.__data.breeds[breed] = breedData;
  }

  addImage(image) {
    this.__data.imageHistory.unshift(image);
  }

  setCurrentBreed(breed, subBreed = null) {
    this.__data.currentBreed = breed;
    this.__data.currentSubBreed = subBreed;
  }

  setApiError(apiError) {
    this.__data.apiError = apiError;
  }

  forEachBreed(f) {
    for(let breed in this.__data.breeds) {
      for(let subBreed in this.__data.breeds[breed]) {
        if(subBreed === 'main') {
          f(breed);
        } else {
          f(breed, subBreed);
        }
      }
    }
  }
}

const database = new Database();
export default database;
