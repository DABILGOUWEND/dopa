import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { SaisiComponent } from '../../utilitaires/saisi/saisi.component';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ThemePalette } from '@angular/material/core';
import { ContratStore, ProjetStore, SstraitantStore } from '../../store/appstore';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { Contrats, Projet, sous_traitant } from '../../models/modeles';
import { WenService } from '../../wen.service';

import readXlsxFile from 'read-excel-file'
import * as XLSX from 'xlsx'


export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}

@Component({
  selector: 'app-contrat-sstraitant',
  standalone: true,
  imports: [ImportedModule, SaisiComponent],
  templateUrl: './contrat-sstraitant.component.html',
  styleUrl: './contrat-sstraitant.component.scss'
})
export class ContratSstraitantComponent implements OnInit {
  contrat_Store = inject(ContratStore)
  soustraitant_Store = inject(SstraitantStore)
  projet_Store = inject(ProjetStore)
  default_date=new Date()
  task: Task = {
    name: 'Indeterminate',
    completed: false,
    color: 'primary',
    subtasks: [
      { name: 'Primary', completed: false, color: 'primary' },
      { name: 'Accent', completed: false, color: 'accent' },
      { name: 'Warn', completed: false, color: 'warn' },
    ],
  };

  allComplete: boolean = false;
  selected: boolean[] = []

  list_contrats$: Observable<Contrats[]>
  is_open = false
  choix_projet: string
  table_update_form: FormGroup
  is_new_row_being_added = false
  is_table_being_updated = false;
  text1: string = 'text'
  text2: string = 'select1'
  text3: string = 'select2'
  text5: string = 'select3'
  text6: string = 'select4'
  text7: string = 'select5'
  text4: string = 'number'
  data_impression=''

  donnees = computed(() => {
    let data = this.contrat_Store.donnees_contrat()
    var mydata: any = []
    data.forEach(t => {
      mydata.push({
        id: t.id,
        projet_id: t.projet_id,
        sous_traitant_id: t.sous_traitant_id,
        montant: t.montant,
        montant_avance: t.montant_avance,
        duree_travaux: t.duree_travaux,
        checked: false
      })
    })
    return mydata
  })

  sous_traitant = computed(() => {
    let rep: any = []
    let data_ss = this.soustraitant_Store.donnees_sstraitant()
    this.contrat_Store.donnees_contrat().forEach(element => {
      rep.push(data_ss.find(x => x.id == element.sous_traitant_id)?.entreprise)
    });
    return rep
  })

  
  travaux = computed(() => {
    let rep: any = []
    let data_pjt = this.projet_Store.donnees_projet()
    this.contrat_Store.donnees_contrat().forEach(element => {
      rep.push(data_pjt.find(x => x.id == element.projet_id)?.descrip_travaux)
    });
    return rep
  })

    
  projets = computed(() => {
    let rep: any = []
    let data_pjt = this.projet_Store.donnees_projet()
    this.contrat_Store.donnees_contrat().forEach(element => {
      rep.push(data_pjt.find(x => x.id == element.projet_id)?.intitule)
    });
    return rep
  })

  donnees_excel: any = []
  selected_projet: Projet | undefined
  selected_sstraitant: sous_traitant | undefined

  datasource = computed(() => new MatTableDataSource<Contrats>(this.contrat_Store.donnees_contrat())
  )
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['projet', 'sous_traitant', 'travaux', 'montant', 'avance', 'duree', 'actions']

  constructor(
    private service: WenService,
    private _fb: FormBuilder
  ) {
    this.table_update_form = this._fb.group({
      id: new FormControl(),
      projet_id: new FormControl('', Validators.required),
      sous_traitant_id: new FormControl('', Validators.required),
      montant: new FormControl(0, Validators.required),
      montant_avance: new FormControl(0, Validators.required),
      duree_travaux: new FormControl('', Validators.required)

    })
  }
  ngOnInit() {
    this.contrat_Store.loadContrat()
    this.soustraitant_Store.loadSstraitants()
    this.projet_Store.loadProjets()
    this.load()
  }

  projet_choice() {


  }

  editcontrat(row: any) {
    this.is_open = true
    this.is_new_row_being_added = false
    this.table_update_form.patchValue({
      id: row.id,
      projet_id: row.projet_id,
      sous_traitant_id: row.sous_traitant_id,
      montant: row.montant,
      montant_avance: row.montant_avance,
      duree_travaux: row.duree_travaux,
    })
  }
  addcontrat() {
    this.is_open = true
    this.is_new_row_being_added = true
    this.table_update_form.patchValue({
      id: '',
      montant: 0,
      montant_avance: 0,
      duree_travaux: '',
    })

  }

  deletecontrat(id: string) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this.contrat_Store.removeContrat(id)
  }

  annuler() { this.is_open = false }
  valider() {

  }

  updateTableData() {
    if (this.table_update_form.valid) {
      let valeur = this.table_update_form.value;
      if (this.is_new_row_being_added) {
        let data: Contrats = {
          id: '',
          projet_id: valeur.projet_id,
          sous_traitant_id: valeur.sous_traitant_id,
          montant: valeur.montant,
          montant_avance: valeur.montant_avance,
          duree_travaux: valeur.duree_travaux
        }
        this.contrat_Store.addContrat(data)
      }
      else {
        let data: Contrats = {
          id: valeur.id,
          projet_id: valeur.projet_id,
          sous_traitant_id: valeur.sous_traitant_id,
          montant: valeur.montant,
          montant_avance: valeur.montant_avance,
          duree_travaux: valeur.duree_travaux
        }
        this.contrat_Store.updateContrat(data)
      }

      this.is_open = false;
    }

  }

  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }
  setAll(completed: boolean) {
    this.allComplete = completed;

    this.donnees().forEach((t: any) => (t.checked = completed));
    this.selected = this.donnees().map((x: any) => x.checked)
  }
  is_checked(row: any) {
    this.donnees().forEach((t: any) => {
      if (t.id == row.id) {
        t.checked = !t.checked
      }
    }
    )
    this.selected = this.donnees().map((x: any) => x.checked)
  }
  imprimer() {
    var num = 1
    this.donnees().forEach(
      (t: any) => {
        if (t.checked) {
          this.soustraitant_Store.filtrebyId(t.sous_traitant_id)
          this.projet_Store.filtrebyId(t.projet_id)
          this.service.generatePDF(this.soustraitant_Store.donnees_sstraitantById(), this.donnees_excel, num, this.projet_Store.donnees_projetById(), t,this.data_impression)
          num++
        }
      }
    )
  }
  load() {

    var url = "assets/donnees.xlsx";
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = (e) => {
      var arraybuffer = oReq.response;

      /* convert data to binary string */
      var data = new Uint8Array(arraybuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");

      /* Call XLSX */
      var workbook = XLSX.read(bstr, { type: "binary" });

      /* DO SOMETHING WITH workbook HERE */
      var first_sheet_name = workbook.SheetNames[0];
      /* Get worksheet */
      var worksheet = workbook.Sheets[first_sheet_name];
      this.donnees_excel = XLSX.utils.sheet_to_json(worksheet, { raw: true });

    }
    oReq.send()
  }
  addEvent(event: MatDatepickerInputEvent<any>) {
    this.default_date=event.value
    this.data_impression = event.value.toLocaleDateString()
  }
}
