import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenService } from './authen.service';
import { WenService } from './wen.service';

export const gestionGuard: CanActivateFn = (route, state) => {
  const _service = inject(WenService);
  const _auth_service = inject(AuthenService);
  const router = inject(Router);
  if (_auth_service.userSignal() && (_auth_service.userSignal()?.role == "admin" ||_auth_service.userSignal()?.role == "user1")) {
    return true;
  } else {

    return false;
  }
};
