import { Component, computed, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { EnginsStore, PersonnelStore, StatutStore, UserStore, EntrepriseStore, ProjetStore, ClasseEnginsStore, UnitesStore, TachesEnginsStore, SstraitantStore } from '../../store/appstore';
import { EssaiComponent } from '../essai/essai.component';

@Component({
  selector: 'app-tbord-sstraitants',
  imports: [EssaiComponent],
  templateUrl: './tbord-sstraitants.component.html',
  styleUrl: './tbord-sstraitants.component.scss'
})
export class TbordSstraitantsComponent {
  constructor() {
    effect(() => {
    })
  }
  //injections
  
  _sousTraitance_store = inject(SstraitantStore);
  _fb = inject(NonNullableFormBuilder);

  table_update_form = this._fb.group({
    id: new FormControl(''),
    adresse: new FormControl('', Validators.required),
    enseigne: new FormControl('', Validators.required),
    entreprise: new FormControl('', Validators.required),
    rccm: new FormControl('', Validators.required),
    ifu: new FormControl('', Validators.required),
    phone: new FormControl(''),
    date_naissance: new FormControl(''),
    lieu_naissance: new FormControl(''),
    nom_reponsable: new FormControl('', Validators.required),
    prenom_reponsable: new FormControl('', Validators.required),
    num_cnib: new FormControl('', Validators.required)
  })

  displayedColumns = {
    'entreprise': 'ENTREPRISE',
    'enseigne': 'ENSEIGNE',
    'actions': ''
  }
  titre_tableau = signal('Liste des sous-traitants')
  table = computed(() => {
    let mytable =
      [
        {
          label: 'ENSEIGNE',
          type: 'text1',
          control_name: 'enseigne',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'ENTREPRISE',
          type: 'text1',
          control_name: 'entreprise',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'ADRESSE',
          type: 'text1',
          control_name: 'adresse',
          end_control_name: '',
          tableau: []
        }
        ,
        {
          label: 'TELEPHONE',
          type: 'text1',
          control_name: 'phone',
          end_control_name: '',
          tableau: []
        }
        ,
  
        {
          label: 'N° RCCM',
          type: 'text1',
          control_name: 'rccm',
          end_control_name: '',
          tableau: []
        }
        ,
        {
          label: 'N° IFU',
          type: 'text1',
          control_name: 'ifu',
          end_control_name: '',
          tableau: []
        }
        ,
        {
          label: 'NOM RESPONSABLE',
          type: 'text1',
          control_name: 'nom_reponsable',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'PRENOM RESPONSABLE',
          type: 'text1',
          control_name: 'prenom_reponsable',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'NUMERO CNIB',
          type: 'text1',
          control_name: 'num_cnib',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'DATE DE NAISSANCE',
          type: 'date',
          control_name: 'date_naissance',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'LIEU DE NAISSANCE',
          type: 'text1',
          control_name: 'lieu_naissance',
          end_control_name: '',
          tableau: []
        }
      ]
    return mytable
  })


  ngOnInit() {

  }


  datasource = computed(
    () => {
      let data = this._sousTraitance_store.donnees_sstraitant();  
      return data.map((value) => {
        return {
          'id': value.id,
          'entreprise': value.entreprise,
          'enseigne': value.enseigne,
          'adresse': value.adresse,
          'phone': value.phone,
          'ifu': value.ifu,
          'rccm': value.rccm,
          'nom_responsable': value.nom_responsable,
          'prenom_responsable': value.prenom_responsable,
          'num_cnib': value.num_cnib,
          'date_naissance': value.date_naissance,
          'lieu_naissance': value.lieu_naissance,

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
        'entreprise': value.entreprise,
        'enseigne': value.enseigne,
        'adresse': value.adresse,
        'phone': value.phone,
        'ifu': value.ifu,
        'rccm': value.rccm,
        'nom_responsable': value.nom_responsable,
        'prenom_responsable': value.prenom_responsable,
        'num_cnib': value.num_cnib,
        'date_naissance': value.date_naissance,
        'lieu_naissance': value.lieu_naissance
      }
      this._sousTraitance_store.updateSstraitant(mydata)
    }
    else {
      mydata = {
        'entreprise': value.entreprise,
        'enseigne': value.enseigne,
        'adresse': value.adresse,
        'phone': value.phone,
        'ifu': value.ifu,
        'rccm': value.rccm,
        'nom_responsable': value.nom_responsable,
        'prenom_responsable': value.prenom_responsable,
        'num_cnib': value.num_cnib,
        'date_naissance': value.date_naissance,
        'lieu_naissance': value.lieu_naissance
      }
      this._sousTraitance_store.addSstraitant(mydata)
    }
  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this._sousTraitance_store.removeSstraitant(id)  
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
