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
  event.waitUntil(
    // Open the cache
    caches.open(CachVersion).then(function(cache) {
//
    // Add all the default files to the cache
    return cache.addAll([
        '/',
        '/img/icon.png',
        'bundle_js/main_bundle.js',
        'bundle_js/maps/main_bundle.js.map',
        'bundle_js/maps/restaurant_bundle.js.map',
        'bundle_js/restaurant_bundle.js',
        'css/styles.css',
        'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css',
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
      ]).catch((error) => console.log("caches open : " ,error));
    })
  ); // end event.waitUntil
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
    if (requestUrl.pathname.startsWith('/restaurants/')) {
      return;
    }
    if(requestUrl.pathname.startsWith('/img/')){
      event.respondWith(servePhoto(event.request));
      return;
    }
  
    event.respondWith(
      caches.open(contentCache).then(function(cache) {
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
      cache.match(request).then(response =>{
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