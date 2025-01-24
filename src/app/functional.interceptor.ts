import { HttpErrorResponse, HttpInterceptorFn, HttpParams, HttpHandler } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { catchError, tap, throwError } from 'rxjs';
import { AuthenService } from './authen.service';

export const functionalInterceptor: HttpInterceptorFn = (req, next) => {
    const _authservice = inject(AuthenService);
    if (_authservice.userSignal()) {
      let token = _authservice.userSignal()?.token;
      return next(
        req.clone(
          {
            headers: req.headers.set('Authorization', token?'Bearer '+token:'Bearer '+'')
          }
        )
      ).pipe()
    }
    else {
      return next(req);
    }
  
};
