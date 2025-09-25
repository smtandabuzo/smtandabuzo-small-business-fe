import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error | HttpErrorResponse) {
    if (error instanceof HttpErrorResponse) {
      // Server-side error
      console.error('Server Error:', error);
      // You can add more sophisticated error handling here (e.g., show notification)
    } else {
      // Client-side error
      console.error('Client Error:', error);
    }
  }
}

export function provideBrowserGlobalErrorListeners() {
  return [
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ];
}
