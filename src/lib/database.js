class Result {
  constructor(success, data = null) {
    this.success = success;
    this.data = data;
  }
}

Result.success = (x) => new Result(true, x);
Result.error = (x) => new Result(false, x);

function getPath(obj, path) {
  if(path.length > 0) {
    if(path[0] in obj) {
      return getPath(obj[path[0]], path.slice(1, path.length));
    } else {
      return Result.error();
    }
  } else {
    return Result.success(obj);
  }
}

// like a deep version of Objet.assign
function merge(into, from) {
  for(let key in from) {
    if(key in into && typeof into[key] === 'object') {
      merge(into[key], from[key]);
    } else {
      into[key] = from[key];
    }
  }
  return into;
}

// read functions are common across transactions and databases
class QueryableDatabase {
  constructor() {
    if(this.constructor === QueryableDatabase)
        throw new Error('Cannot construct abstract class QueryableDatabase');
  }

  __getDataSources() {
    throw new Error('abstract method __getDataSources must be overriden in inheriting class');
  }

  __get(f) {
    const dataSources = this.__getDataSources();
    for(let dataSource of this.__getDataSources()) {
      const result = f(dataSource);
      if(!(result instanceof Result))
        throw new Error('function passed to __get must return an instance of Result');
      if(result.success)
        return result.data;
    }
    return null;
  }

  getCurrentBreed() {
    return this.__get((data) => getPath(data, ['currentBreed']));
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
}

// only transactions have write functions
class Transaction extends QueryableDatabase {
  constructor(database) {
    super();
    if(!(database instanceof QueryableDatabase))
      throw new Error('invalid database passed into Transaction constructor');
    this.__database = database;
    this.__data = {
      breeds: {}
    };
  }

  __getDataSources() {
    return [this.__data].concat(this.__database.__getDataSources());
  }

  apply() {
    merge(this.__database.__data, this.__data);
  }

  setBreedImage(breed, subBreed = 'main', breedImage) {
    const breedData = breed in this.__data.breeds ? this.__data.breeds[breed] : {};
    breedData[subBreed] = breedImage;
    this.__data.breeds[breed] = breedData;
  }

  addImage(image) {
    if(!('imageHistory' in this.__data)) {
      let oldImageHistory = this.__database.getImageHistory();
      this.__data.imageHistory = oldImageHistory.slice(0, oldImageHistory.length);
    }
    this.__data.imageHistory.unshift(image);
  }

  setCurrentBreed(breed, subBreed = null) {
    this.__data.currentBreed = breed;
    this.__data.currentSubBreed = subBreed;
  }

  setApiError(apiError) {
    this.__data.apiError = apiError;
  }
}

class TransactableDatabase extends QueryableDatabase {
  constructor() {
    super();
    this.__data = {
      breeds: {},
      imageHistory: [],
      currentBreed: 'shiba',
      currentSubBreed: null,
      apiError: null
    };
    this.__subscribers = {};
    this.__maxSubscriberId = -1;
    this.__transactionPromise = Promise.resolve();
  }

  __getDataSources() {
    return [this.__data];
  }

  __publish() {
    Object.keys(this.__subscribers).forEach((id) => this.__subscribers[id]());
  }

  transact(f) {
    this.__transactionPromise = this.__transactionPromise
      .finally(() => {
        const txn = new Transaction(this);
        const result = f(txn);
        const promise = (result instanceof Promise) ? result : Promise.resolve(result);
        return promise.then((x) => {
          console.log('applying transaction: ', txn.__data);
          txn.apply(this.__data);
          this.__publish();
          return x;
        });
      });
    return this.__transactionPromise;
  }

  subscribe(f) {
    this.__maxSubscriberId++;
    const subscriberId = this.__maxSubscriberId;
    this.__subscribers[subscriberId] = f;
    const unsubscribe = () => {
      if(subscriberId in this.__subscribers)
        delete this.__subscribers[subscriberId];
    };
    return unsubscribe;
  }

  // could be brought up to QueryableDatabase if desired
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

const database = new TransactableDatabase();
export default database;