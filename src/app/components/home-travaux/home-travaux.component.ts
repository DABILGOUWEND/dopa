import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ImportedModule } from '../../modules/imported/imported.module';
import { AuthenService } from '../../authen.service';
import { HomeTemplateComponent } from '../../utilitaires/home-template/home-template.component';
import { AttachementStore, ConstatStore, DecompteStore, DevisStore, LigneDevisStore, ProjetStore, SstraitantStore } from '../../store/appstore';
import { DataLoaderService } from '../../services/data-loader.service';
import { sign } from 'crypto';

@Component({
  selector: 'app-home-travaux',
  standalone: true,
  imports: [RouterOutlet, ImportedModule, HomeTemplateComponent],
  templateUrl: './home-travaux.component.html',
  styleUrl: './home-travaux.component.scss'
})
export class HomeTravauxComponent implements OnInit {


  _auth_service = inject(AuthenService);
  _loader_service = inject(DataLoaderService);
  _router = inject(Router);
  end_of_load = signal(true);

  ngOnInit() {
    this._loader_service.setPath();
    this._loader_service.loadDataInit();
    this._loader_service.Load_travaux_Data().subscribe({
      complete: () => {
        setTimeout(() => {
          this.end_of_load.set(false);
        }, 2000);
      } 
    });

    }

  logout() {
    this._auth_service.logout().subscribe();
  }
  accueil() {
    this._router.navigateByUrl('/home');
  }
  click_devis() {
    this._router.navigateByUrl('home_travaux/devis');
  }
  click_constats() {
    this._router.navigateByUrl('home_travaux/constats');
  }
  click_attachements() {
    this._router.navigateByUrl('home_travaux/attachements');
  }
}
