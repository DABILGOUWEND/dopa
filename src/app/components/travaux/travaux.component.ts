import { Component, computed, inject } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { Engins, travaux } from '../../models/modeles';
import { EnginsStore, GasoilStore, NatureTrvxStore, TravauxStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { ImportedModule } from '../../modules/imported/imported.module';

@Component({
  selector: 'app-travaux',
  standalone: true,
  imports: [ImportedModule],
  templateUrl: './travaux.component.html',
  styleUrl: './travaux.component.scss' 
})
export class TravauxComponent {
  constructor(
    _fb: FormBuilder
  ) {
    this.table_update_form = _fb.group({
      id: new FormControl(),
      quantite: new FormControl({ value: 0, disabled: false }, [Validators.min(1), Validators.required]),
    })
  }
  readonly engins_store = inject(EnginsStore)
  readonly gasoil_store = inject(GasoilStore)
  readonly travaux_store = inject(TravauxStore)
  readonly naturetrvx_store = inject(NatureTrvxStore)
  ngOnInit() {
    this.engins_store.loadengins()
    this.gasoil_store.loadconso()
    this.travaux_store.loadtravaux()
    this.naturetrvx_store.loadnaturetrvx()
    this.travaux_store.filterbyDate('')
    this.naturetrvx_store.filtrebyIds(['2mV4TKsUwpFX3z9lVRTx', 'U8aLBF8HTauHwrVD3SEG'])
    this.gasoil_store.filtrebyDate([this.default_date.toLocaleDateString()])

    this.travaux_store.filterbyDate(this.default_date.toLocaleDateString())

    this.selectedRow = this.engins_store.donnees_engins()[0]
    this.datestring = this.default_date.toLocaleDateString()

  }
  service = inject(WenService)
  default_date = new Date()
  datestring = ''
  is_open = false
  selected = new FormControl(0);
  is_updated = false;
  table_update_form: FormGroup
  selectedRow: Engins

  text1: string = 'text'
  text2: string = 'select1'
  text3: string = 'select2'
  text4: string = 'number'

  data_engin = {
    id: '',
    designation: '',
    quantite_go: 0
  }
  displayedColumns: string[] = ['designation', 'quantite_go', 'nature_trx', 'quantite', 'actions']
  engins_appro = computed(() => {
    return this.engins_store.donnees_engins().filter(x => {
      return x.classe_id == '42TDHnqUNEu5WZKaiKzt'
    })
  })

  engins_compactage = computed(() => {
    return this.engins_store.donnees_engins().filter(x => {
      return x.classe_id == '8mjmJ2vK1X7Y6pX5zZwg'
    })
  })

  gasoil_servi_appro = computed(() => {
    let gasoil = this.gasoil_store.datasource()
    let mygasoil: any = []
    this.engins_appro().forEach(element => {
      let filtre = gasoil.filter(x => x.id_engin == element.id)
      if (filtre) {
        mygasoil.push(this.service.somme(filtre.map(x => x.quantite_go)))
      }
      else {
        mygasoil.push(0)
      }
    });
    return mygasoil
  }
  )
  gasoil_servi_compact = computed(() => {
    let gasoil = this.gasoil_store.datasource()
    let mygasoil: any = []
    this.engins_compactage().forEach(element => {
      let filtre = gasoil.filter(x => x.id_engin == element.id)
      if (filtre) {
        mygasoil.push(this.service.somme(filtre.map(x => x.quantite_go)))
      }
      else {
        mygasoil.push(0)
      }
    });
    return mygasoil
  }
  )

  dataSource_appro = computed(
    () => new MatTableDataSource<Engins>(this.engins_appro()),
  );

  dataSource_compact = computed(
    () => new MatTableDataSource<Engins>(this.engins_compactage()),
  );

  quantite = computed(() => {
    let quantite: any = []
    let is_travail: any = []
    this.engins_appro().forEach(element => {
      let filter = this.travaux_store.donnees_travaux().filter(x => x.engin_id == element.id)
      if (filter.length > 0) {
        quantite.push(this.service.somme(filter.map(x => x.quantite)))
        is_travail.push(true)
      }
      else {
        quantite.push('')
        is_travail.push(false)
      }
    });
    return [quantite, is_travail]
  })
  appro_total = computed(() => {
    return this.service.somme(this.travaux_store.donnees_travaux().filter(x => x.nature_id == '2mV4TKsUwpFX3z9lVRTx' && x.date==this.default_date.toLocaleDateString()).map(x => x.quantite))
  })
  identifiant = computed(() => {
    let identifiant: any = []
    this.engins_appro().forEach(element => {
      let filter = this.travaux_store.donnees_travaux().find(x => x.engin_id == element.id)
      if (filter) {
        identifiant.push(filter.id)
      }
      else {
        identifiant.push('')
      }
    });

    return identifiant
  })


  chartOptions = computed(() => {
    var mydata = this.travaux_store.historique_appro()
    return {
      title: {
        text: "Appro de latérite"
      },
      theme: "light2",
      animationEnabled: true,

      axisX: {
        title: "Date",
        gridThickness: 1,
        tickLength: 10
      },
      axisY: {
        title: "Volume latérite(m3)",
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
  chartOptionsConsoGo = computed(() => {
    var mydata: any = this.travaux_store.historique_conso()
    var mydata1: any = this.travaux_store.historique_appro()
    return {
      title: {
        text: "Consommation gasoil/approvisionnement latérite)",

      },
      theme: "light2",
      animationEnabled: true,

      axisX: {
        title: "Date",
        gridThickness: 1,
        tickLength: 10
      },
      axisY: {
        title: "Gasoil (l)",
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC",
        includeZero: true

      }
      ,
      axisY2: {
        title: "latérite (m3)",
        titleFontColor: "#C0504E",
        lineColor: "#C0504E",
        labelFontColor: "#C0504E",
        tickColor: "#C0504E",
        includeZero: true
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer"
      },
      data: [{
        type: "column", //change type to bar, line, area, pie, etc
        indexLabel: "{y}", //Shows y value on all Data Points
        name: "gasoil",
        showInLegend: true,
        yValueFormatString: "#,##0.# litres",
        dataPoints: mydata
      },
      {
        type: "column",
        indexLabel: "{y}",
        name: "latérite",
        axisYType: "secondary",
        showInLegend: true,
        yValueFormatString: "#,##0.# m3",
        dataPoints: mydata1

      }]
    }
  }
  )
  addEvent(event: MatDatepickerInputEvent<any>) {
    this.default_date = event.value
    let madate = event.value.toLocaleDateString()
    this.gasoil_store.filtrebyDate([madate])
    this.travaux_store.filterbyDate(madate)
    this.datestring = this.default_date.toLocaleDateString()
  }

  edit(row: Engins, i: any) {
    this.is_open = true
    this.data_engin.designation = row.designation + ' ' + row.code_parc
    this.data_engin.quantite_go = this.gasoil_servi_appro()[i]
    this.data_engin.id = row.id
    this.table_update_form.patchValue({
      quantite: this.quantite()[0][i],
      id: this.identifiant()[i]
    })
    this.is_updated = true
  }
  addtravaux(row: Engins, i: any) {
    this.is_open = true
    this.data_engin.designation = row.designation + ' ' + row.code_parc
    this.data_engin.quantite_go = this.gasoil_servi_appro()[i]
    this.data_engin.id = row.id
    this.table_update_form.patchValue({
      quantite: 0
    })

    this.is_updated = false
  }
  remove(i: any) {
    this.travaux_store.removetravaux(this.identifiant()[i])
  }
  annuler() {
    this.is_open = false
  }

  updateTableData() {
    if (this.table_update_form.valid) {
      let value = this.table_update_form.value
      if (!this.is_updated) {
        let myval: travaux =
        {
          id: '',
          date: this.default_date.toLocaleDateString(),
          engin_id: this.data_engin.id,
          quantite: value.quantite,
          nature_id: '2mV4TKsUwpFX3z9lVRTx'
        }
        this.travaux_store.addtravaux(myval)
      }
      else {
        let myval: travaux =
        {
          id: value.id,
          date: this.default_date.toLocaleDateString(),
          engin_id: this.data_engin.id,
          quantite: value.quantite,
          nature_id: '2mV4TKsUwpFX3z9lVRTx'
        }
        this.travaux_store.updatetravaux(myval)
      }

      this.is_open = false
    }
  }


}
