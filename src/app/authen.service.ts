import { Inject, Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { Observable, Subscription, from, map, of, tap } from 'rxjs';
import { Users } from './models/modeles';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { collection, collectionData, deleteDoc, Firestore, setDoc } from '@angular/fire/firestore';
import { WenService } from './wen.service';
import { browserLocalPersistence, browserSessionPersistence, getAuth, setPersistence, signInWithCustomToken } from 'firebase/auth';
import { Database } from '@angular/fire/database';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { and, doc, getDoc } from 'firebase/firestore';

import { isPlatformBrowser, NumberSymbol } from '@angular/common';
import { DataLoaderService } from './services/data-loader.service';
import { time } from 'node:console';
import { set } from 'firebase/database';

const apiKey = environment.firebaseConfig.apiKey;
@Injectable({
  providedIn: 'root'
})
export class AuthenService {
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId)
  }
  ngUnsubscribe: Subscription = new Subscription();

  platformId = inject(PLATFORM_ID)
  isBrowser: boolean;
  router = inject(Router);
  _auth = inject(Auth);

  _http = inject(HttpClient);
  database = inject(Database);
  _firestore = inject(Firestore);
  _service = inject(WenService);
  db: Firestore = inject(Firestore);
  token = signal('');
  loadings = signal(false);
  userSignal = signal<Users | undefined>(undefined);
  affichage = signal<string | null | undefined>('')
  current_projet_id = signal<string | undefined>("1");
  list_projet = signal<string[]>([]);
  message = signal('déconnecté')


  register(email: string, password: string, role: string, nom: string, entreprise_id: string, projet_id: string[]): Observable<any> {
    return this._http.post('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + apiKey,
      {
        email: email,
        password: password
      }
    ).pipe(tap((resp: any) => {
      let userId = resp.localId;

      let data = {
        id: userId,
        email: resp.email,
        username: nom,
        role: role,
        entreprise_id: entreprise_id,
        projet_id: projet_id
      }
      this.addUser(data).subscribe()
    }))
  };
  loginFirebase(email: string, password: string): Observable<any> {

    this.loadings.set(true);
    const auth = getAuth();
    return from(this._auth.setPersistence(browserLocalPersistence).then(() => {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          this.affichage.set(user.email);
          this.handleCreateUser(user);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        })
    }))
  }
  logout(): Observable<any> {
    let promise = signOut(this._auth).then(() => {

    })
      .catch((error) => {
        console.log('error', error)
      })

    return from(promise).pipe(tap({
      next: () => {
        setTimeout(() => {
          localStorage.removeItem('user');
          this.router.navigateByUrl('/accueil')
          this.userSignal.set(undefined);
          this.current_projet_id.set(undefined);
        }
          , 2000);
      }
    }))
  }

  autoLogin() {
    if (this.isBrowser) {
      let data = localStorage.getItem('user');
      console.log('data', data)
      if (data) {
        const dataparse = JSON.parse(data);
        this.userSignal.set(dataparse);
        this.current_projet_id.set(this.userSignal()?.current_projet_id);
      }
    }
  }
  handleCreateUser(users: any) {
    let new_user: Users = {
      uid: user.uid,
      email: user.email,
      token: this.token(),
      role: '',
      entreprise_id: '',
      projet_id: [''],
      current_projet_id: '',
      username: ''
    }
    //this.userSignal.set(new_user);
   
    if (environment.production) {
      this.getallUsersByUid(users.uid).pipe(
        tap(
          (resp: any) => {
            let data = resp.data();
            this.userSignal.update(
              (user: any) =>
              (
                {
                  'uid': users.uid,
                  'email': users.email,
                  'token': this.token(),
                  'role': data.role,
                  'username': data.username,
                  'entreprise_id': data.entreprise_id,
                  'projet_id': data.projet_id,
                  'current_projet_id': data.projet_id[0]
                }
              )
            )
            localStorage.setItem('user', JSON.stringify(this.userSignal()));
            this.current_projet_id.set(data.projet_id[0]);

          }
        )
      ).subscribe()
    } else {
      this.getallUsersByuidJson(user.uid).subscribe(resp => {
        if (resp) {
          this.userSignal.update(
            (user: any) =>
            (
              {
                ...user,
                'role': resp.role,
                'entreprise_id': resp.entreprise_id,
                'projet_id': resp.projet_id,
                'current_projet_id': resp.projet_id[0]
              }
            )
          )
          localStorage.setItem('user', JSON.stringify(this.userSignal()));
          this.current_projet_id.set(resp.projet_id[0]);
        }
      })
    }


  }


  getallUsersByuidJson(uid: string): Observable<Users | undefined> {
    return this._http.get<Users[]>('http://localhost:3000/users').pipe(map(resp => resp.find(x => x.uid == uid)))
  }
  lodal_apiUrl = computed(() => {
    let api = environment.apiUrl;
    return api
  })

  //users
  getallUsers(): Observable<any[]> {
    const UsersCollection = collection(this.db, 'myusers');
    let collect = collectionData(UsersCollection, { idField: 'id' }) as Observable<any[]>
    return collect
  }
  addUser(data: any): Observable<any> {
    const docRef = setDoc(doc(this.db, 'myusers/' + data.id), data)
    return from(docRef)
  }
  deleteUser(id: string): Observable<void> {
    const docRef = doc(this.db, 'myusers/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  getallUsersByUid(uid: string): Observable<any> {
    const docRef = doc(this.db, "myusers", uid);
    const docSnap = getDoc(docRef);
    return from(docSnap)
  }

  //projets

}
