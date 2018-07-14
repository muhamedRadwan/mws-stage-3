self.importScripts("js/idb.js");
var CachVersion = 'restaurant-stage-2';
var contentImgsCache = 'restaurant-content-imgs';
var allCaches = [CachVersion, contentImgsCache];

cpnst dbPromise = idb.open('test-db', 2, function(upgradeDb){

      var keyValStore = upgradeDb.createObjectStore('keyval');

});

// dbpromise.then(function(db){
//   var tx = db.transaction('restaurant');
//   var keyValStore = tx.objectStore('restaurant');
//   return keyValStore.get('restid');
// }).then(function(val){
//   console.log('the value of Restaurant is :', val);
// });
// Register ServerWorker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', ()=> {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }

  //Install ServerWorker
self.addEventListener('install', event =>{
    var CachedList = [ //List of static Caches files
        '/',
        '/css/styles.css',
        '/js/dbhelper.js',
        '/js/main.js',
    ];
    // event.waitUntil(
    //     caches.open(CachVersion).then(cache => {
    //       return  cache.addAll(CachedList).catch(error => console.log("caches Error : " ,error));
    //     })
    // );
});

//Get All Caches 
self.addEventListener('activate',  event => {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName.startsWith('restaurant-') &&
                   !allCaches.includes(cacheName);
          }).map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });
  

  // Check Every fetch event and check if it in cache file or not
  self.addEventListener('fetch', event => {
    var requestUrl = new URL(event.request.url);
    // Check if request is for image or not 
    if(requestUrl.pathname.startsWith('/img/')){
      // Get Image from cache
      event.respondWith(servPhoto(event.request));
      return;
    }
    // Check if request is for Restaurant or not 
    if(requestUrl.pathname.startsWith('/restaurants')){
      idbKeyval.get(event.request.url).then((blobFound) => {
        if (!blobFound) {
          console.error(`error in retrieving from db: ${blobFound}`);

          return fetch(event.request.clone())
            .then((response) => {
              // only cache valid responses
              if (!response) {
                console.error(`received invalid response from fetch: ${responseTwo}`);

                return resolve(response);
              }

              // insert response body in db
              response.clone().blob().then(
                (blob) => {
                  console.info(`updating cache with: ${JSON.stringify(event.request.clone().url)}, then returning`);
                  idbKeyval.set(
                    event.request.url,
                    blob
                  ).then(
                    (suc2) => console.log(`success in setting: ${suc2}`),
                    (err2) => console.error(`error in setting: ${err2}`)
                  );
                }
              );

              return response;
            });
        }
        //Create Respone From Blob Object
        const contentType = "application/json; charset=utf-8";
        console.log('responding from cache', event.request.url, contentType);
        // on this page https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        const myHeaders = new Headers({
          "Content-Length": String(blobFound.size),
          "Content-Type": contentType,
          "X-Custom-Header": "ProcessThisImmediately",
        });

        const init = {
          'content-type': 'text/html; charset=utf-8',
          'headers': myHeaders,
          'status' : 200,
          'statusText' : 'OKS',
        };
        const response = new Response(blobFound, init);

        return response;
    });
    }
  
    // if request is something else than image 
    event.respondWith(
      caches.open(CachVersion).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(response => {
            cache.put(event.request, response.clone()).catch(error => {console.log("Request Save Error:"+error);});
            return response;
          });
        });
      })
    );
  });

  // Get image From Cache
function servPhoto(request){
  return caches.open(contentImgsCache).then(cache =>{
    return cache.match(request).then(response =>{
      if(response) return response; // Return Image from cache as response

      // Fetch Image then add it to chache then return the resposne 
      return fetch(request).then(networkResponse =>{
        cache.put(request,networkResponse.clone());
        return networkResponse;
      });
    });
  });
}
const idbKeyval = {
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

  // Show Button SkipWaiting for new serverworker
  self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });