import { Component, OnInit, ViewChild, computed, effect, inject, linkedSignal, model, signal } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NonNullableFormBuilder } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Engins, Gasoil } from '../../models/modeles';
import { GasoilStore, EnginsStore, ClasseEnginsStore, ApproGasoilStore, CompteStore, PannesStore, PersonnelStore, ProjetStore } from '../../store/appstore';
import { ImportedModule } from '../../modules/imported/imported.module';
import { SaisiComponent } from '../../utilitaires/saisi/saisi.component';
import { ApprogoComponent } from '../approgo/approgo.component';
import { EssaiComponent } from '../essai/essai.component';
import { WenService } from '../../wen.service';
import { GasoilModelComponent } from '../gasoil-model/gasoil-model.component';

import { TaskService } from '../../task.service';
import { GasoilService } from '../../services/gasoil.service';
import { sign } from 'node:crypto';
import { FormSaisiComponent } from '../form-saisi/form-saisi.component';
@Component({
  selector: 'app-gasoil',
  imports: [ImportedModule, FormSaisiComponent, ApprogoComponent],
  templateUrl: './gasoil.component.html',
  styleUrl: './gasoil.component.scss'
})
export class GasoilComponent implements OnInit {


  //injections
  _engins_store = inject(EnginsStore);
  _classe_store = inject(ClasseEnginsStore);
  _task_service = inject(TaskService);
  _gasoil_store = inject(GasoilStore);
  _appro_go = inject(ApproGasoilStore);
  _service: WenService = inject(WenService);
  fb = inject(NonNullableFormBuilder);
  _gasoil_service = inject(GasoilService);

  //signal variables
  selected_compteur = signal("");
  madate = signal("");
  selected_engin_id = signal("");
  selected_classe_id = signal("");
  selectEnginName = signal("");
  selectClasseName = signal("");
  default_date = signal(new Date());
  is_click_choix = signal(true);
  floatLabelControl = signal("tout");
  date_choice = signal("tout");
  selectedEngin = signal<Engins | undefined>(undefined);
  titre_tableau = signal("Gestion du gasoil");
  appro_opened = signal(false)
  is_update = signal(false);
  current_row = model<any>()
  //others variables and consts
  formG2: FormGroup;

  displayedColumns: any = {
    'date': 'DATE',
    'designation': 'DESIGNATION',
    'code_parc': 'CODE PARC',
    'compteur': 'COMPTEUR',
    'quantite_go': 'QUANTITE GO',
    'actions': ''
  }
  popuplist = [
    {
      'value': "ok",
      'titre': 'Compteur Ok'
    },
    {
      'value': "panne",
      'titre': 'Compteur panne'
    }
  ]
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator2: MatPaginator
  @ViewChild(MatSort) sort2: MatSort;
  //computed variables
  donnees_enginsByclass = computed(() => {
    if (this.selected_classe_id() === "") {
      return this._engins_store.donnees_engins();
    }
    else {
      return this._engins_store.donnees_engins().
        filter(x => x.classe_id === this.selected_classe_id());
    }
  }
  );
  table = computed(() => {
    return [
      {
        label: 'situation panne',
        type: 'radio',
        control_name: 'situation_cp',
        end_control_name: '',
        tableau: [],
        radio_button_tab: this.popuplist
      },
      {
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
        control_name: 'engin_id',
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
  })
  classe_select = computed(() => {
    return this._classe_store.classes_engins().map(x => {
      return {
        'id': x.id,
        'valeur': x.designation
      }
    })

  })
  engins_select = signal<any>([])
  total_conso = computed(() => {
    let go = this._gasoil_store.datasource().map((x: any) => x.quantite_go);
    return this._service.somme(go)
  });

  header_titles: string[] = [];
  table_update_form = this.fb.group({
    id: new FormControl(),
    numero: new FormControl(),
    classe_id: new FormControl("", Validators.required),
    engin_id: new FormControl("", Validators.required),
    date: new FormControl(new Date(), Validators.required),
    designation: new FormControl({ value: "", disabled: true }, Validators.minLength(2)),
    compteur: new FormControl(0),
    quantite_go: new FormControl(0, [Validators.required, Validators.min(1)])
  })
  constructor(
  ) {
    this.formG2 = this.fb.group({
      date_debut: new FormControl(new Date(), Validators.required),
      date_fin: new FormControl(new Date(), Validators.required)
    });

    effect(() => {
    })
  }
  datacourbe = computed(() => {
    return [{
      type: "column", //change type to bar, line, area, pie, etc
      indexLabel: "{y}", //Shows y value on all Data Points
      indexLabelFontColor: "#5A5757",
      dataPoints: this._gasoil_store.historique_consogo()[0]
    }]
  })
  historique_conso = computed(() => {
    let unique_dates = [...new Set(this._gasoil_store.datasource().map(x => x.date))].reverse();
    console.log(unique_dates)
    let donnees: any = [];
    unique_dates.forEach(element => {
      let data = this._gasoil_store.datasource().filter(x => x.date === element)
      let quantite = data.map(x => Number(x.quantite_go)).reduce((a, b) => a + b)
      donnees.push({
        x: this._service.convertDate(element),
        y: quantite
      })

    });
    return donnees;
  })

  chartOptions = computed(() => {
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
      data: this.datacourbe()

    }
  })
  dataSource = linkedSignal(() => this._gasoil_store.datasource())

  ngOnInit() {
    this.default_date.set(new Date());
    this.madate.set(new Date().toLocaleDateString());
    this._gasoil_store.setCurrentDate(this.madate());

    this.header_titles = Object.keys(this.displayedColumns)
  }
  addEvent(event: MatDatepickerInputEvent<any>) {
    this.default_date.set(event.value);
    this.madate.set(event.value.toLocaleDateString());
    this._gasoil_store.filtrebyDate([this.madate()]);
  }
  annuler() {
    this.table_update_form.reset();
    this.current_row.set(undefined);
    if (!this.is_update())
      this.dataSource.update((data: any) => data.filter((x: any) => x.id != ""))
  }
  choix_date() {
    let cas = this.floatLabelControl();
    switch (cas) {
      case "date":
        this.date_choice.set("date");
        this._gasoil_store.filtrebyDate([this.madate()]);
        this._gasoil_store.setCurrentDate(this.madate());
        break
      case "idate":
        this.date_choice.set("idate");
        if (this.formG2.valid) {
          let value = this.formG2.value;
          this._gasoil_store.filtrebyDate([value.date_debut.toLocaleDateString(), value.date_fin.toLocaleDateString()])
        }
        break
      case "tout":
        this.date_choice.set("tout");
        this._gasoil_store.filtrebyDate([""])
        break
    }
  }
  dateRangeChange() {
    if (this.formG2.valid) {
      let value = this.formG2.value;
      if (value.date_debut !== null && value.date_fin !== null) {
        this._gasoil_store.filtrebyDate(
          [value.date_debut.toLocaleDateString(),
          value.date_fin.toLocaleDateString()
          ]
        )
      }
    }
  }
  updateData() {
    let valeur = this.table_update_form.value;
    if (this.is_update()) {
      let val_tr =
      {
        id: valeur.id,
        engin_id: valeur.engin_id,
        date: valeur.date?.toLocaleDateString(),
        quantite_go: Number(valeur.quantite_go),
        diff_work: 0,
        numero: Number(valeur.numero),
        compteur: Number(valeur.compteur),
      }
      this._gasoil_store.updateconso(val_tr)
    }
    else {
      let val_tr =
      {
        engin_id: valeur.engin_id,
        date: valeur.date?.toLocaleDateString(),
        quantite_go: valeur.quantite_go,
        compteur: valeur.compteur,
        diff_work: 0,
        numero: (this._gasoil_store.lastNum() + 1)
      }
      this._gasoil_store.addconso(val_tr);
    }
    this.current_row.set(undefined);
  }

  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this._gasoil_store.removeconso(id)
  }
  changeSelect(data: any, controle_names: any) {
  
    let controle_name = controle_names;
    this.selectedEngin.set(undefined);
    let ind = this.table().findIndex(x => x.control_name === "engin_id")
    switch (controle_name) {
      case "classe_id":
        let classe_id = data
        let tab = this._engins_store.donnees_engins().filter(x => x.classe_id === classe_id).map(x => {
          return {
            'id': x.id,
            'valeur': x.code_parc
          }
        })
        this.engins_select.set(tab);
        this.table()[ind].tableau = tab;
        this.table_update_form.get("designation")?.setValue('');
        break
      case "engin_id":
        let id = data
        let engin = this._engins_store.donnees_engins().find(x => x.id === id);
        this.selectedEngin.set(engin);
        if (engin)
          this.table_update_form.get("designation")?.setValue(engin?.designation)
    }
  }
  PatchEventFct(row: Gasoil) {
    if (Number(row.compteur) > 0) {
      this.selected_compteur.set("ok");
    }
    else {
      this.selected_compteur.set("panne");
      this.table_update_form.get("compteur")?.setValue(0);
    }
    let ind = this.table().findIndex(x => x.control_name === "engin_id")
    let tab = this._engins_store.donnees_engins().
      filter(x => x.id === row.engin_id).map(x => {
        return {
          'id': x.id,
          'valeur': x.code_parc
        }
      }
      )
    this.table()[ind].tableau = tab;

    let dates = this._service.convertDate(row.date);
    this.table_update_form.patchValue({ ...row, date: dates }
    )

    this.current_row.set(row);
    this.is_update.set(true);
  }
  ajout() {
    this.is_update.set(false);
    this.selected_compteur.set("ok");
    let dates = new Date();
    let newdata: Gasoil = {
      id: '',
      engin_id: '',
      date: dates.toLocaleDateString(),
      quantite_go: 0,
      compteur: 0,
      diff_work: 0,
      numero: 0
    }
    this.dataSource.update((data: any) => [newdata, ...data])
    this.current_row.set(newdata)
    this.table_update_form.reset();
    this.table_update_form.get("date")?.setValue(dates);
  }

  selectChangeEngin(data: any) {
    let engin = this._engins_store.donnees_engins().find(x => x.id === data);
    if (engin) {
      this.selectEnginName.set(engin.designation + " - " + engin.code_parc);
    } else {
      this.selectEnginName.set("");
    }

    this._gasoil_store.filterByEnginId(this.selected_engin_id());
  }
  selectChangeEnginByclass(data: any) {
    let classe = this._classe_store.classes_engins().find(x => x.id === data)
    if (classe) {
      this.selectClasseName.set(classe.designation);
    }
    else {
      this.selectClasseName.set("");
    }
    this._gasoil_store.filterByClassId(this.selected_classe_id());
  }
  printgasoil() {
    this._gasoil_service.rapport_gasoil(
      this.date_choice(),
      this._gasoil_store.datasource(),
      this.selectClasseName(),
      this.selectEnginName(),
      this.total_conso()
    )
  }
  open_appro() {
    this.appro_opened.set(true);
  }
  close_appro() {
    this.appro_opened.set(false);
  }
  ChangeSelect(data: any, controle_name: any) {

  }
}
