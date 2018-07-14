import idb from 'js/idb.js';
var CachVersion = 'restaurant-stage-2';
var contentImgsCache = 'restaurant-content-imgs';
var allCaches = [CachVersion, contentImgsCache];

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
    // Check if request is for image or not 
    if(requestUrl.pathname.startsWith('/img/')){
      // Get Image from cache
      event.respondWith(servPhoto(event.request));
      return;
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
  // Show Button SkipWaiting for new serverworker
  self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });