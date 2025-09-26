import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners } from './core/error/error-handler';
import { routes } from './app.routes';
import { materialConfig, materialModules } from './material.config';
import { provideAnimations } from '@angular/platform-browser/animations';

// Combine all providers
const providers = [
  // Core providers
  provideBrowserGlobalErrorListeners(),
  provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  provideHttpClient(
    withInterceptorsFromDi(),
    // Add any interceptors here if needed
    // withInterceptors([yourInterceptor])
  ),
  
  // Material and animations
  provideAnimations(),
  ...materialConfig.providers,
  
  // Import Material modules
  importProvidersFrom([...materialModules])
];

export const appConfig: ApplicationConfig = {
  providers: providers
};
