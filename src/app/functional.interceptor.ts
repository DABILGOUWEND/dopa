import { HttpErrorResponse, HttpInterceptorFn, HttpParams, HttpHandler } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { catchError, tap, throwError } from 'rxjs';
import { AuthenService } from './authen.service';

export const functionalInterceptor: HttpInterceptorFn = (req, next) => {

    return next(req);
  
};
