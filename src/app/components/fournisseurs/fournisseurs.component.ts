import { Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ModelTemplateComponent } from '../model-template/model-template.component';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthenService } from '../../authen.service';
import { articles, Engins, fournisseurs } from '../../models/modeles';
import { EnginsStore, PersonnelStore, ClasseEnginsStore, fournisseursStore } from '../../store/appstore';

@Component({
  selector: 'app-fournisseurs',
  imports: [ImportedModule, ModelTemplateComponent],
  templateUrl: './fournisseurs.component.html',
  styleUrl: './fournisseurs.component.scss'
})
export class FournisseursComponent {
  constructor() {
    effect(() => {
    })
  }
  ngOnInit() {

  }
  current_row = signal<fournisseurs | undefined>(undefined);
  is_update = signal(false);
  is_open = signal(false);
  is_open2 = signal(false);
  _fournisseurStore = inject(fournisseursStore);
  //statut_store = inject(StatutStore);
  _auth_service = inject(AuthenService);

  fb = inject(NonNullableFormBuilder);
  table_fournisseur = this.fb.group({
    designation: new FormControl('', Validators.required),
    adresse: new FormControl(''),
    phone: new FormControl('', Validators.required),
    email: new FormControl(''),
    ifu: new FormControl('', Validators.required),
    rccm: new FormControl('', Validators.required)
  });
  displayedColumns = {
    designation: 'DESIGNATION',
    adresse: 'ADRESSE',
    phone: 'TELEPHONE',
    email: 'EMAIL',
    ifu: 'IFU',
    rccm: 'RCCM',
    'actions': ''
  }
  is_valid = computed(() => {
    return (this.current_row()?.designation != '') || this.current_row() !== undefined
  })
  titre_tableau = signal('Liste des fournisseurs');
  table = computed(() => {
    let mytable =
      [
        {
          label: 'DESIGNATION',
          type: 'text1',
          control_name: 'designation',
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
          label: 'TELEPHONE',
          type: 'text1',
          control_name: 'phone',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'EMAIL',
          type: 'text1',
          control_name: 'email',
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
      ]
    return mytable
  })

  clicker = linkedSignal(() => this._fournisseurStore.all_fournisseurs().map(x => false))
  dataSource = linkedSignal(
    () => {
      return this._fournisseurStore.all_fournisseurs()
    }
  )
  updateData(data: any) {
    let valeur = data[0]
    let mydata: any = []

    if (this.is_update()) {
      mydata = ({
        ...this.current_row(),
        designation: valeur.designation,
        adresse: valeur.adresse,
        phone: valeur.phone,
        email: valeur.email,
        ifu: valeur.ifu,
        rccm: valeur.rccm

      })
      this._fournisseurStore.updateFournisseur(mydata);
    }
    else {
      mydata = {
        id: '',
        designation: valeur.designation,
        adresse: valeur.adresse,
        phone: valeur.phone,
        email: valeur.email,
        ifu: valeur.ifu,
        rccm: valeur.rccm
      }
      this._fournisseurStore.addFournisseur(mydata);
    }
    this.current_row.set(undefined);
  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this._fournisseurStore.removeFournisseur(id);
  }
  addEventFct() {
    this.is_update.set(false);
    let newdata: fournisseurs = {
      id: '',
      designation: '',
      adresse: '',
      email: '',
      phone: '',
      ifu: '',
      rccm: ''
    }
    this.dataSource.update((data: any) => [newdata, ...data])
    this.current_row.set(newdata)
    this.table_fournisseur.reset();
  }

  save() {
  }
  annuler() {
    this.current_row.set(undefined);
  }

  clear_fct() {
    this.dataSource.update((data: any) => data.filter((x: any) => x.id != ""))
  }

  modifier(row: any, ind: number) {
    this.current_row.set(row);
    this.is_update.set(true);
    this.table_fournisseur.patchValue(
      row
    );
  }

  recherche(word: any) {
    
  }
  afficheTout() {
  }
  PatchEventFct(row: any) {
    this.table_fournisseur.patchValue(
      row
    )
  }
}
