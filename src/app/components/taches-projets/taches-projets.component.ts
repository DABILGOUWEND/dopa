import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SaisiComponent } from '../../utilitaires/saisi/saisi.component';
import { ProjetStore, TacheProjetStore, TachesStore, UnitesStore } from '../../store/appstore';
import { MatTableDataSource } from '@angular/material/table';
import { sign } from 'node:crypto';

@Component({
  selector: 'app-taches-projets',
  standalone: true,
  imports: [ImportedModule, SaisiComponent],
  templateUrl: './taches-projets.component.html',
  styleUrl: './taches-projets.component.scss'
})
export class TachesProjetsComponent implements OnInit {
  ngOnInit() {
    this._projetStore.loadProjets();
    this._tachesStore.loadTaches();
    this._tachesProjetStore.loadTachesProjet();
    this._unitesStore.loadUnites();
  }
  _projetStore = inject(ProjetStore);
  _tachesStore = inject(TachesStore);
  _tachesProjetStore = inject(TacheProjetStore);
  _unitesStore = inject(UnitesStore);

  is_update = signal(false)
  is_open = signal(false);
  selected_projet_id = signal('');
  projet=signal<string|undefined>('');
  tache=signal<string|undefined>('');
  selected_tache_id = signal('');
  quantiteDqe = signal('');
  _fb = inject(FormBuilder)
  
  table_update_form: FormGroup = this._fb.group(
    {
      id:new FormControl(''),
      quantiteDqe: new FormControl(0,  [Validators.required, Validators.min(1)]),
      projet_id: new FormControl('',  Validators.required),
      tache_id: new FormControl('',  Validators.required),
      unite: new FormControl({ value: '', disabled: true }),
    }
  );

  is_table_being_updated = false
  is_new_row_being_added = false
  columnsToDisplay = ['designation', 'unite', 'quantiteDqe', 'actions'];
  dataSource = computed(() => {
    let donnees: any = [];
    this._tachesProjetStore.donnees_taches_projet().forEach(element => {
      let taches = this._tachesStore.taches_data().find(x => x.id == element.tacheId);
      let unites = this._unitesStore.unites_data().find(x => x.id == taches?.uniteid);
      donnees.push(
        {
          'id': element.id,
          'projet_id':element.projetId,
          'tache_id':element.tacheId,
          'designation': taches?.designation,
          'unite': unites?.unite,
          'quantiteDqe': element.quantiteDqe,
        }
      )
    });
    return new MatTableDataSource<any>(donnees)
  })

  updateTableData() {
  
    let value=this.table_update_form.value;
    if(this.is_update())
    {
      this._tachesProjetStore.updateTacheProjet({
        'id':value.id,
        'projetId': value.projet_id,
        'tacheId': value.tache_id,
        'quantiteDqe': Number(value.quantiteDqe)
      });
    }else
    {
      this._tachesProjetStore.addTacheProjet({
        'projetId': value.projet_id,
        'tacheId': value.tache_id,
        'quantiteDqe': Number(value.quantiteDqe)
      });
    }
    this.is_open.set(false);
    this._tachesProjetStore.filtrebyProjetId(value.projet_id);
    this.projet.set(this._projetStore.projets_data().find(x=>x.id==value.projet_id)?.intitule);
  }
  annuler() {
    this.is_open.set(false);
  }
  choiceProjet(data: any) {
    this._tachesProjetStore.filtrebyProjetId(this.selected_projet_id());
    this.projet.set(this._projetStore.projets_data().find(x=>x.id==this.selected_projet_id())?.intitule);
  }
  selectChangeProjet(data: any) {
     this.table_update_form.get('unite')?.setValue('');
  }
  selectChangeTache(tache_id: any) {
    this._tachesProjetStore.filtrebyTacheId(this.selected_tache_id());
    this.tache.set(this._tachesStore.taches_data().find(x=>x.id==this.selected_tache_id())?.designation);
    let taches = this._tachesStore.taches_data().find(x => x.id ==tache_id);
    let unites = this._unitesStore.unites_data().find(x => x.id == taches?.uniteid);
    this.table_update_form.get('unite')?.setValue(unites?.unite)
  }
  ajouter_tache() {
    this.is_open.set(true);
    this.is_update.set(false);
    this.table_update_form.reset()
  }
  edit(data: any) {
   
    this.is_open.set(true);
    this.is_update.set(true);
    this.table_update_form.patchValue(data);
  }
  delete(id: string) {
    if (confirm("Voulez-vous supprimer cet élement?"))
      this._tachesProjetStore.removeTacheProjet(id);
  }
}
