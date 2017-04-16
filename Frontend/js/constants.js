angular.module('iot')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT', {
     url: 'http://10.23.12.53:8085/api' //adresse de l'API REST
});
