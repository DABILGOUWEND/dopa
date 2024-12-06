import { Component, computed, effect, inject, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { EssaiComponent } from '../essai/essai.component';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthenService } from '../../authen.service';
import { DevisStore, SstraitantStore, ProjetStore, EntrepriseStore } from '../../store/appstore';
import { TableDevisComponent } from '../table-devis/table-devis.component';

@Component({
    selector: 'app-liste-devis',
    imports: [ImportedModule, TableDevisComponent],
    templateUrl: './liste-devis.component.html',
    styleUrl: './liste-devis.component.scss'
})
export class ListeDevisComponent {
  constructor() {
    effect(() => {
      if (this.code_devis() && this.last_code() != NaN.toString()) {
        this.table_update_form.patchValue({ 'code': this.last_code() })
      }

    })
  }
  ngOnInit() {

  }
  //injected services
  _devis_tore = inject(DevisStore);
  _sstraitant_store = inject(SstraitantStore);
  _clients_store = inject(EntrepriseStore);
  _projets_store = inject(ProjetStore);
  _entreprise_store = inject(EntrepriseStore);
  _auth_service = inject(AuthenService);
  fb = inject(NonNullableFormBuilder);


  //signals
  selected_entreprise = signal<string | undefined>('');
  selected_projet = signal<string | undefined>('');
  devis_opened = signal(false);
  titre_tableau = signal('Liste des devis');

  //others properties
  table_update_form = this.fb.group({
    id: new FormControl(''),
    code: new FormControl({ value: '', disabled: true }, Validators.required),
    client_id: new FormControl('', Validators.required),
    entreprise_id: new FormControl('', Validators.required),
    projet_id: new FormControl('', Validators.required),
    objet: new FormControl('', Validators.required),
    reference: new FormControl('', Validators.required),
    montant: new FormControl({ value: '', disabled: false }, Validators.required),
    avance: new FormControl(0, Validators.required),
  });
  displayedColumns = {
    'code': 'CODE',
    'client': 'CLIENT',
    'entreprise': 'ENTREPRISE',
    'projet': 'PROJET',
    'objet': 'OBJET',
    'reference': 'REFERENCE',
    'montant': 'MONTANT',
    'avance': 'AVANCE',
    'actions': ''
  }

  //computed  
  code_devis = computed(() => {
    if (this.selected_entreprise() && this.selected_projet()) {
      return this.selected_projet() + '' + this.selected_entreprise()
    }
    else {
      return ''
    }
  }
  )
  table = computed(() => {
    let mytable =
      [{
        label: 'CODE',
        type: 'text1',
        control_name: 'code',
        end_control_name: '',
        tableau: []
      },
      {
        label: 'CLIENT',
        type: 'select',
        control_name: 'client_id',
        end_control_name: '',
        tableau: this.clients_select()
      }
        ,

      {
        label: 'ENTREPRISE',
        type: 'select',
        control_name: 'entreprise_id',
        end_control_name: '',
        tableau: this.sstraitants_select()
      },
      {
        label: 'PROJET',
        type: 'select',
        control_name: 'projet_id',
        end_control_name: '',
        tableau: this.projets_select()
      },
      {
        label: 'REFERENCE',
        type: 'text1',
        control_name: 'reference',
        end_control_name: '',
        tableau: []
      }
        ,
      {
        label: 'OBJET',
        type: 'text1',
        control_name: 'objet',
        end_control_name: '',
        tableau: []
      },

      {
        label: 'MONTANT',
        type: 'number',
        control_name: 'montant',
        end_control_name: '',
        tableau: []
      },

      {
        label: 'AVANCE',
        type: 'number',
        control_name: 'avance',
        end_control_name: '',
        tableau: []
      }
      ]
    return mytable
  })
  projets_select = computed(() => {
    let donnees: any = []
    this._projets_store.donnees_projet()
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
  clients_select = computed(() => {
    let donnees: any = []
    this._clients_store.donnees_entreprise()
      .forEach(element => {
        donnees.push(
          {
            id: element.id,
            valeur: element.enseigne
          }
        )

      });
    return donnees
  })
  sstraitants_select = computed(() => {
    let donnees: any = []
    this._sstraitant_store.sstraitant_data()
      .forEach(element => {
        donnees.push(
          {
            id: element.id,
            valeur: element.enseigne
          }
        )

      });
    return donnees
  })
  dataSource = computed(
    () => {

      let donnees: any = []
      this._devis_tore.devis_data().forEach(element => {
        let client = this._clients_store.donnees_entreprise().find(x => x.id == element.client_id)
        let entreprise = this._sstraitant_store.sstraitant_data().find(x => x.id == element.entreprise_id)
        let projet = this._projets_store.donnees_projet().find(x => x.id == element.projet_id)
        donnees.push(
          {
            id: element.id,
            code: element.code,
            client_id: element.client_id,
            entreprise_id: element.entreprise_id,
            projet_id: element.projet_id,
            objet: element.objet,
            reference: element.reference,
            montant: element.montant,
            avance: element.avance,
            client: client?.enseigne,
            entreprise: entreprise?.enseigne,
            projet: projet?.intitule
          }
        )
      });
      return donnees.sort((a: any, b: any) => a.code - b.code)
    }
  )
  last_code = computed(() => {
    let codes = this._devis_tore.donnees_devis().map(x => x.code.split(this.code_devis())[1]).
      filter(x => x != undefined).sort((a, b) => Number(a) - Number(b))
    if (codes.length > 0) {
      return this.code_devis() + '00' + (Number(codes[codes.length - 1]) + 1).toString()
    } else {
      return this.code_devis() + '001'
    }
  })


  //methods
  updateData(data: any) {
    let element = data[0]
    let current_row = data[1]
    let is_update = data[2]
    let mydata: any = []

    if (is_update) {
      mydata = {
        id: current_row.id,
        code: current_row.code,
        client_id: element.client_id,
        entreprise_id: element.entreprise_id,
        projet_id: element.projet_id,
        objet: element.objet,
        reference: element.reference,
        montant: element.montant,
        avance: element.avance,

      }
      this._devis_tore.updateDevis(mydata);
    }
    else {
      mydata = {
        code: this.last_code(),
        client_id: element.client_id,
        entreprise_id: element.entreprise_id,
        projet_id: element.projet_id,
        objet: element.objet,
        reference: element.reference,
        montant: element.montant,
        avance: element.avance,
      }
      this._devis_tore.addDevis(mydata);
    }
  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this._devis_tore.removeDevis(id);
  }
  recherche(word: any) {

  }
  afficheTout() {

  }
  PatchEventFct(row: any) {
    this.table_update_form.patchValue(
      row
    )
    this._devis_tore.setCurrentDevisId(row.id);
  }
  addEventFct() {
    this.table_update_form.reset();
  }
  changeSelect(data: any) {
    let type = data[1]
    console.log(type)
    switch (type) {
      case 'client_id':
        let entreprise = this._entreprise_store.donnees_entreprise().find(x => x.id == data[0])
        this.selected_entreprise.set(entreprise?.enseigne.replace(' ', ''))
        break;

      case 'projet_id':
        let projet = this._projets_store.donnees_projet().find(x => x.id == data[0])
        this.selected_projet.set(projet?.code)
        break;
    }

  }
}
