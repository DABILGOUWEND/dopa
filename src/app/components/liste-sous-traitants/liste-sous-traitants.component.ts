import { Component, OnInit, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx'

//import jsPDF from 'jspdf'

import jsPDF from 'jspdf'
import autoTable, { Styles } from 'jspdf-autotable';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SaisiComponent } from '../../utilitaires/saisi/saisi.component';
import { ImportedModule } from '../../modules/imported/imported.module';
import { Observable } from 'rxjs';
import { sous_traitant } from '../../models/modeles';
import { WenService } from '../../wen.service';

@Component({
  selector: 'app-liste-sous-traitants',
  standalone: true,
  imports: [ImportedModule, SaisiComponent],
  templateUrl: './liste-sous-traitants.component.html',
  styleUrl: './liste-sous-traitants.component.scss'
})
export class ListeSousTraitantsComponent implements OnInit {

  liste_soustraitant$: Observable<sous_traitant[]>
  selected_sstraitant: string
  my_sous_traitant: any = []

  is_table_being_updated = false
  is_new_row_being_added = false
  text1: string = 'text'
  text2: string = 'select1'
  text3: string = 'select2'
  text5: string = 'select3'
  text4: string = 'number'


  datasource: MatTableDataSource<sous_traitant>
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort;
  table_update_form: FormGroup

  displayedColumns: string[] = ['entreprise', 'nom', 'prenom', 'phone', 'rccm', 'ifu', 'actions']
  docStyles: Partial<Styles>;
  printHeadStyles: Partial<Styles>;
  printColumns: any[];
  printColumnsStyles: any;
  readonly dataCount: number = 100000;
  donnees: any = []


  constructor(
    private _service:WenService,
    private _fb: FormBuilder
  ) {
    this.table_update_form = this._fb.group(
      {
        id: new FormControl(),
        entreprise: new FormControl('', Validators.required),
        enseigne: new FormControl('', Validators.required),
        ifu: new FormControl('', Validators.required),
        rccm: new FormControl('', Validators.required),
        adresse: new FormControl(''),
        phone: new FormControl('', Validators.required),
        nom_responsable: new FormControl('', Validators.required),
        prenom_responsable: new FormControl('', Validators.required),
        date_naissance: new FormControl(''),
        lieu_naissance: new FormControl(''),
        num_cnib: new FormControl(''),

      }
    )

  }
  ngOnInit() {
  }
  private updateDatasource(reponse: sous_traitant[]) {
    this.datasource = new MatTableDataSource(reponse);
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }
  choix_sstraitant() {
  }
  create_contrat() {

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
      this.donnees = XLSX.utils.sheet_to_json(worksheet, { raw: true });

    }

    oReq.send()
  }

  annuler() {
    this.is_table_being_updated = false

  }
  affichertout() { }
  addsstraitant() {
    this.is_table_being_updated = true
    this.is_new_row_being_added = true

    this.table_update_form.patchValue({
      id: '',
      entreprise: '',
      enseigne: '',
      phone: '',
      adresse: '',
      nom_responsable: '',
      prenom_responsable: '',
      ifu: '',
      rccm: '',
      date_naissance: '',
      lieu_naissance: '',
      num_cnib: ''
    })
  }
  editsstraitant(data: any) {
    this.is_table_being_updated = true
    this.is_new_row_being_added = false
    this.table_update_form.patchValue({
      id: data.id,
      entreprise: data.entreprise,
      enseigne: data.enseigne,
      phone: data.phone,
      adresse: data.adresse,
      nom_responsable: data.nom_responsable,
      prenom_responsable: data.prenom_responsable,
      ifu: data.ifu,
      rccm: data.rccm,
      date_naissance: data.date_naissance,
      lieu_naissance: data.lieu_naissance,
      num_cnib: data.num_cnib
    })
  }
  deletesstraitant(data: any) {
    //if (confirm('voulez-vous supprimer cet élement?')){this.sstraitant_store.dispatch(SoustraitantsActions.deleteSoustraitants({id: data.id }))}
      
   }

  updateTableData() {
    if (this.table_update_form.valid) {
      var data:any = this.table_update_form.value;
      if (this.is_new_row_being_added) {
        let mydata: sous_traitant = {
          id: '',
          entreprise: data.entreprise,
          enseigne: data.enseigne,
          phone: data.phone,
          adresse: data.adresse,
          nom_responsable: data.nom_responsable,
          prenom_responsable: data.prenom_responsable,
          ifu: data.ifu,
          rccm: data.rccm,
          date_naissance: data.date_naissance,
          lieu_naissance: data.lieu_naissance,
          num_cnib: data.num_cnib
        }
       // this.sstraitant_store.dispatch(SoustraitantsActions.addSoustraitants({sstraitant: mydata }))
      }
      else {
        let mydata: sous_traitant = {
          id: data.id,
          entreprise: data.entreprise,
          enseigne: data.enseigne,
          phone: data.phone,
          adresse: data.adresse,
          nom_responsable: data.nom_responsable,
          prenom_responsable: data.prenom_responsable,
          ifu: data.ifu,
          rccm: data.rccm,
          date_naissance: data.date_naissance,
          lieu_naissance: data.lieu_naissance,
          num_cnib: data.num_cnib
        }
       // this.sstraitant_store.dispatch(SoustraitantsActions.updateSoustraitants({ soustraitants: mydata }))
      }

      this.is_table_being_updated = false;
    }
  }
}
