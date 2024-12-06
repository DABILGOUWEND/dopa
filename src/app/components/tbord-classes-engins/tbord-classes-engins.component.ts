import { Component, computed, effect, inject, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { EnginsStore, PersonnelStore, ClasseEnginsStore, StatutStore, UserStore, EntrepriseStore, ProjetStore, UnitesStore, TachesStore, TachesEnginsStore } from '../../store/appstore';
import { EssaiComponent } from '../essai/essai.component';

@Component({
    selector: 'app-tbord-classes-engins',
    imports: [ImportedModule, EssaiComponent],
    templateUrl: './tbord-classes-engins.component.html',
    styleUrl: './tbord-classes-engins.component.scss'
})
export class TbordClassesEnginsComponent {
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
    designation: new FormControl('', Validators.required),
    taches_id: new FormControl('', Validators.required)
  })

  displayedColumns = {
    'designation': 'DESIGNATION',
    'taches': 'TACHES',
    'actions': ''
  }
  titre_tableau = signal('Liste des classes d\'engins')
  table = computed(() => {
    let mytable =
      [
        {
          label: 'DESIGNATION',
          type: 'text1',
          control_name: 'designation',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'TACHES',
          type: 'selectM',
          control_name: 'taches_id',
          end_control_name: '',
          tableau: this.select_taches()
        }
      ]
    return mytable
  })


  ngOnInit() {
  
  }
  select_taches = computed(() => {
    let data = this._taches_store.taches_data();
    return data.map((value) => {
      return {
        id: value.id,
        valeur: value.taches,
      }
    })
  })

  datasource = computed(
    () => {
      let data = this._classesEngins_store.classes()
      return data.map((value) => {
        let taches = this._taches_store.taches_data().filter((val) => value.taches.includes(val.id))
        return {
          id: value.id,
          designation: value.designation,
          taches_id: value.taches,
          taches: taches.map((val: any) => val.taches).join(', ')
        }
      })
    }
  )
  updateData(data: any) {
    let valeur = data[0]
    let current_row = data[1]
    let is_update = data[2]
    let mydata: any = []
    if (is_update) {
      mydata = {
        id: valeur.id,
        designation: valeur.designation,
        taches: valeur.taches_id,
      }
      this._classesEngins_store.updateClasses(mydata)
    }
    else {
      mydata = {
        designation: valeur.designation,
        taches: valeur.taches_id,
      }
      this._classesEngins_store.addClasse(mydata)
    }
  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this._classesEngins_store.deleteClasse(id)
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
