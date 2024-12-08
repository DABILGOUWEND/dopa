import { Component, computed, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { EnginsStore, PersonnelStore, StatutStore, UserStore, EntrepriseStore, ProjetStore, ClasseEnginsStore, UnitesStore, TachesEnginsStore } from '../../store/appstore';
import { ImportedModule } from '../../modules/imported/imported.module';
import { SaisiComponent } from '../../utilitaires/saisi/saisi.component';
import { EssaiComponent } from '../essai/essai.component';

@Component({
    selector: 'app-tbord-projets',
    imports: [ImportedModule, EssaiComponent],
    templateUrl: './tbord-projets.component.html',
    styleUrl: './tbord-projets.component.scss'
})
export class TbordProjetsComponent {
  constructor() {
    effect(() => {
      //console.log(this._classesEngins_store.classes())
    })
  }
  //injections
  _enginsStore = inject(EnginsStore);
  _personnel_store = inject(PersonnelStore);
  _statut_store = inject(StatutStore);
  _user_store = inject(UserStore);
  _entreprise_store = inject(EntrepriseStore);
  _projet_store = inject(ProjetStore);
  _classesEngins_store = inject(ClasseEnginsStore);
  _unites_store = inject(UnitesStore);
  _taches_store = inject(TachesEnginsStore);
  _fb = inject(NonNullableFormBuilder);

  table_update_form = this._fb.group({
    id: new FormControl(''),
    code: new FormControl('', Validators.required),
    intitule: new FormControl('', Validators.required),
    maitre_ouvrage: new FormControl(''),
    maitre_oeuvre: new FormControl(''),
    entreprise_id: new FormControl(''),
    financement: new FormControl(''),
    descrip_travaux: new FormControl(''),
  })

  displayedColumns = {
    'code': 'CODE',
    'intitule': 'INTITULE',
    'entreprise': 'ENTREPRISE',
    'maitre_oeuvre': 'MAITRE D\'OEUVRE',
    'maitre_ouvrage': 'MAITRE D\'OUVRAGE',
    'actions': ''
  }
  titre_tableau = signal('Liste des projets')
  table = computed(() => {
    let mytable =
      [
        {
          label: 'CODE',
          type: 'text1',
          control_name: 'code',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'INTITULE',
          type: 'text1',
          control_name: 'intitule',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'MAITRE D\'OEUVRE',
          type: 'text1',
          control_name: 'maitre_oeuvre',
          end_control_name: '',
          tableau: []
        }
        ,
        {
          label: 'MAITRE D\'OUVRAGE',
          type: 'text1',
          control_name: 'maitre_ouvrage',
          end_control_name: '',
          tableau: []
        }
        ,
        {
          label: 'DESCRIPTION DES TRAVAUX',
          type: 'text1',
          control_name: 'descrip_travaux',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'FINANCEMENT',
          type: 'text1',
          control_name: 'financement',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'ENTREPRISE',
          type: 'select',
          control_name: 'entreprise_id',
          end_control_name: '',
          tableau: this.select_entreprise()
        }
      ]
    return mytable
  })
  ngOnInit() {

  }

  select_entreprise = computed(() => {
    let data = this._entreprise_store.donnees_entreprise()
    return data.map((value) => {
      return {
        id: value.id,
        valeur: value.enseigne
      }
    })
  })
  datasource = computed(
    () => {
      let data = this._projet_store.donnees_projet();
      return data.map((value) => {
        let entreprise = this._entreprise_store.donnees_entreprise().find(x => x.id == value.entreprise_id)

        return {
          'id': value.id,
          'code': value.code,
          'intitule': value.intitule,
          'maitre_oeuvre': value.maitre_oeuvre,
          'maitre_ouvrage': value.maitre_ouvrage,
          'financement': value.financement,
          'entreprise_id': value.entreprise_id,
          'entreprise': entreprise?.enseigne,
          'descrip_travaux': value.descrip_travaux
        }
      })
    }
  )
  updateData(data: any) {
    let value = data[0]
    let current_row = data[1]
    let is_update = data[2]
    let mydata: any = []
    if (is_update) {
      mydata = {
        'id': current_row.id,
        'code': value.code,
        'intitule': value.intitule,
        'maitre_oeuvre': value.maitre_oeuvre,
        'maitre_ouvrage': value.maitre_ouvrage,
        'financement': value.financement,
        'entreprise_id': value.entreprise_id,
        'descrip_travaux': value.descrip_travaux
      }
      this._projet_store.updateProjet(mydata)
    }
    else {
      mydata = {
        'code': value.code,
        'intitule': value.intitule,
        'maitre_oeuvre': value.maitre_oeuvre,
        'maitre_ouvrage': value.maitre_ouvrage,
        'financement': value.financement,
        'entreprise_id': value.entreprise_id,
        'descrip_travaux': value.descrip_travaux
      }
      this._projet_store.addProjet(mydata)
    }
  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this._projet_store.removeProjet(id)
  }
  recherche(word: any) {
    //this.personnel_store.filterbyNomPrenom(word)
  }
  afficheTout() {
    //this.personnel_store.filterbyNomPrenom('')
  }
  PatchEventFct(row: any) {
    this.table_update_form.patchValue(
      row
    )
  }
  addEventFct() {
    this.table_update_form.reset()
  }

}
