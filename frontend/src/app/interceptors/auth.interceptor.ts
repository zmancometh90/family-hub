import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add auth headers to API requests
    if (req.url.startsWith('/api/')) {
      const authHeaders = this.authService.getAuthHeaders();
      
      // Clone the request and add authorization header if available
      if (authHeaders.get('Authorization')) {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', authHeaders.get('Authorization')!)
        });
        return next.handle(authReq);
      }
    }
    
    return next.handle(req);
  }
}