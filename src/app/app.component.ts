import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImportedModule } from './modules/imported/imported.module';
import { AuthenService } from './authen.service';
import { Auth, authState, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { get } from 'node:http';

@Component({
  selector: 'app-root',
  imports: [ImportedModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  ready = false;
  _auth_service = inject(AuthenService);
  _auth = getAuth();
  constructor() {
    onAuthStateChanged(this._auth, (userCredential) => {
        console.log(userCredential);
        if (userCredential) {
          //this._auth_service.handleCreateUser(userCredential);
        }
      })
  }
  ngOnInit() {
    this._auth_service.autoLogin();
  }
}
