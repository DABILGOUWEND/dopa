import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, input, Input, OnDestroy, OnInit, output, Output, signal, TemplateRef } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { AuthenService } from '../../authen.service';
import { TaskService } from '../../task.service';
import { GasoilComponent } from '../../components/gasoil/gasoil.component';

import { EnginsStore, GasoilStore, ProjetStore } from '../../store/appstore';
import { Router } from '@angular/router';
import { DataLoaderService } from '../../services/data-loader.service';
import { sign } from 'node:crypto';
import { tap } from 'rxjs';
import { set } from 'firebase/database';
import { authState } from '@angular/fire/auth';

@Component({
  selector: 'app-home-template',
  imports: [NgTemplateOutlet, ImportedModule],
  templateUrl: './home-template.component.html',
  styleUrl: './home-template.component.scss'
})
export class HomeTemplateComponent implements OnInit {
  _loader_service = inject(DataLoaderService);
  constructor() {

    effect(() => {
    }
    )
  }
  affiche = signal(false);

  nav_liste = input<TemplateRef<any>|null>(null );
  content = input.required<TemplateRef<any>>();
  footer = input<TemplateRef<any>|null>(null );
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
    this._loader_service.Load_gestion_Data().subscribe();
    this._loader_service.Load_travaux_Data().subscribe();

  }
  logout() {
    this.affiche.set(true);
    this._auth_service.message.set('déconnexion en cours....');
    this._auth_service.logout().subscribe({
      next: () => {
        setTimeout(() => {
          this._auth_service.message.set('vous êtes déconnecté');
          this.router.navigateByUrl('/login');
        }, 2000);
      }
    })

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
