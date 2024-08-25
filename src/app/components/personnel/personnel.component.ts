import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { FormGroup, FormBuilder, FormControl, Validators, NonNullableFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { tab_personnel } from '../../models/modeles';
import { ClasseEnginsStore, EnginsStore, PersonnelStore, StatutStore } from '../../store/appstore';
import { SaisiComponent } from '../../utilitaires/saisi/saisi.component';
import { EssaiComponent } from '../essai/essai.component';

@Component({
  selector: 'app-personnel',
  standalone: true,
  imports: [ImportedModule, SaisiComponent,EssaiComponent],
  templateUrl: './personnel.component.html',
  styleUrl: './personnel.component.scss'
})
export class PersonnelComponent  implements OnInit{
  readonly EnginsStore = inject(EnginsStore)
  readonly personnel_store = inject(PersonnelStore)
  readonly classeEngins_store = inject(ClasseEnginsStore)
  readonly statut_store = inject(StatutStore)
  fb = inject(NonNullableFormBuilder)
  table_update_form = this.fb.group({
    id: new FormControl(''),
    nom: new FormControl('', Validators.required),
    prenom: new FormControl('', Validators.required),
    fonction: new FormControl('', Validators.required),
    statut_id: new FormControl('', Validators.required),
    num_phone1: new FormControl(''),
    num_phone2: new FormControl(''),
    email: new FormControl(''),
    num_matricule: new FormControl('')
  })
  displayedColumns = {
    'nom': 'NOM',
    'prenom': 'PRENOM',
    'fonction': 'FONCTION',
    'num_phone1': 'NUMERO PHONE 1',
    'num_phone2': 'NUMERO PHONE 2',
    'email':'E -MAIL',
    'statut': 'STATUT',
    'actions': ''
  }
  titre_tableau = signal('Liste du personnel')
  table = computed(() => {
    let mytable =
      [
        {
          label: 'NOM',
          type: 'text1',
          control_name: 'nom',
          end_control_name: '',
          tableau: []
        }
        ,

        {
          label: 'PRENOM',
          type: 'text1',
          control_name: 'prenom',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'NUMERO DE PHONE1',
          type: 'text1',
          control_name: 'num_phone1',
          end_control_name: '',
          tableau: []
        }, {
          label: 'NUMERO DE PHONE2',
          type: 'text1',
          control_name: 'num_phone2',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'E MAIL',
          type: 'text1',
          control_name: 'email',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'NUMERO MATRICULE',
          type: 'text1',
          control_name: 'num_matricule',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'FONCTION',
          type: 'text1',
          control_name: 'fonction',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'STATUT',
          type: 'select',
          control_name: 'statut_id',
          end_control_name: '',
          tableau: this.statut_select()
        },
      ]
    return mytable
  })

  statut_select = computed(() => {
    let donnees: any = []
    this.statut_store.donnees_statut()
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
  dataSource = computed(
    () => {
      let donnees: any = []
      this.personnel_store.donnees_personnel().forEach(element => {
        let statut = this.statut_store.donnees_statut().find(x => x.id == element.statut_id)
        let statut_a = statut?.designation
        donnees.push(
          {
            'id': element.id,
            'statut_id': element.statut_id,
            'statut': statut_a,
            'nom': element.nom,
            'prenom': element.prenom,
            'fonction': element.fonction,
            'num_phone1': element.num_phone1,
            'num_phone2': element.num_phone2,
            'num_matricule': element.num_matricule,
            'email': element.email,
            'dates': element.dates,
            'Presence': element.Presence,
            'heureSup': element.heureSup,
            'heuresN': element.heuresN,
          }
        )
      });
      return donnees
    }
  );
  ngOnInit() {
    this.personnel_store.loadPersonnel()
    this.statut_store.loadstatut()
  }
  updateData(data: any) {
    let valeur =data[0]
    let current_row=data[1]
    let is_update=data[2]
    let mydata: any = []
    if (is_update) {
      mydata = {
        id: valeur.id,
        nom: valeur.nom,
        prenom: valeur.prenom,
        fonction: valeur.fonction,
        num_phone1: valeur.num_phone1,
        num_phone2: valeur.num_phone2,
        email: valeur.email,
        num_matricule: valeur.num_matricule,
        dates: current_row.dates,
        Presence: current_row.Presence,
        heuresN: current_row.heuresN,
        heureSup: current_row.heureSup,
        statut_id: valeur.statut_id
      }
      this.personnel_store.updatePersonnel(mydata)

    }
    else {
      mydata = {
        id: '',
        nom: valeur.nom,
        prenom: valeur.prenom,
        fonction: valeur.fonction,
        num_phone1: valeur.num_phone1,
        num_phone2: valeur.num_phone2,
        email: valeur.email,
        num_matricule: valeur.num_matricule,
        statut_id: valeur.statut_id
      }
      this.personnel_store.addPersonnel(mydata)
    }
  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this.personnel_store.removePersonnel(id)
  }
  recherche(word: any) {
    this.personnel_store.filterbyNomPrenom(word)
  }
  afficheTout() {
    this.personnel_store.filterbyNomPrenom('')
  }
  PatchEventFct(row:any)
  {
    this.table_update_form.patchValue(
      row
    ) 
  }
  addEventFct()
  {
    this.table_update_form.reset()
  }
}
