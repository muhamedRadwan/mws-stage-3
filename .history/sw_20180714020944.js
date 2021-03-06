self.importScripts("js/idb.js");
var CachVersion = 'restaurant-stage-2';
var contentImgsCache = 'restaurant-content-imgs';
var allCaches = [CachVersion, contentImgsCache];

var dbpromise = idb.open('test-db', 1, function(upgradeDb){
  switch(upgradeDb.oldVersion){
    case 0:
      var keyValStore = upgradeDb.createObjectStore('restaurant');

  }
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
    event.waitUntil(
        caches.open(CachVersion).then(cache => {
          return  cache.addAll(CachedList).catch(error => console.log("caches Error : " ,error));
        })
    );
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
    dbpromise.then(function(db){
    var tx = db.transaction('restaurant','readwrite');
    var keyValStore = tx.objectStore('restaurant');
    keyValStore.put("test","requestUrl");
    });
    // Check if request is for image or not 
    if(requestUrl.pathname.startsWith('/img/')){
      // Get Image from cache
      event.respondWith(servPhoto(event.request));
      return;
    }
    // Check if request is for Restaurant or not 
    if(requestUrl.pathname.startsWith('/restaurants')){
      console.log(requestUrl.pathname);
      // Get Restaurant from cache
      event.respondWith(servRestaurant(event.request));
      return;
    }
  
    // if request is something else than image 
    // event.respondWith(
    //   caches.open(CachVersion).then(cache => {
    //     return cache.match(event.request).then(response => {
    //       return response || fetch(event.request).then(response => {
    //         cache.put(event.request, response.clone()).catch(error => {
    //           console.log("Request Save Error:"+error);
    //         });
    //         return response;
    //       });
    //     });
    //   })
    // );
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
function servRestaurant(request){
dbpromise.then(function(db){
  var tx = db.transaction('restaurant');
  var keyValStore = tx.objectStore('restaurant');
  return keyValStore.get('restaurants');
}).then(function(blobFound){
  if(blobFound){
    const contentType = consts.getBlobType(blobFound, event.request.url);
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

    return resolve(response);
  }
  
  return fetch(request).then(networkResponse =>{
    dbpromise.then(function(db){
      
      // keyValStore.put("networkResponse.clone()",'test');
      var responseClone = networkResponse.clone();
      responseClone.blob().then((blob)=>{
        // console.log(blob);
        var tx = db.transaction('restaurant','readwrite');
        var keyValStore = tx.objectStore('restaurant');
        keyValStore.put("test","request.url").catch(error => {
          console.log("Request Save Error:"+error);
        });
      });
      return networkResponse;
    }).then(function(networkResponse){return networkResponse;});    
    
  });
  console.log('the value of Restaurant is :', blobFound);
});
}
  // Show Button SkipWaiting for new serverworker
  self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });