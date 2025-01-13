import { APP_ID, Component, computed, effect, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { ApproGasoilStore, ClasseEnginsStore, CompteStore, EnginsStore, EntrepriseStore, GasoilStore, PannesStore, PersonnelStore, ProjetStore, StatutStore, TachesStore, UserStore } from '../../store/appstore';
import { AuthenService } from '../../authen.service';
import { ImportedModule } from '../../modules/imported/imported.module';
import { Router, RouterOutlet } from '@angular/router';
import { concat, forkJoin, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { v4 as uuid } from 'uuid';
import { TaskService } from '../../task.service';
import { WenService } from '../../wen.service';
import { EnginsComponent } from '../engins/engins.component';
import { Auth, authState, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { HomeTemplateComponent } from '../../utilitaires/home-template/home-template.component';
import { DataLoaderService } from '../../services/data-loader.service';
import { set } from 'firebase/database';
import { on } from 'node:events';
export const APP_Is = 'AIzaSyBsK6a4cgI9g94bdY050vnuI3BP3ejiiXE';
@Component({
  selector: 'app-home',
  imports: [ImportedModule, HomeTemplateComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  auth = getAuth();
  router = inject(Router);
  constructor() {

    authState(this.auth).subscribe((resp: any) => {
      if (resp != null) {
        this.end_of_load.set(false);
        this._loader_service.setPath();
        this._loader_service.loadDataInit();
      }
    }
    )
    effect(() => {
      console.log(this._auth_service.userSignal()?.uid)
    }
    )

  }
  _auth_service = inject(AuthenService);
  _loader_service = inject(DataLoaderService);
  end_of_load = signal(true);
  ngOnInit() {


  }
}
