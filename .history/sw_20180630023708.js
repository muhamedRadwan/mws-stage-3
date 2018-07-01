var CachVersion = 'restaurant-stage-2';
var CacheRestaurant = 'restaurant-restaurants';
var contentImgsCache = 'restaurant-content-imgs';
var allCaches = [CachVersion, contentImgsCache, CacheRestaurant];
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
    // if (requestUrl.pathname.startsWith('/restaurants/')) {
    //   return;
    // }
    if(requestUrl.pathname.startsWith('/img/')){
      event.respondWith(servPhoto(event.request));
      return;
    }
  
    event.respondWith(
      caches.open(CachVersion).then(function(cache) {
        return cache.match(event.request).then(function (response) {
          return response || fetch(event.request).then(function(response) {
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

  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });