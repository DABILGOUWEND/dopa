import { Component, inject, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { Router, RouterOutlet } from '@angular/router';
import { AttachementStore, ConstatStore, DevisStore, LigneDevisStore, SstraitantStore, UserStore } from '../../store/appstore';
import { SousTraitanceComponent } from '../sous-traitance/sous-traitance.component';
import { AttachementsComponent } from '../attachements/attachements.component';
import { ConstatsComponent } from "../constats/constats.component";
import { WenService } from '../../wen.service';
import { DecomptesComponent } from '../decomptes/decomptes.component';

@Component({
  selector: 'app-prestation',
  standalone: true,
  imports: [ImportedModule, SousTraitanceComponent, AttachementsComponent, PrestationComponent, ConstatsComponent,DecomptesComponent],
  templateUrl: './prestation.component.html',
  styleUrl: './prestation.component.scss'
})
export class PrestationComponent implements OnInit {
  router = inject(Router)
  users_store = inject(UserStore)
  _constat_store = inject(ConstatStore)
  _ligneDevis_Store = inject(LigneDevisStore)
  _devisStore = inject(DevisStore)
  _service = inject(WenService)
  _sstrce_Store = inject(SstraitantStore)
  _attachements_Store = inject(AttachementStore)

  is_click_devis = signal(false)
  is_click_constat = signal(false)
  is_click_attach = signal(false)
  is_click_decompte = signal(false)
  ngOnInit() {

  }

  click_devis() {
    this.is_click_devis.set(true)
    this.is_click_constat.set(false)
    this.is_click_attach.set(false)
    this.is_click_decompte.set(false)
    this._attachements_Store.filtrebyDevisId('');
    this._constat_store.filtrebyDevisId('');

    this._ligneDevis_Store.filtrebyDevis('')
  }

  click_constat() {
    this.is_click_devis.set(false)
    this.is_click_constat.set(true)
    this.is_click_attach.set(false)
    this.is_click_decompte.set(false)
    this._attachements_Store.filtrebyDevisId('');
    this._constat_store.filtrebyDevisId('');
    this._ligneDevis_Store.filtrebyDevis('')
    this._constat_store.filtrebyPosteId('')
  }

  click_attach() {
    this.is_click_devis.set(false)
    this.is_click_constat.set(false)
    this.is_click_attach.set(true)
    this.is_click_decompte.set(false)
    this._ligneDevis_Store.filtrebyDevis('')
  }
  click_decompte()
  {
    this.is_click_devis.set(false)
    this.is_click_constat.set(false)
    this.is_click_attach.set(false)
    this.is_click_decompte.set(true)
    this._ligneDevis_Store.filtrebyDevis('')
  }

}
