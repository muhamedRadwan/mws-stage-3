self.importScripts("js/idb.js");
const dbPromise = idb.open('keyval-store', 1, upgradeDB => {
  upgradeDB.createObjectStore('keyval');
});

const keyValStore = {
  get(key) {
    return dbPromise.then(db => {
      return db.transaction('keyval')
        .objectStore('keyval').get(key);
    });
  },
  set(key, val) {
    return dbPromise.then(db => {
      const tx = db.transaction('keyval', 'readwrite');
      tx.objectStore('keyval').put(val, key);
      return tx.complete;
    });
  },
  delete(key) {
    return dbPromise.then(db => {
      const tx = db.transaction('keyval', 'readwrite');
      tx.objectStore('keyval').delete(key);
      return tx.complete;
    });
  },
  clear() {
    return dbPromise.then(db => {
      const tx = db.transaction('keyval', 'readwrite');
      tx.objectStore('keyval').clear();
      return tx.complete;
    });
  },
  keys() {
    return dbPromise.then(db => {
      const tx = db.transaction('keyval');
      const keys = [];
      const store = tx.objectStore('keyval');

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
keyValStore.set('foo', {hello: 'world'});

// logs: {hello: 'world'}
keyValStore.get('foo').then(val => console.log(val));
// var dbpromise = idb.open('test-db', 1, function(upgradeDb){
//   switch(upgradeDb.oldVersion){
//     case 0:
//       var keyValStore = upgradeDb.createObjectStore('restaurant');
//       keyValStore.set("test","t");

//   }
// });

// // dbpromise.then(function(db){
// //   var tx = db.transaction('restaurant');
// //   var keyValStore = tx.objectStore('restaurant');
// //   return keyValStore.get('restid');
// // }).then(function(val){
// //   console.log('the value of Restaurant is :', val);
// // });
// // Register ServerWorker
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', ()=> {
//       navigator.serviceWorker.register('/sw.js').then(registration => {
//         console.log('ServiceWorker registration successful with scope: ', registration.scope);
//       }, err => {
//         console.log('ServiceWorker registration failed: ', err);
//       });
//     });
//   }

//   //Install ServerWorker
// self.addEventListener('install', event =>{
//     var CachedList = [ //List of static Caches files
//         '/',
//         '/css/styles.css',
//         '/js/dbhelper.js',
//         '/js/main.js',
//     ];
//     event.waitUntil(
//         caches.open(CachVersion).then(cache => {
//           return  cache.addAll(CachedList).catch(error => console.log("caches Error : " ,error));
//         })
//     );
// });

// //Get All Caches 
// self.addEventListener('activate',  event => {
//     event.waitUntil(
//       caches.keys().then(cacheNames => {
//         return Promise.all(
//           cacheNames.filter(cacheName => {
//             return cacheName.startsWith('restaurant-') &&
//                    !allCaches.includes(cacheName);
//           }).map(cacheName => {
//             return caches.delete(cacheName);
//           })
//         );
//       })
//     );
//   });
  

//   // Check Every fetch event and check if it in cache file or not
//   self.addEventListener('fetch', event => {
//     var requestUrl = new URL(event.request.url);
//     // Check if request is for image or not 
//     if(requestUrl.pathname.startsWith('/img/')){
//       // Get Image from cache
//       event.respondWith(servPhoto(event.request));
//       return;
//     }
//     // Check if request is for Restaurant or not 
//     if(requestUrl.pathname.startsWith('/restaurants')){
//       // console.log(requestUrl.pathname);
//       // Get Restaurant from cache
//       var s = servRestaurant(event.request);
//       console.log("this".s);
//       event.respondWith(s);
//       return;
//     }
  
//     // if request is something else than image 
//     event.respondWith(
//       caches.open(CachVersion).then(cache => {
//         return cache.match(event.request).then(response => {
//           return response || fetch(event.request).then(response => {
//             cache.put(event.request, response.clone()).catch(error => {console.log("Request Save Error:"+error);});
//             return response;
//           });
//         });
//       })
//     );
//   });

//   // Get image From Cache
// function servPhoto(request){
//   return caches.open(contentImgsCache).then(cache =>{
//     return cache.match(request).then(response =>{
//       if(response) return response; // Return Image from cache as response

//       // Fetch Image then add it to chache then return the resposne 
//       return fetch(request).then(networkResponse =>{
//         cache.put(request,networkResponse.clone());
//         return networkResponse;
//       });
//     });
//   });
// }
// function servRestaurant(request){
// dbpromise.then(function(db){
//   var tx = db.transaction('restaurant');
//   var keyValStore = tx.objectStore('restaurant');
//   return keyValStore.get('restaurants');
// }).then(function(val){
//   if(val) return val;
  
//   return fetch(request).then(networkResponse =>{
//     dbpromise.then(function(db){
//       var tx = db.transaction('restaurant','readwrite');
//       var keyValStore = tx.objectStore('restaurant');
//       // console.log(networkResponse.clone());
//       keyValStore.put("networkResponse.clone()",'test');
//       // keyValStore.put(networkResponse.clone(),'restaurants').catch(error => {console.log("Request Save Error:"+error);});;
//       return networkResponse;
//     }).then(function(networkResponse){return networkResponse;});    
    
//   });
//   console.log('the value of Restaurant is :', val);
// });
// }
//   // Show Button SkipWaiting for new serverworker
//   self.addEventListener('message', event => {
//     if (event.data.action === 'skipWaiting') {
//       self.skipWaiting();
//     }
//   });