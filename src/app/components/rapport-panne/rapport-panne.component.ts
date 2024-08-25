import { Component, OnInit, ViewChild, computed,inject } from '@angular/core';

import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ImportedModule } from '../../modules/imported/imported.module';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { Pannes, classe_engins, Engins } from '../../models/modeles';
import { PannesStore, EnginsStore, ClasseEnginsStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { SituationPannePipe } from '../../situation-panne.pipe';

@Component({
  selector: 'app-rapport-panne',
  standalone: true,
  imports: [ImportedModule,SituationPannePipe],
  templateUrl: './rapport-panne.component.html',
  styleUrl: './rapport-panne.component.scss'
})
export class RapportPanneComponent implements OnInit {
  readonly Pannestore = inject(PannesStore)
  readonly EnginStore = inject(EnginsStore)
  readonly ClasseEnginsStore = inject(ClasseEnginsStore)
  readonly app_service = inject(WenService)

  datasource = computed(
    () => new MatTableDataSource<Pannes>(this.Pannestore.donnees_pannes()),
  );
  code_parc=computed(()=>
  {
    let code:any=[]
    this.Pannestore.donnees_pannes().forEach(element => {
      let Myengins=this.EnginStore.donnees_engins().find(x=>x.id==element.engin_id)
      code.push(Myengins?.code_parc)
    });
    return code
  })
  designation_engin=computed(()=>
    {
      let code:any=[]
      this.Pannestore.donnees_pannes().forEach(element => {
        let Myengins=this.EnginStore.donnees_engins().find(x=>x.id==element.engin_id)
        code.push(Myengins?.designation)
      });
      return code
    })
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort;
  formG2: FormGroup
  displayedColumns: string[] = ['code_parc', 'designation', 'date_debut', 'date_fin', 'id']
  engins_panne: any[] = []
  selectedType: string
  selectedclasse: string
  selectedengin: string
  classes_engins$: Observable<classe_engins[]>
  engins$: Observable<Engins[]>
  engins_ids: string[] = []
  is_click_choix = false
  date_choice='tout'
  default_date:any

  floatLabelControl = new FormControl('tout');
  constructor(
    private _fb: FormBuilder
  ) {
    this.formG2 = this._fb.group({
      date_debut: new FormControl(new Date(),Validators.required),
      date_fin: new FormControl(new Date(),Validators.required)
    })

  }
  ngOnInit() {
    this.default_date = new Date()
    this.Pannestore.loadPannes()
    this.Pannestore.setIntervalleDate([''])
    this.Pannestore.setEnginsIds([''])

    this.EnginStore.loadengins()
    this.EnginStore.filtrebyIds([''])
    this.ClasseEnginsStore.loadclasses()
  }
  dateRangeChange() {
    if (this.formG2.valid) {
      let value = this.formG2.value
      if (value.date_debut != null && value.date_fin != null)
        this.Pannestore.setIntervalleDate([value.date_debut.toLocaleDateString(), value.date_fin.toLocaleDateString()])
    }
  }

  type_rapport() {
    if (this.selectedType == '3')
      this.Pannestore.setEnginsIds([''])
  }
  choix_classe() {
    this.EnginStore.filtrebyClasseId(this.selectedclasse)
    this.Pannestore.setEnginsIds(this.EnginStore.donnees_enginsByClasse().map(x => x.id))
  }
  choix_engins() {
    this.Pannestore.setEnginsIds([this.selectedengin])
  } 
  click_slider() {
    if (this.is_click_choix) {
      this.Pannestore.setIntervalleDate([''])
    }
    this.is_click_choix = !this.is_click_choix
  }
  choix_date() {
    let cas = this.floatLabelControl.value
    switch (cas) {
      case 'date':
        this.date_choice='date'
        this.Pannestore.setIntervalleDate([this.default_date.toLocaleDateString()])
        break
      case 'idate':
        this.date_choice='idate'
        if(this.formG2.valid)
          {
            let value = this.formG2.value
            this.Pannestore.setIntervalleDate([value.date_debut.toLocaleDateString(), value.date_fin.toLocaleDateString()])
          }
        break
      case 'tout':
        this.date_choice='tout'
        this.Pannestore.setIntervalleDate([''])
        break
    }
  }
  addEvent(data:MatDatepickerInputEvent<any>){
    this.default_date=data.value
    this.Pannestore.setIntervalleDate([data.value.toLocaleDateString()])
  }
}
