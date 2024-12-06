import { Component, computed, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { EnginsStore, PersonnelStore, StatutStore, UserStore, EntrepriseStore, ProjetStore, ClasseEnginsStore, UnitesStore, TachesEnginsStore } from '../../store/appstore';
import { ImportedModule } from '../../modules/imported/imported.module';
import { EssaiComponent } from '../essai/essai.component';

@Component({
    selector: 'app-tbord-entreprises',
    imports: [ImportedModule, EssaiComponent],
    templateUrl: './tbord-entreprises.component.html',
    styleUrl: './tbord-entreprises.component.scss'
})
export class TbordEntreprisesComponent {
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
    enseigne: new FormControl('', Validators.required),
    rccm: new FormControl(''),
    ifu: new FormControl(''),
    email: new FormControl(''),
    telephone: new FormControl(''),
    site_web: new FormControl(''),
    adresse: new FormControl(''),
    signataire: new FormControl(''),
  })

  displayedColumns = {
    'code': 'DESIGNATION',
    'enseigne': 'ENSEIGNE',
    'actions': ''
  }
  titre_tableau = signal('Liste des enreprises')
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
          label: 'ENSEIGNE',
          type: 'text1',
          control_name: 'enseigne',
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
          control_name: 'telephone',
          end_control_name: '',
          tableau: []
        }
        ,
        {
          label: 'EMAIL',
          type: 'text1',
          control_name: 'email',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'SITE WEB',
          type: 'text1',
          control_name: 'site_web',
          end_control_name: '',
          tableau: []
        },
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
          label: 'SIGNATAIRE',
          type: 'text1',
          control_name: 'signataire',
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
      let data = this._entreprise_store.donnees_entreprise();
      return data.map((value) => {
        return {
          'id': value.id,
          'code': value.code,
          'enseigne': value.enseigne,
          'adresse': value.adresse,
          'telephone': value.telephone,
          'email': value.email,
          "site_web": value.site_web,
          'ifu': value.ifu,
          'rccm': value.rccm,
          'signataire': value.signataire
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
        'enseigne': value.enseigne,
        'adresse': value.adresse,
        'telephone': value.telephone,
        'email': value.email,
        "site_web": value.site_web,
        'ifu': value.ifu,
        'rccm': value.rccm,
        'signataire': value.signataire
      }
      this._entreprise_store.updateEntreprise(mydata)
    }
    else {
      mydata = {
        'code': value.code,
        'enseigne': value.enseigne,
        'adresse': value.adresse,
        'telephone': value.telephone,
        'email': value.email,
        "site_web": value.site_web,
        'ifu': value.ifu,
        'rccm': value.rccm,
        'signataire': value.signataire
      }
      this._entreprise_store.addEntreprise(mydata)
    }
  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this._entreprise_store.removeEntreprise(id)
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
