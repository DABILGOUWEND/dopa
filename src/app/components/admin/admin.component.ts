import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { __importDefault } from 'tslib';
import { ImportedModule } from '../../modules/imported/imported.module';
import { HomeTemplateComponent } from '../../utilitaires/home-template/home-template.component';
import { ApproGasoilStore, ClasseEnginsStore, CompteStore, EnginsStore, EntrepriseStore, GasoilStore, PannesStore, PersonnelStore, ProjetStore, StatutStore, TachesEnginsStore, TachesStore, UserStore } from '../../store/appstore';
import { AuthenService } from '../../authen.service';
import { TaskService } from '../../task.service';
import { DataLoaderService } from '../../services/data-loader.service';
import { concat } from 'rxjs';

@Component({
    selector: 'app-admin',
    imports: [RouterOutlet, ImportedModule, HomeTemplateComponent],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {

  _router = inject(Router);
  _loader_service = inject(DataLoaderService);

  ngOnInit() {
    this._loader_service.setPath();
    this._loader_service.loadDataInit();
    let obs1 = this._loader_service.Load_gestion_Data();
    let obs2 = this._loader_service.Load_travaux_Data();
    concat(obs1, obs2).subscribe();
  }
  click_home() {
    this._router.navigateByUrl('/home');
  }
  click_register() {
    this._router.navigateByUrl('admin/register');
  }
  click_tableau_bord() {
    this._router.navigateByUrl('admin/tableau_bord');
  }
  click_devis() {
    this._router.navigateByUrl('admin/devis');
  }

}
