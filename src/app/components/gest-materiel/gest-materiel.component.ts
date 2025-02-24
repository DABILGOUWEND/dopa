import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AuthenService } from '../../authen.service';
import { DataLoaderService } from '../../services/data-loader.service';
import { ImportedModule } from '../../modules/imported/imported.module';
import { HomeTemplateComponent } from '../../utilitaires/home-template/home-template.component';

@Component({
  selector: 'app-gest-materiel',
  imports: [ImportedModule,HomeTemplateComponent,RouterOutlet],
  templateUrl: './gest-materiel.component.html',
  styleUrl: './gest-materiel.component.scss'
})
export class GestMaterielComponent implements OnInit {
end_of_load = signal(true);
  titre=signal('');
  ngOnInit() {
    
    //load data
    this._loader_service.setPath();
    this._loader_service.loadDataInit();
    this._loader_service.Load_gestion_Data().subscribe({
      complete: () => {
        this.end_of_load.set(false);
      }
    });
    this.route.data.subscribe(data => {
      this.titre.set( this.route.snapshot.data['title']);
    }
    )
    
  }
  constructor(
    private route: ActivatedRoute
  ) {
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
