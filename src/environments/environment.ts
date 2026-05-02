export const environment = {
  production: false,
  strava: {
    clientId: '233951',
    clientSecret: '674e49e3031cd6201b5821c6cc3a559d783a3687',
    redirectUri: 'http://localhost:4200/callback',
    authorizeUrl: 'https://www.strava.com/oauth/authorize',
    tokenUrl: '/oauth/token' // Using proxy
  }
};
