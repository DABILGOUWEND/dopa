import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { HomeTemplateComponent } from '../../utilitaires/home-template/home-template.component';
import { AuthenService } from '../../authen.service';
import { Router, RouterOutlet } from '@angular/router';
import { EnginsStore, ClasseEnginsStore, PersonnelStore, ProjetStore, CompteStore, PannesStore, GasoilStore, ApproGasoilStore, StatutStore, TachesStore } from '../../store/appstore';
import { TaskService } from '../../task.service';
import { DataLoaderService } from '../../services/data-loader.service';


@Component({
    selector: 'app-gestion',
    imports: [ImportedModule, HomeTemplateComponent, RouterOutlet],
    templateUrl: './gestion.component.html',
    styleUrl: './gestion.component.scss'
})
export class GestionComponent implements OnInit {
  end_of_load = signal(true);
  titre=signal("Gestion du Gasoil");
  ngOnInit() {
    
    //load data
    this._loader_service.setPath();
    this._loader_service.loadDataInit();
    this._loader_service.Load_gestion_Data().subscribe({
      complete: () => {
        this.end_of_load.set(false);
      }
    });
    
  }
  constructor() {
    effect(() => {
    })
  }
  //injections

  _auth_service = inject(AuthenService);
  _router = inject(Router);
  _loader_service = inject(DataLoaderService);

  logout() {
    this._auth_service.logout().subscribe();
  }
  click_accueil() {
    this._router.navigateByUrl('/home');
  }
  click_gasoil() {
    this._router.navigateByUrl('home_gestion/gasoil')
  }
  click_pannes() {
    this._router.navigateByUrl('home_gestion/pannes')
  }
  click_pointages() {
    this._router.navigateByUrl('home_gestion/pointages')
  }
}
