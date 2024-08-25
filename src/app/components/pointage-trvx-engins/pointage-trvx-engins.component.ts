import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ClasseEnginsStore, EnginsStore, Pointage_trvx_enginsStore, ProjetStore, TachesEnginsStore, TachesStore, UnitesStore } from '../../store/appstore';
import { MatTableDataSource } from '@angular/material/table';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { EssaiComponent } from '../essai/essai.component';
import { SaisiComponent } from '../../utilitaires/saisi/saisi.component';
import { sign } from 'crypto';
import { WenService } from '../../wen.service';

@Component({
  selector: 'app-pointage-trvx-engins',
  standalone: true,
  imports: [ImportedModule, SaisiComponent, EssaiComponent],
  templateUrl: './pointage-trvx-engins.component.html',
  styleUrl: './pointage-trvx-engins.component.scss'
})
export class PointageTrvxEnginsComponent implements OnInit {
  //injections
  pointage_store = inject(Pointage_trvx_enginsStore);
  classes_engins_store = inject(ClasseEnginsStore);
  engins_store = inject(EnginsStore);
  taches_store = inject(TachesStore);
  projet_store = inject(ProjetStore);
  tachesEngins_store = inject(TachesEnginsStore);
  unites_store = inject(UnitesStore);
  _service = inject(WenService);
  fb = inject(NonNullableFormBuilder);

  //signals variables
  is_table_opened = signal(false);
  selectedControleName = signal('')
  titre_tableau = signal('Pointage travaux')
  selectedProjet = signal('');
  selectedTache = signal('');

  //autres variables
  columnsToDisplay = {
    'date': "DATE",
    'projet': "PROJET",
    'designation': "DESIGNATION",
    'code_parc': "CODE PARC",
    'tache': "TACHE",
    'unite': "UNITE",
    'quantite': "QUANTITE",
    'duree': "DUREE",
    'actions': ''
  };
  table_update_form = this.fb.group({
    id: new FormControl(),
    numero: new FormControl(),
    engin_id: new FormControl('', Validators.required),
    designation: new FormControl({ value: '', disabled: true }),
    unite: new FormControl({ value: '', disabled: true }),
    classe_id: new FormControl('', Validators.required),
    date: new FormControl(new Date(), Validators.required),
    tache_id: new FormControl('', Validators.required),
    projet_id: new FormControl('', Validators.required),
    quantite: new FormControl('', [Validators.required, Validators.min(1)]),
    duree: new FormControl('', [Validators.required, Validators.min(1)])
  })

  classe_select = computed(() => {
    let donnees: any = []
    this.classes_engins_store.classes_engins()
      .forEach(element => {
        donnees.push(
          {
            id: element.id,
            valeur: element.designation
          }
        )

      });
    return donnees
  })

  taches_select = computed(() => {
    let donnees: any = []
    this.tachesEngins_store.tachesEngins()
      .forEach(element => {
        donnees.push(
          {
            id: element.id,
            valeur: element.taches
          }
        )

      });
    return donnees
  })

  projet_select = computed(() => {
    let donnees: any = []
    this.projet_store.donnees_projet()
      .forEach(element => {
        donnees.push(
          {
            id: element.id,
            valeur: element.intitule
          }
        )

      });
    return donnees
  })

  table = computed(() => {
    let mytable =
      [
        {
          label: 'DATE',
          type: 'date',
          control_name: 'date',
          end_control_name: '',
          tableau: [],
        },
        {
          label: 'PROJET',
          type: 'select',
          control_name: 'projet_id',
          end_control_name: '',
          tableau: this.projet_select(),
          radio_button_tab: []
        }
        ,
        {
          label: 'CLASSE MATERIEL',
          type: 'select',
          control_name: 'classe_id',
          end_control_name: '',
          tableau: this.classe_select(),
        },

        {
          label: 'CODE PARC',
          type: 'select',
          control_name: 'engin_id',
          end_control_name: '',
          tableau: [],
          radio_button_tab: []
        },
        {
          label: 'DESIGNATION',
          type: 'text1',
          control_name: 'designation',
          end_control_name: '',
          tableau: [],
          radio_button_tab: []
        }
        ,
        {
          label: 'TACHE',
          type: 'select',
          control_name: 'tache_id',
          end_control_name: '',
          tableau: this.taches_select(),
          radio_button_tab: []
        },
        {
          label: 'UNITE',
          type: 'text1',
          control_name: 'unite',
          end_control_name: '',
          tableau: [],
          radio_button_tab: []
        }
        ,
        {
          label: 'QUANTITE',
          type: 'number',
          control_name: 'quantite',
          end_control_name: '',
          tableau: [],
          radio_button_tab: []
        }
        ,
        {
          label: 'DUREE',
          type: 'number',
          control_name: 'duree',
          end_control_name: '',
          tableau: [],
          radio_button_tab: []
        }

      ]
    return mytable
  })
  dataSource = computed(() => {
    let allData = this.pointage_store.donnees_pointMachFiltres();
    let donnees: any = [];
    allData.forEach(element => {
      let projet = this.projet_store.donnees_projet().find(x => x.id == element.projet_id);
      let tache = this.tachesEngins_store.taches_data().find(x => x.id == element.tache_id);
      let engin = this.engins_store.donnees_engins().find(x => x.id == element.engin_id);
      let unite = this.unites_store.unites_data().find(x => x.id == tache?.uniteId);
      donnees.push({
        'id':element.id,
        'date': element.date,
        'designation': engin?.designation,
        'code_parc': engin?.code_parc,
        'classe_id': engin?.classe_id,
        'tache': tache?.taches,
        'tache_id': element.tache_id,
        'unite': unite?.unite,
        'quantite': element.quantite_exec,
        'projet': projet?.intitule,
        'projet_id':element.projet_id,
        'duree': element.duree,
        'engin_id':element.engin_id,
        'numero': element.numero
      })
    });
    return donnees;
  })

  ngOnInit() {
    this.pointage_store.loadPointMach();
    this.classes_engins_store.loadclasses();
    this.engins_store.loadengins();
    this.taches_store.loadTaches();
    this.tachesEngins_store.loadTachesEngins();
    this.projet_store.loadProjets();
    this.unites_store.loadUnites();
  }
  choix_date() {

  }
  madate(): any {
    throw new Error('Method not implemented.');
  }
  dateRangeChange() {
  }
  updateData(data: any) {
    let valeur = data[0];
    let is_update = data[2];
    if (is_update) {
      let mydata = {
        'id': valeur.id,
        'date': valeur.date.toLocaleDateString(),
        'engin_id': valeur.engin_id,
        'projet_id': valeur.projet_id,
        'tache_id': valeur.tache_id,
        'quantite_exec': valeur.quantite,
        'duree': valeur.duree,
        'numero': valeur.numero
      }
      this.pointage_store.updatePointMach(mydata);
    } else {
      let mydata = {
        'date': valeur.date.toLocaleDateString(),
        'engin_id': valeur.engin_id,
        'projet_id': valeur.projet_id,
        'tache_id': valeur.tache_id,
        'quantite_exec': valeur.quantite,
        'duree': valeur.duree,
        'numero': (this.pointage_store.last_numero() + 1).toString()
      }
      this.pointage_store.addPointMach(mydata);
    }

  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this.pointage_store.removePointMach(id);
  }
  recherche(word: any) {

  }
  afficheTout() {
  }
  PatchEventFct(row: any) {
    let ind = this.table().findIndex(x => x.control_name == "engin_id");
    let tache=this.pointage_store.donnees_pointMachFiltres().find(x=>x.id==row.id);
    let tab = this.engins_store.donnees_engins().filter(x => x.classe_id == row.classe_id).map(x => {
      return {
        'id': x.id,
        'valeur': x.code_parc
      }
    }
    )
    this.table()[ind].tableau = tab;
    let dates = this._service.convertDate(row.date);
    let tacheIds = this.classes_engins_store.classes_engins().find(x => x.id ==row.classe_id)?.taches;
    let ind_tache = this.table().findIndex(x => x.control_name == "tache_id");
    if (tacheIds) {
      let table_taches = this.tachesEngins_store.taches_data().filter(x => tacheIds.includes(x.id)).map(x => {
        return {
          'id': x.id,
          'valeur': x.taches
        }
      });
      this.table()[ind_tache].tableau = table_taches;
    }
    
    row.date = dates;
    this.table_update_form.patchValue(
      row
    )
  } 
  addEventFct() {
    this.table_update_form.reset()
    let dates = new Date()
    this.table_update_form.get('date')?.setValue(dates)
  }
  selectChange(data: any) {
    if (data.length > 0) {
      let selected_id = data[0];
      let data_selectedName = data[1];
      let ind_engin = this.table().findIndex(x => x.control_name == "engin_id");
      let ind_tache = this.table().findIndex(x => x.control_name == "tache_id");
      switch (data_selectedName) {
        case "classe_id":
          let tab = this.engins_store.donnees_engins().filter(x => x.classe_id == selected_id).map(x => {
            return {
              'id': x.id,
              'valeur': x.code_parc
            }
          })
          this.table()[ind_engin].tableau = tab;
          this.table_update_form.get('designation')?.setValue('');
          let tacheIds = this.classes_engins_store.classes_engins().find(x => x.id == selected_id)?.taches;
          if (tacheIds) {
            let table_taches = this.tachesEngins_store.taches_data().filter(x => tacheIds.includes(x.id)).map(x => {
              return {
                'id': x.id,
                'valeur': x.taches
              }
            });
            this.table()[ind_tache].tableau = table_taches;
          }
          break
        case "engin_id":
          let engin = this.engins_store.donnees_engins().find(x => x.id == selected_id)
          if (engin)
            this.table_update_form.get('designation')?.setValue(engin?.designation + ' - ' + engin?.code_parc);
          break
        case "tache_id":
          this.selectedTache.set(selected_id);
          let tache = this.tachesEngins_store.tachesEngins().find(x => x.id == selected_id);
          if (tache) {
            let uniteid = tache.uniteId;
            let unite = this.unites_store.unites().find(x => x.id == uniteid);
            if (unite)
              this.table_update_form.get('unite')?.setValue(unite.unite);
          }
          break
        case "projet_id":
          this.selectedProjet.set(selected_id);
          break
      }
    }

  }
}
