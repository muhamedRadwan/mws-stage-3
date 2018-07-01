var CachVersion = 'restaurant-stage-2';
var contentImgsCache = 'restaurant-content-imgs';

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
        './index.html',
        './restaurant.html',
        './css/',
        './js/',
        './img/'
    ];
    event.waitUntil(
        caches.open(CachVersion).then(cache => {
          return  cache.addAll(CachedList);
        })
    );
});
self.addEventListener('activate',  event => {
    event.waitUntil(self.clients.claim());
  });
  
  self.addEventListener('fetch', event => {
    var requestUrl = new URL(event.request.url);
    if(requestUrl.origin == location.origin){
      if(requestUrl.pathname == '/photos/')
    }
    event.respondWith(
      caches.match(event.request).then(response => {
        return response ? response : fetch(event.request);  
      })
    );
  });