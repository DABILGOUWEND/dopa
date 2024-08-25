import { Component, inject, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ConstatStore, LigneDevisStore, DevisStore, SstraitantStore, AttachementStore, DecompteStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { EntreprisesPipe } from '../../entreprises.pipe';

@Component({
  selector: 'app-decomptes',
  standalone: true,
  imports: [ImportedModule,EntreprisesPipe],
  templateUrl: './decomptes.component.html',
  styleUrl: './decomptes.component.scss'
})
export class DecomptesComponent implements OnInit {
  _decomptes_Store = inject(DecompteStore);
  _constat_store = inject(ConstatStore);
  _ligneDevis_Store = inject(LigneDevisStore);
  _devisStore = inject(DevisStore);
  _service = inject(WenService);
  _sstrce_Store = inject(SstraitantStore);
  _attachements_Store = inject(AttachementStore);
  _sousTraitance_Store = inject(SstraitantStore);

  ///signals
  is_table_opened = signal(false)
  selected_devis = signal('')
  selected_attach= signal('')
  selected_poste_id = signal('')
  is_table_updated = signal(false)
  entreprise_id = signal('')


  ngOnInit(){
   this._decomptes_Store.loadAllDecomptes()
   this._attachements_Store.loadAttachements()
   this._devisStore.loadDevis()
   this._sousTraitance_Store.loadSstraitants()
   this._ligneDevis_Store.loadLigneDevis()
  }

  selectChangeDevis(id: string) {
    this._attachements_Store.filtrebyDevisId(id)
  }
  selectChangeAttachement(id: string) {
  }

}
