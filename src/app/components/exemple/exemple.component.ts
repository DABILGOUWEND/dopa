import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { EssaiComponent } from '../essai/essai.component';
import { MatTableDataSource } from '@angular/material/table';
import { EnginsStore, PersonnelStore, ClasseEnginsStore, StatutStore } from '../../store/appstore';
import { ImportedModule } from '../../modules/imported/imported.module';
import { signInAnonymously } from '@angular/fire/auth';

@Component({
  selector: 'app-exemple',
  standalone: true,
  imports: [EssaiComponent, ImportedModule],
  templateUrl: './exemple.component.html',
  styleUrl: './exemple.component.scss'
})
export class ExempleComponent implements OnInit {
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
  updateData(value: any) {
    if (value[1]) {
      this.personnel_store.updatePersonnel(value[0])
    } else {
      this.personnel_store.addPersonnel(value[0])
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

}
