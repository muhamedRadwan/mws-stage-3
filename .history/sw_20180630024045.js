var CachVersion = 'restaurant-stage-2';
var contentImgsCache = 'restaurant-content-imgs';
var allCaches = [CachVersion, contentImgsCache];
if ('serviceWorker' in navigator) {
    window.addEventListener('load', ()=> {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }

self.addEventListener('install',function(event){
    var CachedList = [
        '/',
        '/css/styles.css',
        '/js/dbhelper.js',
        '/js/main.js',
    ];
    event.waitUntil(
        caches.open(CachVersion).then(cache => {
          return  cache.addAll(CachedList).catch((error) => console.log("caches open : " ,error));
        })
    );
});
self.addEventListener('activate',  event => {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('restaurant-') &&
                   !allCaches.includes(cacheName);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    var requestUrl = new URL(event.request.url);
    if(requestUrl.pathname.startsWith('/img/')){
      event.respondWith(servPhoto(event.request));
      return;
    }
  
    event.respondWith(
      caches.open(CachVersion).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  });

  function servPhoto(request){
    return caches.open(contentImgsCache).then(cache =>{
      return cache.match(request).then(response =>{
        if(response) return response;

        return fetch(request).then(networkResponse =>{
          cache.put(request,networkResponse.clone());
          return networkResponse;
        });
      });
    });
  }

  self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });