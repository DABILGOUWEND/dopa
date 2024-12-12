import { Component, computed, effect, inject, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { EssaiComponent } from '../essai/essai.component';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthenService } from '../../authen.service';
import { DevisStore, SstraitantStore, EntrepriseStore, ProjetStore } from '../../store/appstore';

@Component({
    selector: 'app-liste-sstraitants',
    imports: [ImportedModule, EssaiComponent],
    templateUrl: './liste-sstraitants.component.html',
    styleUrl: './liste-sstraitants.component.scss'
})
export class ListeSstraitantsComponent {
  constructor() {
    effect(() => {

    })
  }
  ngOnInit() {

  }
  _devis_tore = inject(DevisStore);
  _sstraitant_store = inject(SstraitantStore);
  _clients_store = inject(EntrepriseStore);
  _projets_store = inject(ProjetStore);

  //statut_store = inject(StatutStore);
  _auth_service = inject(AuthenService);

  fb = inject(NonNullableFormBuilder);
  table_update_form = this.fb.group({
    id: new FormControl(''),
    entreprise: new FormControl('', Validators.required),
    enseigne: new FormControl('', Validators.required),
    ifu: new FormControl(''),
    rccm: new FormControl(''),
    adresse: new FormControl(''),
    phone: new FormControl(''),
    nom_responsable: new FormControl(''),
    prenom_responsable: new FormControl(''),
    date_naissance: new FormControl(''),
    lieu_naissance: new FormControl(''),
    num_cnib: new FormControl('')
  });
  displayedColumns = {
    'entreprise': 'ENTREPRISE',
    'enseigne': 'ENSEIGNE',
    'ifu': 'IFU',
    'rccm': 'RCCM',
    'adresse': 'ADRESSE',
    'phone': 'PHONE',
    'actions': ''
  }
  titre_tableau = signal('Liste des sous-traitants');
  table = computed(() => {
    let mytable =
      [
      {
        label: 'ENTREPRISE',
        type: 'text1',
        control_name: 'entreprise',
        end_control_name: '',
        tableau: []
      }
        ,

      {
        label: 'ENSEIGNE',
        type: 'text1',
        control_name: 'enseigne',
        end_control_name: '',
        tableau: []
      },
      {
        label: 'IFU',
        type: 'text1',
        control_name: 'ifu',
        end_control_name: '',
        tableau: []
      },
      {
        label: 'RCCM',
        type: 'text1',
        control_name: 'rccm',
        end_control_name: '',
        tableau: []
      }
        ,
      {
        label: 'ADRESSE',
        type: 'text1',
        control_name: 'adresse',
        end_control_name: '',
        tableau: []
      },

      {
        label: 'PHONE',
        type: 'text1',
        control_name: 'phone',
        end_control_name: '',
        tableau: []
      }
        ,

      {
        label: 'NOM RESPONSABLE',
        type: 'text1',
        control_name: 'nom_responsable',
        end_control_name: '',
        tableau: []
      },

      {
        label: 'PRENOM RESPONSABLE',
        type: 'text1',
        control_name: 'prenom_responsable',
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
        ,
      {
        label: 'NUM CNIB',
        type: 'text1',
        control_name: 'num_cnib',
        end_control_name: '',
        tableau: []
      }
      ]
    return mytable
  })


  dataSource = computed(
    () => {

      let donnees: any = []
      this._sstraitant_store.sstraitant_data().forEach(element => {
        donnees.push(
          {
            id: element.id,
            entreprise: element.entreprise,
            enseigne: element.enseigne,
            ifu: element.ifu,
            rccm: element.rccm,
            adresse: element.adresse,
            phone: element.phone,
            nom_responsable: element.nom_responsable,
            prenom_responsable: element.prenom_responsable,
            date_naissance: element.date_naissance,
            lieu_naissance: element.lieu_naissance,
            num_cnib: element.num_cnib
          }
        )
      });
      return donnees
    }
  )

  updateData(data: any) {
    let element = data[0]
    let current_row = data[1]
    let is_update = data[2]
    let mydata: any = []

    if (is_update) {
      mydata = {
        id: element.id,
        entreprise: element.entreprise,
        enseigne: element.enseigne,
        ifu: element.ifu,
        rccm: element.rccm,
        adresse: element.adresse,
        phone: element.phone,
        nom_responsable: element.nom_responsable,
        prenom_responsable: element.prenom_responsable,
        date_naissance: element.date_naissance,
        lieu_naissance: element.lieu_naissance,
        num_cnib: element.num_cnib

      }
      this._sstraitant_store.updateSstraitant(mydata);
    }
    else {
      mydata = {
        entreprise: element.entreprise,
        enseigne: element.enseigne,
        ifu: element.ifu,
        rccm: element.rccm,
        adresse: element.adresse,
        phone: element.phone,
        nom_responsable: element.nom_responsable,
        prenom_responsable: element.prenom_responsable,
        date_naissance: element.date_naissance,
        lieu_naissance: element.lieu_naissance,
        num_cnib: element.num_cnib
      }
      this._sstraitant_store.addSstraitant(mydata);
    }
  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this._sstraitant_store.removeSstraitant(id);
  }
  recherche(word: any) {

  }
  afficheTout() {

  }
  PatchEventFct(row: any) {
    this.table_update_form.patchValue(
      row
    )
  }
  addEventFct() {
    this.table_update_form.reset();
  }
}
