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
import { Auth, authState } from '@angular/fire/auth';
import { HomeTemplateComponent } from '../../utilitaires/home-template/home-template.component';
import { DataLoaderService } from '../../services/data-loader.service';
import { set } from 'firebase/database';
export const APP_Is = 'AIzaSyBsK6a4cgI9g94bdY050vnuI3BP3ejiiXE';
@Component({
  selector: 'app-home',
  imports: [ImportedModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  _auth_service = inject(AuthenService);
  _loader_service = inject(DataLoaderService);
  end_of_load = signal(true);
  ngOnInit() {
    console.log('home');
    this._loader_service.setPath();
    this._loader_service.loadDataInit();
    let obs1 = this._loader_service.Load_gestion_Data();
    let obs2 = this._loader_service.Load_travaux_Data();
    concat(obs1, obs2).subscribe({
      complete: () => {
        setTimeout(() => {
          this.end_of_load.set(false);
        }, 2000);
      }
    });

  }
}
