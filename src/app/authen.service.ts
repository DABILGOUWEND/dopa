import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, tap } from 'rxjs';
import { Users } from './models/modeles';
import { Router } from '@angular/router';
import { UserStore } from './store/appstore';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenService {
  isloggedIn: boolean = false
  router = inject(Router)
  user_store = inject(UserStore)

  is_connected = signal<Users | undefined | null>(undefined)

  login(name: string, password: string): Observable<boolean> {
    let users = this.user_store.users()
    let identifiants = users.map(x => x.identifiant)
    let motdepasses = users.map(x => x.mot_de_passe)
    let niveau = users.map(x => x.niveau)
    let ind = identifiants.indexOf(name, 0)
    let isloggedIn = false
    let is_connect = undefined
    if (ind == -1) {
      isloggedIn = false
    }
    else {
      if (motdepasses[ind] == password) {
        if(niveau[ind]==this.user_store.getNivo() || niveau[ind]==3)
        {
          isloggedIn = true
          is_connect = {
            id: '',
            identifiant: name,
            mot_de_passe: password,
            niveau: niveau[ind]
          }
        }
        else
        {
          this.user_store.setNivo(niveau[ind])
          this.user_store.setUrl('/accueil')
          isloggedIn = true
          is_connect = {
            id: '',
            identifiant: name,
            mot_de_passe: password,
            niveau: niveau[ind]
          }
        }
          

      }
      else {
        isloggedIn = false
      }
    }
    return of(isloggedIn).pipe(
      delay(1000),
      tap(isloggedIn => {
        this.isloggedIn = isloggedIn;
        this.is_connected.set(is_connect)
      }
      )
    )
  }

  logout() {
    this.isloggedIn = false
    this.router.navigateByUrl('/login')
    this.is_connected.set(undefined)
  }


}
