var CachVersion = 'restaurant-stage-2';
var contentImgsCache = 'restaurant-content-imgs';
var allCaches = [CachVersion, contentImgsCache];
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }

self.addEventListener('install',function(event){
    var CachedList = [
        '/',
        './css/',
        './js/',
    ];
    event.waitUntil(
        caches.open(CachVersion).then(cache => {
          return  cache.addAll(CachedList);
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
    if(requestUrl.origin == location.origin){
      if(requestUrl.pathname == '/img/'){
        event.respondWith(servPhoto(event.request));
        return;
      }
      else{
        return caches.open(CachVersion).then(cache =>{
          cache.match(event.request).then(respone =>{
            if(respone) return response;
    
            return fetch(event.request).then(response =>{
              cache.put(event.request,respone.clone());
              return respone;
            });
          });
        });
      }
    }
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      });
    );
  });


  function servPhoto(request){
    var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');
    return caches.open(contentImgsCache).then(cache =>{
      cache.match(storageUrl).then(respone =>{
        if(respone) return response;

        return fetch(event.request).then(response =>{
          cache.put(storageUrl,respone.clone());
          return respone;
        });
      });
    });
  }

  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });