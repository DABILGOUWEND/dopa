import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, input, Input, OnDestroy, OnInit, output, Output, signal, TemplateRef } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { AuthenService } from '../../authen.service';
import { TaskService } from '../../task.service';
import { GasoilComponent } from '../../components/gasoil/gasoil.component';

import { EnginsStore, GasoilStore, ProjetStore } from '../../store/appstore';
import { Router } from '@angular/router';
import { DataLoaderService } from '../../services/data-loader.service';

@Component({
  selector: 'app-home-template',
  imports: [NgTemplateOutlet, ImportedModule],
  templateUrl: './home-template.component.html',
  styleUrl: './home-template.component.scss'
})
export class HomeTemplateComponent implements OnInit{
  _loader_service = inject(DataLoaderService);
  constructor() {
    effect(() => {
      //  console.log(this.projets())  
    }
    )
  }

  nav_liste = input.required<TemplateRef<any>>();
  toolbar = input.required<TemplateRef<any>>();
  content = input.required<TemplateRef<any>>();
  _auth_service = inject(AuthenService);
  _projet_store = inject(ProjetStore);
  router = inject(Router);
  _router = inject((Router));
  selected_projet_id = signal<string | undefined>('');

  ngOnInit() {
  }
  choix_projet(data: any) {
    this._auth_service.current_projet_id.set(data.value);
    this._loader_service.setPath();
    this._loader_service.loadDataInit();
    this._loader_service.Load_gestion_Data();
    this._loader_service.Load_travaux_Data();

  }
  logout() {
    if (this._auth_service._auth.currentUser != null) {
      console.log(this._auth_service._auth.currentUser)
      this._auth_service.logout().subscribe()
    } else {
      localStorage.removeItem('user');
      this.router.navigateByUrl('/login')
      this._auth_service.userSignal.set(undefined);
      this._auth_service.current_projet_id.set(undefined);
    }

  }

  //computed properties
  projets = computed(() => {
    return this._projet_store.donnees_projet().filter(x => {
      return this._auth_service.userSignal()?.projet_id.includes(x.id)
    }).map(x => {
      return {
        id: x.id,
        intitule: x.intitule
      }
    })
  })
  click_admin() {
    this._router.navigateByUrl('admin');
  }
}
