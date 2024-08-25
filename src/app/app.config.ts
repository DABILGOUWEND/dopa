import { ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import{provideAnimationsAsync} from '@angular/platform-browser/animations/async'

export const appConfig: ApplicationConfig = {
  
  providers: [
  {
    provide: LOCALE_ID,
    useValue: 'fr-FR' // 'de' for Germany, 'fr' for France ...
  },
  {
    provide: DEFAULT_CURRENCY_CODE,
    useValue: ''
  },
  provideRouter(routes), 
  provideHttpClient(withFetch()),
  provideClientHydration(),
  provideAnimationsAsync(),
  provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"mon-projet-35c49","appId":"1:126234609649:web:43dee76fe88462b4be2650","storageBucket":"mon-projet-35c49.appspot.com","apiKey":"AIzaSyBsK6a4cgI9g94bdY050vnuI3BP3ejiiXE","authDomain":"mon-projet-35c49.firebaseapp.com","messagingSenderId":"126234609649"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideAnimationsAsync(), provideClientHydration(), provideClientHydration()]
};
