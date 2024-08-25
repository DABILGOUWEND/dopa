import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ImportedModule } from './modules/imported/imported.module';
import { UserStore } from './store/appstore';
import { AuthenService } from './authen.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ImportedModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'wenbtp';
  router = inject(Router)
  users_store = inject(UserStore)
  _auth_service = inject(AuthenService)

  ngOnInit() {
    this.users_store.loadUsers()
  }
  click_login() {
    this.router.navigateByUrl('/login')
    this.users_store.setUrl('/accueil')
  }
  logout() {
    this._auth_service.logout()
  }
  click_gasoil() {
    this.router.navigateByUrl('/gasoil')
    this.users_store.setUrl('/gasoil'),
      this.users_store.setNivo(1)
  }
  click_pointage() {
    this.router.navigateByUrl('/pointage')
    this.users_store.setUrl('/pointage')
    this.users_store.setNivo(1)
  }
  click_pannes() {
    this.users_store.setNivo(1)
    this.router.navigateByUrl('/pannes')
    this.users_store.setUrl('/pannes')
    
  }
  click_travaux() {
    this.users_store.setNivo(1)
    this.router.navigateByUrl('/travaux')
    this.users_store.setUrl('/travaux')
  
  }
  click_accueil() {
    this.users_store.setNivo(0)
    this.router.navigateByUrl('/accueil')
    this.users_store.setUrl('/accueil')
 
  }
  prestation() {
    this.users_store.setNivo(2)
    this.router.navigateByUrl('/prestation')
    this.users_store.setUrl('/prestation')
    
  }
}
