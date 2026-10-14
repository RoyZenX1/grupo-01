import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';

import { routes } from './app.routes';

registerLocaleData(localeEsPe);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(
            routes,
            // Al cambiar de página se vuelve al inicio del contenido
            withInMemoryScrolling({ scrollPositionRestoration: 'top' })
        ),
        provideHttpClient(),
        { provide: LOCALE_ID, useValue: 'es-PE' }
    ]
};
