import database from "./database";

function apiUrl(path) {
  return `https://dog.ceo/api/${path}`
}

function request(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.addEventListener("load", () => {
      if(request.status !== 200 || request.getResponseHeader("content-type") !== "application/json") {
        console.error("api request failed: ", request);
        database.setApiError("Request failed");
        reject();
      } else {
        const response = JSON.parse(request.responseText);
        if(response.status !== "success") {
          console.error("api error: ", response.message);
          database.setApiError(response.message);
          reject();
        } else {
          resolve(response.message);
        }
      }
    });
    request.open("GET", url);
    request.send();
  })
}

export function getRandomBreedImage(breed, subBreed) {
  let breedApiPath;
  if(subBreed) {
    breedApiPath = `breed/${breed}/${subBreed}`;
  } else {
    breedApiPath = `breed/${breed}`;
  }

  const url = apiUrl(`${breedApiPath}/images/random`);
  return request(url);
}

// our initial request to the api on page load
// we special case shiba here to load it first
// assumes there are no sub-breeds for shiba
export function getAllBreeds() {
  request(apiUrl("breeds/list/all"))
    .then((breeds) =>
      getRandomBreedImage('shiba', null)
        .then((shibaImage) => {
          database.addBreedImage('shiba', undefined, shibaImage);
          database.addImage(shibaImage);
          database.notify();
        })
        .then(() => {
          const breedsToLoad = Object.keys(breeds).filter((breed) => breed !== 'shiba');
          return Promise.all(breedsToLoad.flatMap((breed) => {
            const subBreeds = breeds[breed].concat([undefined]);
            return subBreeds.map((subBreed) =>
              getRandomBreedImage(breed, subBreed)
                .then((breedImage) => database.setBreedImage(breed, subBreed, breedImage))
            );
          }))
            .then(() => database.notify())
        })
    );
}