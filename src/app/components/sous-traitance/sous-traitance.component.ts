import { Component, OnInit, computed, effect, inject, signal, ɵunwrapWritableSignal } from '@angular/core';
import { DevisStore, LigneDevisStore, ProjetStore, SstraitantStore } from '../../store/appstore';
import { ImportedModule } from '../../modules/imported/imported.module';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Devis, Ligne_devis } from '../../models/modeles';
import { MatTableDataSource } from '@angular/material/table';
import { WenService } from '../../wen.service';
import { FormBuilder, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { EntreprisesPipe } from '../../entreprises.pipe';
import { AuthenService } from '../../authen.service';

@Component({
  selector: 'app-sous-traitance',
  standalone: true,
  imports: [ImportedModule, EntreprisesPipe],
  templateUrl: './sous-traitance.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  styleUrl: './sous-traitance.component.scss'
})
export class SousTraitanceComponent implements OnInit {
  //injections
  Devis_Store = inject(DevisStore)
  LigneDevis_Store = inject(LigneDevisStore)
  SousTraitance_Store = inject(SstraitantStore)
  Projet_Store = inject(ProjetStore)
  _service = inject(WenService)
  authservice = inject(AuthenService);

  //signals variables
  selected_sstraitant = signal("")
  selected_projet = signal("")
  selected_devis = signal("")
  titre_devis = signal("")
  is_rubrique_parent = signal(false)
  ajout = signal(false)
  is_table_opened = signal(false)
  is_table_updated = signal(false)
  entreprise_id = signal('')
  devis_objet = signal('')
  current_code = signal('')
  quantite = signal(0)
  prix = signal(0)
  type_rubrique = signal('1')

  // simples variables
  columnsToDisplay = ['poste', 'designation', 'unite', 'prix_u', 'quantite', 'montant', 'actions'];
  expandedElement: Ligne_devis | null = null;
  ligne_parent: Ligne_devis = this.LigneDevis_Store.donnees_Lignedevis()[0];
  table_update_form: FormGroup
  //computed signals
  last_num = computed(() => {
    let num: any = []
    let devisid = this.selected_devis()
    let devis = this.Devis_Store.donnees_devis().find(x => x.id == devisid)
    this.LigneDevis_Store.donnees_Lignedevis().forEach(element => {
      let mynum = element.code.split(devis?.code + 'LN')
      num.push(Number(mynum[1]))
    });
    return Math.max(...num) + 1
  })
  donnees = computed(() => {
    let mydata = this.LigneDevis_Store.taches_classees()

    let init = mydata.map(x => x.parent_code).filter(x => x != '')
    let codes: any = []
    mydata.forEach(element => {
      let montant = 0
      if (!init.includes(element.code)) {
        montant = element.quantite * element.prix_u
        codes.push(element.parent_code)
      }
      element.montant = montant

    })
    let codes2: any = []
    mydata.forEach((element: any) => {
      if (codes.includes(element.code)) {
        let filtres = mydata.filter(x => x.parent_code == element.code).map(x => x.montant)
        element.montant = this._service.somme(filtres)
        codes2.push(element.parent_code)
      }
    });
    let codes3: any = []
    mydata.forEach((element: any) => {
      if (codes2.includes(element.code)) {
        let filtres = mydata.filter(x => x.parent_code == element.code).map(x => x.montant)
        element.montant = this._service.somme(filtres)
        codes3.push(element.parent_code)
      }
    });
    return mydata
  }
  )
  dataSource = computed(() => {
    return new MatTableDataSource<any>(this.donnees())
  })
  sommeTotal = computed(() => {
    let data = this.donnees().filter(x => this.ligne_parent0().includes(x.code)).map(x => x.montant)
    return this._service.somme(data)
  })
  has_child = computed(() => {
    let code_parent = this.LigneDevis_Store.donnees_Lignedevis().filter(x => x.parent_code != '').map(x => x.parent_code)
    return code_parent
  }
  )
  ligne_parent0 = computed(() => {
    return this.LigneDevis_Store.donnees_Lignedevis().filter(x => x.parent_code == "").map(x => x.code)
  })
  ligne_parent1 = computed(() => {
    let data1 = this.LigneDevis_Store.donnees_Lignedevis().filter(x => {
      return this.ligne_parent0().includes(x.parent_code)
    }).map(x => x.code)
    return data1
  })
  ligne_parent2 = computed(() => {
    let data2 = this.LigneDevis_Store.donnees_Lignedevis().filter(x => {
      return this.ligne_parent1().includes(x.parent_code)
    }).map(x => x.code)
    return data2
  })
  ligne_has_child = computed(() => {
    return this.LigneDevis_Store.donnees_Lignedevis().map(x => x.parent_code)
  })



  ngOnInit(): void {
    this.Devis_Store.loadDevis()
    this.LigneDevis_Store.loadLigneDevis()
    this.SousTraitance_Store.loadSstraitants()
    this.Projet_Store.loadProjets()
    this.table_update_form.valueChanges.subscribe(x => {
      this.quantite.set(x.quantite)
      this.prix.set(x.prix_u)
    })
  }
  constructor(private fb: FormBuilder) {
    this.table_update_form = this.fb.group({
      id: new FormControl(''),
      code: new FormControl({ value: '', disabled: true }),
      poste: new FormControl('', Validators.required),
      designation: new FormControl('', Validators.required),
      unite: new FormControl('', Validators.required),
      prix_u: new FormControl('', Validators.required),
      quantite: new FormControl('', Validators.required),
      montant: new FormControl({ value: 0, disabled: true }),
    })
    effect(() => {
      this.table_update_form.patchValue({
        'montant': this.quantite() * this.prix()
      })


      if (this.type_rubrique() == "1") {
        this.table_update_form.updateValueAndValidity()
        this.table_update_form.get('unite')?.clearValidators()
        this.table_update_form.get('prix_u')?.clearValidators()
        this.table_update_form.get('quantite')?.clearValidators()
        this.table_update_form.get('montant')?.clearValidators()

      }
      if (this.type_rubrique() == "2") {
        this.table_update_form.updateValueAndValidity()
        this.table_update_form.get('unite')?.setValidators([Validators.required])
        this.table_update_form.get('prix_u')?.setValidators([Validators.required])
        this.table_update_form.get('quantite')?.setValidators([Validators.required])
        this.table_update_form.get('montant')?.setValidators([Validators.required])
      }
      this.table_update_form.get('unite')?.updateValueAndValidity()
      this.table_update_form.get('prix_u')?.updateValueAndValidity()
      this.table_update_form.get('quantite')?.updateValueAndValidity()
      this.table_update_form.get('montant')?.updateValueAndValidity()

    }
    );

  }

  selectChangeEntreprise(arg0: any) {
    this.Devis_Store.filtrebyEntreprise(this.selected_sstraitant())
  }
  selectChangeProjet(arg0: any) {
    this.Devis_Store.filtrebyProjet(this.selected_projet())
  }
  selectChangeDevis(arg0: string) {
    this.LigneDevis_Store.filtrebyDevis(this.selected_devis())
    let ent_id = this.Devis_Store.donnees_devis().find(x => x.id == this.selected_devis())?.entreprise_id
    let ent_objet = this.Devis_Store.donnees_devis().find(x => x.id == this.selected_devis())?.objet
    this.entreprise_id.set(ent_id ? ent_id : '')
    this.devis_objet.set(ent_objet ? ent_objet : '')
    this.expandedElement = null
  }

  click_parent(data: Ligne_devis, ind: number) {
    let rep = !data.collapsed
    let code = data.code
    let idsAll = this.find_childsAll(code)
    let idsAllDirect = this.find_childsDirect(code)
    this.donnees()[ind].collapsed = !data.collapsed
    if (rep == true) {
      for (let i in this.donnees()) {
        if (idsAllDirect.includes(this.donnees()[i].code)) {
          this.donnees()[i].isvisible = true
        }
      }
    }
    else {
      for (let i in this.donnees()) {
        if (idsAll.includes(this.donnees()[i].code)) {
          this.donnees()[i].isvisible = false
          this.donnees()[i].collapsed = false
        }
      }
    }
  }
  find_childsAll(code: string) {
    let codes: any = []
    let niv1 = this.donnees().filter(x => x.parent_code == code)
    if (niv1.length > 0) {
      for (let row of niv1) {
        codes.push(row.code)
      };
      niv1.forEach(element => {
        let code = element.code
        let niv2 = this.donnees().filter(x => x.parent_code == code)
        if (niv2.length > 0) {
          for (let row of niv2) {
            codes.push(row.code)
          };
          niv2.forEach(element => {
            let code = element.code
            let niv3 = this.donnees().filter(x => x.parent_code == code)
            if (niv3.length > 0) {
              for (let row of niv3) {
                codes.push(row.code)
              }
            }
          });
        }
      });
    }
    return codes
  }
  find_childsDirect(code: string) {
    let codes: any = []
    let niv1 = this.LigneDevis_Store.donnees_Lignedevis().filter(x => x.parent_code == code)
    if (niv1.length > 0) {
      for (let row of niv1) {
        codes.push(row.code)
      };
    }
    return codes
  }
  ajouter() {
    if (this.authservice.is_connected()?.niveau != 3) {
      alert("Vous n'avez pas les droits nécessaires pour effectuer cette opération")
    }
    else {
      this.is_rubrique_parent.set(false)
      this.is_table_updated.set(false)
      this.is_table_opened.set(true)
      this.type_rubrique.set('1')
      let devis = this.Devis_Store.donnees_devis().find(x => x.id == this.expandedElement?.devis_id)
      this.table_update_form.reset()
      this.table_update_form.patchValue(
        {
          'code_parent': this.expandedElement?.code,
          'designation_parent': this.expandedElement?.designation,
          'code': devis?.code + 'LN' + this.last_num().toString()
        }
      )
    }

  }
  clicker(data: any) {
    this.expandedElement = this.expandedElement == data ? null : data;
    this.ajout.set(this.has_child().includes(data.code))
  }
  updateTableData() {
    let value = this.table_update_form.value
    if (this.table_update_form.valid) {
      if (this.is_table_updated()) {
        if (this.type_rubrique() == "1") {
          let parent = this.LigneDevis_Store.donnees_Lignedevis().find(x => x.code == this.ligne_parent.parent_code)
          let lignes = {
            id: value.id,
            code: this.table_update_form.getRawValue().code,
            devis_id: this.selected_devis(),
            parent_code: parent ? parent.code : '',
            designation: value.designation,
            prix_u: 0,
            unite: '',
            quantite: 0,
            poste: value.poste,
          }
          this.LigneDevis_Store.updateLigneDevis(lignes)
        } else {
          let parent = this.LigneDevis_Store.donnees_Lignedevis().find(x => x.code == this.ligne_parent.parent_code)
          let lignes = {
            id: value.id,
            code: this.table_update_form.getRawValue().code,
            devis_id: this.selected_devis(),
            parent_code: parent ? parent.code : '',
            designation: value.designation,
            prix_u: value.prix_u,
            unite: value.unite,
            quantite: value.quantite,
            poste: value.poste,
          }
          this.LigneDevis_Store.updateLigneDevis(lignes)
        }

      }
      else {
        if (this.type_rubrique() == "1") {
          let lignes = {
            code: this.table_update_form.getRawValue().code,
            devis_id: this.selected_devis(),
            parent_code: this.expandedElement != null ? this.expandedElement?.code : '',
            designation: value.designation,
            prix_u: 0,
            unite: '',
            quantite: 0,
            poste: value.poste,
          }
          this.LigneDevis_Store.addLigneDevis(lignes)
        }
        else {
          let lignes = {
            code: this.table_update_form.getRawValue().code,
            devis_id: this.selected_devis(),
            parent_code: this.expandedElement != null ? this.expandedElement?.code : '',
            designation: value.designation,
            prix_u: value.prix_u,
            unite: value.unite,
            quantite: value.quantite,
            poste: value.poste,
          }
          this.LigneDevis_Store.addLigneDevis(lignes)
        }

      }
    }
    this.is_table_opened.set(false)
  }
  annuler() {
    this.is_table_opened.set(false)
  }
  edit(value: any) {
    if (this.authservice.is_connected()?.niveau != 3) {
      alert("Vous n'avez pas les droits nécessaires pour effectuer cette opération")
    }else
    {
      this.ligne_parent = value
      this.current_code.set(value.code)
      if (this.has_child().includes(this.current_code())) {
        this.type_rubrique.set('1')
      }
      else {
        this.type_rubrique.set('2')
      }
      this.is_table_updated.set(true)
      this.is_table_opened.set(true)
      this.table_update_form.patchValue(
        {
          id: value.id,
          code: value.code,
          devis_id: value.devis_id,
          designation: value.designation,
          prix_u: value.prix_u,
          unite: value.unite,
          quantite: value.quantite,
          montant: value.montant,
          collapsed: value.collapsed,
          isvisible: value.isvisible,
          poste: value.poste,
        }
      )
    }

  }
  delete(data: any) {
    if (this.authservice.is_connected()?.niveau != 3) {
      alert("Vous n'avez pas les droits nécessaires pour effectuer cette opération")
    }
    else
    {
      let ids1: any = []
      let ids2: any = []
      if (confirm("La suppression de cet élement entrainera la supression d'autres élements liés, voulez-vous supprimer cet élement?")) {
        let niv1 = this.LigneDevis_Store.donnees_Lignedevis().filter(x => x.parent_code == data.code)
        if (niv1) {
          niv1.forEach(element => {
            ids1.push(element.id)
            let niv2 = this.LigneDevis_Store.donnees_Lignedevis().filter(x => x.parent_code == element.code)
            if (niv2) {
              niv2.forEach(element => {
                ids2.push(element.id)
              });
            }
          });
        }
        this.LigneDevis_Store.removeLigneManyDevis(ids1.concat(ids2, data.id))
      }

    }

  }
  ajouter_rubrique() {
    if (this.authservice.is_connected()?.niveau != 3) {
      alert("Vous n'avez pas les droits nécessaires pour effectuer cette opération")
    }else
    {
      this.is_table_updated.set(false)
      this.is_table_opened.set(true)
      this.is_rubrique_parent.set(true)
      this.type_rubrique.set("1")
      let devis = this.Devis_Store.donnees_devis().find(x => x.id == this.selected_devis())
      this.table_update_form.reset()
      this.table_update_form.patchValue(
        {
          'code': devis?.code + 'LN' + this.last_num().toString()
        }
      )
    }

  }
  choix_type_rubrique() {


  }
}
