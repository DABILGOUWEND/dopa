import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenService } from './authen.service';
import { UserStore } from './store/appstore';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthenService);
  const router = inject(Router);
  const user_store = inject(UserStore)
  let nivo = auth.is_connected()?.niveau

  if (nivo != undefined) {
    if (user_store.getNivo() == 0) {
      return true
    }
    else {
      if (nivo == user_store.getNivo() || nivo == 3) {
        return true
      }
      else {
        alert("Vos droits sont limités!! adressez vous à l'Administrateur")
        return false
      }
    }

  }
  else {
    router.navigateByUrl('/login')
    return false
  }
};
