import { Component, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NonNullableFormBuilder } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, single } from 'rxjs';
import { conso, Engins, Gasoil, valueXY } from '../../models/modeles';
import { GasoilStore, EnginsStore, ClasseEnginsStore, ApproGasoilStore } from '../../store/appstore';
import { ImportedModule } from '../../modules/imported/imported.module';
import { SaisiComponent } from '../../utilitaires/saisi/saisi.component';
import { ApprogoComponent } from '../approgo/approgo.component';
import { EssaiComponent } from '../essai/essai.component';
import { WenService } from '../../wen.service';
import { GasoilModelComponent } from '../gasoil-model/gasoil-model.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-gasoil',
  standalone: true,
  imports: [ImportedModule, SaisiComponent, ApprogoComponent, EssaiComponent, GasoilModelComponent],
  templateUrl: './gasoil.component.html',
  styleUrl: './gasoil.component.scss'
})
export class GasoilComponent {
  readonly gasoil_store = inject(GasoilStore);

  readonly approgo_store = inject(ApproGasoilStore);

  readonly engins_store = inject(EnginsStore);

  readonly classes_store = inject(ClasseEnginsStore);
  is_open2 = signal(false)
  is_table_being_updated = false
  formG2: FormGroup
  is_new_row_being_added = false
  is_new_ajout = false


  is_click_choix = true
  selected_compteur = signal("")
  engin_classe: string | undefined
  madate = signal('');
  selected_engin_id = signal("");
  selected_classe_id = signal("");
  selectEnginName = signal("");
  selectClasseName = signal("");
  //unique_date: string[] = []
  default_date = signal(new Date())
  stock_go$: Observable<number>
  conso$: Observable<conso[]>
  conso_du_jour: number = 0
  floatLabelControl = new FormControl('tout');
  date_choice = 'tout'
  title = ''

  chartOptions = computed(() => {
    var mydata = this.gasoil_store.historique_consogo()[0]
    return {
      title: {
        text: "Historique consommation gasoil"
      },
      theme: "light2",
      animationEnabled: true,

      axisX: {
        title: "Date",
        gridThickness: 1,
        tickLength: 10
      },
      axisY: {
        title: "Gasoil(l)",
        gridThickness: 1,
        tickLength: 10,
        includeZero: true

      },
      data: [{
        type: "column", //change type to bar, line, area, pie, etc
        indexLabel: "{y}", //Shows y value on all Data Points
        indexLabelFontColor: "#5A5757",
        dataPoints: mydata
      }]
    }
  }
  )
  selectedEngin: Engins | undefined;
  donnees_engins = computed(
    () => this.engins_store.donnees_engins()
  );
  donnees_enginsByclass = computed(
    () => {
      if (this.selected_classe_id() == "") {
        return this.engins_store.donnees_engins();
      }
      else {
        return this.engins_store.donnees_engins().filter(x => x.classe_id == this.selected_classe_id());
      }
    }
  );
  code_parc = computed(() => {
    let code: any = []
    this.gasoil_store.datasource().forEach(element => {
      let Myengins = this.engins_store.donnees_engins().find(x => x.id == element.id_engin)
      code.push(Myengins?.code_parc)
    });
    return code
  })
  designation_engin = computed(() => {
    let code: any = []
    this.gasoil_store.datasource().forEach(element => {
      let Myengins = this.engins_store.donnees_engins().find(x => x.id == element.id_engin)
      code.push(Myengins?.designation)
    });
    return code
  })

  popuplist = computed(() => {
    return [{
      'value': "ok",
      'titre': 'Compteur Ok'
    },
    {
      'value': "panne",
      'titre': 'Compteur panne'
    }
    ]
  })
  fb = inject(NonNullableFormBuilder)
  table_update_form = this.fb.group({
    id: new FormControl(),
    numero: new FormControl(),
    classe_id: new FormControl('', Validators.required),
    id_engin: new FormControl("", Validators.required),
    date: new FormControl(new Date(), Validators.required),
    designation: new FormControl({ value: '', disabled: true }, Validators.minLength(2)),
    compteur: new FormControl(''),
    quantite_go: new FormControl('', [Validators.required, Validators.min(1)])
  })
  displayedColumns = {
    'date': 'DATE',
    'designation': 'DESIGNATION',
    'code_parc': 'CODE PARC',
    'compteur': 'COMPTEUR',
    'quantite_go': 'QUANTITE GO',
    'actions': ''
  }
  selectedControleName = signal('')
  titre_tableau = signal('Gestion du gasoil')
  table = computed(() => {
    let mytable =
      [{
        label: 'situation panne',
        type: 'radio',
        control_name: 'situation_cp',
        end_control_name: '',
        tableau: [],
        radio_button_tab: this.popuplist()
      }, {
        label: 'DATE',
        type: 'date',
        control_name: 'date',
        end_control_name: '',
        tableau: [],
        radio_button_tab: []
      },
      {
        label: 'CLASSE MATERIEL',
        type: 'select',
        control_name: 'classe_id',
        end_control_name: '',
        tableau: this.classe_select(),
        radio_button_tab: []
      },

      {
        label: 'CODE PARC',
        type: 'select',
        control_name: 'id_engin',
        end_control_name: '',
        tableau: [],
        radio_button_tab: []
      },
      {
        label: 'DESIGNATION',
        type: 'text1',
        control_name: 'designation',
        end_control_name: '',
        tableau: [],
        radio_button_tab: []
      },
      {
        label: 'QUANTITE GO',
        type: 'number',
        control_name: 'quantite_go',
        end_control_name: '',
        tableau: [],
        radio_button_tab: []
      },
      {
        label: 'COMPTEUR',
        type: 'number',
        control_name: 'compteur',
        end_control_name: '',
        tableau: [],
        radio_button_tab: []
      }
      ]
    return mytable
  })
  classe_select = computed(() => {
    let donnees: any = []
    this.classes_store.classes_engins()
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
  code_parc_select = computed(() => {
  });
  total_conso = computed(() => {
    let go = this.gasoil_store.datasource().map(x => Number(x.quantite_go));
    return this._service.somme(go)
  });
  dataSource = computed(
    () => {
      let donnees: any = []
      this.gasoil_store.datasource().forEach(element => {
        let engin = this.engins_store.donnees_engins().find(x => x.id == element.id_engin)
        donnees.push(
          {
            'id': element.id,
            'situation_cp': 'ok',
            'designation': engin?.designation,
            'id_engin': element.id_engin,
            'classe_id': engin?.classe_id,
            'code_parc': engin?.code_parc,
            'compteur': element.compteur,
            'quantite_go': element.quantite_go,
            'date': element.date,
            'numero': element.numero,
            'diff_work': element.diff_work
          }
        )
      });
      return donnees
    }
  );

  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator2: MatPaginator
  @ViewChild(MatSort) sort2: MatSort;
  mydata: valueXY[]
  constructor(
    private _fb: FormBuilder,
    private _service: WenService
  ) {
    this.formG2 = this._fb.group({
      date_debut: new FormControl(new Date(), Validators.required),
      date_fin: new FormControl(new Date(), Validators.required)
    });

  }
  ngOnInit() {
    this.default_date.set(new Date())
    this.madate.set(new Date().toLocaleDateString())
    this.gasoil_store.loadconso()
    this.approgo_store.loadappro()
    this.engins_store.loadengins()
    this.classes_store.loadclasses()
    this.gasoil_store.setCurrentDate(this.madate())
  }

  addEvent(event: MatDatepickerInputEvent<any>) {
    this.default_date.set(event.value)
    this.madate.set(event.value.toLocaleDateString())
    this.gasoil_store.filtrebyDate([this.madate()])
  }

  annuler() {
    this.is_table_being_updated = false
    this.table_update_form.reset()
  }
  editmat(data: Gasoil) {

  }
  addmat() {

  }

  click_slider() {
    if (this.is_click_choix) {
      this.gasoil_store.filtrebyDate([this.madate()])
    }
    else {
      this.gasoil_store.filtrebyDate([''])
    }
    this.is_click_choix = !this.is_click_choix
  }
  redir() { }
  private convertdate(mdate: string) {
    const [day, month, year] = mdate.split("/")
    const date = new Date(+year, +month - 1, +day)
    return date
  }
  situation_compteur(data: any) {
    this.selected_compteur.set(data.value)
    let data1 = this.selected_compteur()
    if (data1 == "ok") {
      this.table_update_form.get('compteur')?.enable();
      this.table_update_form.get('diff_compteur')?.disable();
      this.table_update_form.get('compteur')?.setValidators([Validators.required, Validators.min(1)])
      this.table_update_form.get('diff_compteur')?.clearValidators()

    }
    if (data1 == "panne") {
      this.table_update_form.get('diff_compteur')?.enable();
      this.table_update_form.get('compteur')?.disable();
      this.table_update_form.get('compteur')?.clearValidators()
      this.table_update_form.get('diff_compteur')?.setValidators([Validators.required, Validators.min(1)])
    }
  }
  choix_date() {
    let cas = this.floatLabelControl.value
    switch (cas) {
      case 'date':
        this.date_choice = 'date'
        this.gasoil_store.filtrebyDate([this.madate()])
        this.gasoil_store.setCurrentDate(this.madate())
        break
      case 'idate':
        this.date_choice = 'idate'
        if (this.formG2.valid) {
          let value = this.formG2.value
          this.gasoil_store.filtrebyDate([value.date_debut.toLocaleDateString(), value.date_fin.toLocaleDateString()])
        }
        break
      case 'tout':
        this.date_choice = 'tout'
        this.gasoil_store.filtrebyDate([''])
        break
    }
  }

  dateRangeChange() {
    if (this.formG2.valid) {
      let value = this.formG2.value
      if (value.date_debut != null && value.date_fin != null) {
        this.gasoil_store.filtrebyDate([value.date_debut.toLocaleDateString(), value.date_fin.toLocaleDateString()])
      }
    }
  }
  updateData(data: any) {

    let valeur = data[0];
    let is_update = data[2];
    if (is_update) {
      let val_tr =
      {
        id: valeur.id,
        id_engin: valeur.id_engin,
        date: valeur.date.toLocaleDateString(),
        quantite_go: valeur.quantite_go,
        diff_work: "0",
        numero: valeur.numero,
        compteur: valeur.compteur != null ? valeur.compteur.toString() : "0",
      }
      this.gasoil_store.updateconso(val_tr)
    }
    else {

      let val_tr =
      {
        id_engin: valeur.id_engin,
        date: valeur.date.toLocaleDateString(),
        quantite_go: valeur.quantite_go,
        compteur: valeur.compteur != null ? valeur.compteur.toString() : "0",
        diff_work: "0",
        numero: (this.gasoil_store.lastNum() + 1).toString()

      }
      this.gasoil_store.addconso(val_tr);
    }

  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this.gasoil_store.removeconso(id)
  }
  recherche(word: any) {
  }
  afficheTout() {
  }
  changeSelect(data: any) {
    let controle_name = data[1];
    this.selectedEngin = undefined;
    let ind = this.table().findIndex(x => x.control_name == "id_engin")

    switch (controle_name) {
      case 'classe_id':
        let classe_id = data[0]
        let tab = this.engins_store.donnees_engins().filter(x => x.classe_id == classe_id).map(x => {
          return {
            'id': x.id,
            'valeur': x.code_parc
          }
        })
        this.table()[ind].tableau = tab

        this.table_update_form.get('designation')?.setValue('')
        break
      case 'id_engin':
        let id = data[0]
        let engin = this.engins_store.donnees_engins().find(x => x.id == id)
        this.selectedEngin = engin;
        if (engin)
          this.table_update_form.get('designation')?.setValue(engin?.designation)

    }
  }
  PatchEventFct(row: any) {
    if (Number(row.compteur) > 0) {
      this.selected_compteur.set('ok')
    }
    else {
      this.selected_compteur.set('panne')
      this.table_update_form.get('compteur')?.setValue('0')
    }
    let ind = this.table().findIndex(x => x.control_name == "id_engin")
    let tab = this.engins_store.donnees_engins().filter(x => x.classe_id == row.classe_id).map(x => {
      return {
        'id': x.id,
        'valeur': x.code_parc
      }
    }
    )
    this.table()[ind].tableau = tab
    let dates = this._service.convertDate(row.date)
    row.date = dates
    this.table_update_form.patchValue(
      row
    )
  }
  addEventFct() {
    this.table_update_form.reset()
    this.selected_compteur.set('ok')
    let dates = new Date()
    this.table_update_form.get('date')?.setValue(dates)
  }

  ouvrir_conso() {
    this.is_open2.set(true)
  }

  selectChangeEngin(data: any) {
    let engin = this.engins_store.donnees_engins().find(x => x.id == data)
    if (engin) {
      this.selectEnginName.set(engin.designation + ' - ' + engin.code_parc);
    } else {
      this.selectEnginName.set("");
    }

    this.gasoil_store.filterByEnginId(this.selected_engin_id());
  }
  selectChangeEnginByclass(data: any) {
    let classe = this.classes_store.classes_engins().find(x => x.id == data)
    if (classe) {
      this.selectClasseName.set(classe.designation);
    }
    else {
      this.selectClasseName.set("");
    }
    this.gasoil_store.filterByClassId(this.selected_classe_id());
  }
  printgasoil() {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });

    doc.setFontSize(12);
    doc.text('CGE BTP', 23, 40);
    doc.text('VILLE NOUVELLE DE YENNENGA', 23, 50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    let titre = "RAPPORT DE CONSOMMATION DU GASOIL"
    let textWidth = doc.getTextWidth(titre);
    var yline = 60;
    doc.setLineWidth(1)
    doc.setFillColor(225, 225, 225);
    doc.rect(doc.internal.pageSize.getWidth() / 2 - textWidth / 2 - 5, yline + 5, textWidth + 10, 15, 'FD');
    doc.text(titre, doc.internal.pageSize.getWidth() / 2 - textWidth / 2, yline + 13);

    var yline = 90;
    if (this.selectClasseName() != "") {
      let titre1 = this.selectClasseName();
      let textWidth1 = doc.getTextWidth(titre1);
      doc.text(titre1, doc.internal.pageSize.getWidth() / 2 - textWidth1 / 2, yline);

    }
    if (this.selectEnginName() != "") {
      yline = yline + 10;
      let titre2 = this.selectEnginName();
      let textWidth2 = doc.getTextWidth(titre2);
      doc.text(titre2, doc.internal.pageSize.getWidth() / 2 - textWidth2 / 2, yline);
    }
    let long = this.gasoil_store.datasource().length;
    let periode = "";
    doc.setFontSize(12);
    if (this.date_choice == "idate" || this.date_choice == "tout") {
      periode = "PERIODE: du " + this.gasoil_store.datasource()[long - 1].date + " au " + this.gasoil_store.datasource()[0].date
    }
    if (this.date_choice == "date") {
      periode = "DATE: " + this.gasoil_store.datasource()[0].date;
    }

    doc.text(periode, 15, yline + 10);
    let data = this.gasoil_store.datasource();
    let data_imp = []
    for (let row of data) {
      let engin = this.engins_store.donnees_engins().find(x => x.id == row.id_engin);
      if (this.selectEnginName() == "") {
        data_imp.push(
          [{
            content: row.date,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          },
          {
            content: engin?.code_parc,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          }
            ,
          {
            content: engin?.designation,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          }
            ,
          {
            content: row.quantite_go,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          }
          ]
        );
      } else {
        data_imp.push(
          [{
            content: row.date,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          }
            ,
          {
            content: row.quantite_go,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          }
          ]
        );
      }
    }
    let head0: any = []
    if (this.selectEnginName() == "") {
      head0 = [{
        content: 'DATE',
        styles: {
          halign: 'center'
        }
      }
        ,
      {
        content: 'CODE PARC',
        styles: {
          halign: 'center'
        }
      },

      {
        content: 'DESIGNATION',
        styles: {
          halign: 'center'
        }
      },
      {
        content: 'QUANTITE GO',
        styles: {
          halign: 'center'
        }
      }
      ];
      data_imp.push(
        [{
          content: 'TOTAL (litre)',
          colSpan: 3,
          styles: {
            fontSize: 10,
            fontStyle: "bold",
            halign: 'center',
            fillColor: [200, 160, 160]
          }
        },
        {
          content: this._service.FormatMonnaie( this.total_conso()) ,
          styles: {
            fontSize: 10,
            fontStyle: "bold",
            halign: 'center',
            fillColor: [200, 160, 160]
          }
        }
      ])

    } else {
      head0 = [{
        content: 'DATE',
        styles: {
          halign: 'center'
        }
      },
      {
        content: 'QUANTITE GO',
        styles: {
          halign: 'center'
        }
      }
      ]
      data_imp.push(
        [{
          content: 'TOTAL (litre)',
          colSpan: 1,
          styles: {
            fontStyle: "bold",
            halign: 'center',
            fontSize: 10,
            fillColor: [200, 160, 160]
          }
        },
        {
          content: this._service.FormatMonnaie( this.total_conso()),
          styles: {
            fontStyle: "bold",
            halign: 'center',
            fontSize: 10,
            fillColor: [200, 160, 160]
          }
        }
      ])
    }

    let doker: any = {
      startY: yline + 20,
      tableLineWidth: 0.1,
      head: [head0],
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        valign: "middle",
        halign: "center",
      },
      headStyles: {
        fontStyle: "bold",
        fontSize: 8,
        textColor: [0, 0, 0],
        fillColor: [160, 160, 160],
      },
      bodyStyles: {
        fontSize: 8,
        minCellHeight: 10
      },
      body: data_imp,
      theme: "grid"
    };
    var img = new Image();
    img.src = 'assets/images/logocge.png';
    doc.addImage(img, 'png', 20, 20, 25, 15)
    autoTable(doc, doker);
    let finalY = (doc as any).lastAutoTable.finalY;
    if (finalY > doc.internal.pageSize.getHeight() - 40) {
      finalY = 40;
      doc.addPage();
    }


    const totalPages: number = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8)
    var img = new Image();
    img.src = 'assets/images/logo_index.png';
    doc.setLineWidth(0.25)
    for (let i = 1; i <= totalPages; i++) {
      doc.line(10, doc.internal.pageSize.getHeight() - 10, doc.internal.pageSize.getWidth() - 10, doc.internal.pageSize.getHeight() - 10);
      //pdfDoc.addImage(img, 'png', 180, 3, 15, 10)
      doc.setPage(i);
      doc.setFont('Newsreader', 'italic');
      doc.text(
        `Page ${i} / ${totalPages}`,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 5, { align: 'justify' }
      );
    }
    doc.save('rapportGo' + new Date().getTime() + '.pdf');
  }
}
