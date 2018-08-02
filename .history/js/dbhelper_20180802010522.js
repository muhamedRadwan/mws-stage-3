/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static get DATABASE_REVIEW() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        // console.log(xhr.responseText);
        const json = JSON.parse(xhr.responseText);
        const restaurants = json;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }

  static postReview(callback,review){
    let xhr = new XMLHttpRequest();
    xhr.open('POST', DBHelper.DATABASE_REVIEW);
    if (xhr.status === 200) { // Got a success response from server!
      // console.log(xhr.responseText);
      // const json = JSON.parse(xhr.responseText);
      // const restaurants = json;
      // callback(null, restaurants);
    } else { // Oops!. Got an error from server.
      const error = (`Request failed. Returned status of ${xhr.status}`);
      callback(error, null);
    }
    xhr.send(JSON.stringify(review));
  }

  static fetchReviews(restaurant_id,callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_REVIEW+`?restaurant_id=${restaurant_id}`);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        console.log(xhr.responseText);
        const json = JSON.parse(xhr.responseText);
        const reviews = json;
        callback(null, reviews);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
    
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          DBHelper.fetchReviews(restaurant.id,(error,reviews)=>{
            if (error) {
              callback(error, null);
            } 
            else {
              // const review = reviews.filter(r => r.restaurant_id == restaurant.id);
              restaurant.reviews = reviews;
              callback(null, restaurant);
            }
          });
         
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  static get dbPromise(){
    return idb.open('test-db', 0, function(upgradeDb){
      switch(upgradeDb.oldVersion){
        case 0 :
          var keyValStore = upgradeDb.createObjectStore('keyval');
        case 1 :
          var keyValStore = upgradeDb.createObjectStore('reviews');
      }
    });
  }
 
  
}
 // create static reviews idb
const idbReviews = {
  get(key) {
    return DBHelper.dbPromise.then(db => {
      return db.transaction('reviews')
        .objectStore('reviews').get(key);
    });
  },
  set(key, val) {
    return DBHelper.dbPromise.then(db => {
      const tx = db.transaction('reviews', 'readwrite');
      tx.objectStore('reviews').put(val, key);
      return tx.complete;
    });
  },
  delete(key) {
    return DBHelper.dbPromise.then(db => {
      const tx = db.transaction('reviews', 'readwrite');
      tx.objectStore('reviews').delete(key);
      return tx.complete;
    });
  },
  clear() {
    return DBHelper.dbPromise.then(db => {
      const tx = db.transaction('reviews', 'readwrite');
      tx.objectStore('reviews').clear();
      return tx.complete;
    });
  },
  keys() {
    return DBHelper.dbPromise.then(db => {
      const tx = db.transaction('reviews');
      const keys = [];
      const store = tx.objectStore('reviews');

      // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
      // openKeyCursor isn't supported by Safari, so we fall back
      (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
        if (!cursor) return;
        keys.push(cursor.key);
        cursor.continue();
      });

      return tx.complete.then(() => keys);
    });
  }
};
