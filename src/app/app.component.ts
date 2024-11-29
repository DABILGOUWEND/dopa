import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImportedModule } from './modules/imported/imported.module';
import { AuthenService } from './authen.service';
import { Auth } from '@angular/fire/auth';
import { ApproGasoilStore, AttachementStore, ClasseEnginsStore, CompteStore, ConstatStore, DatesStore, DecompteStore, DevisStore, EnginsStore, EntrepriseStore, GasoilStore, LigneDevisStore, PannesStore, PersonnelStore, ProjetStore, SstraitantStore, StatutStore, TachesEnginsStore, TachesStore } from './store/appstore';
import { TaskService } from './task.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ImportedModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit,OnDestroy {
 
  
  _auth_service = inject(AuthenService);

  constructor() {
   this._auth.onAuthStateChanged(
      (userCredential) => {
        if (userCredential)
          this._auth_service.handleCreateUser(userCredential);
      })  
  }
  ngOnDestroy() {
  }
    


  _auth = inject(Auth)
  ngOnInit() {
   
    this._auth_service.autoLogin();
  }
}
