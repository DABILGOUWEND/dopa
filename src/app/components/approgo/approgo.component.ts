import { Component, EventEmitter, Input, OnInit, Output, ViewChild, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ApproGasoilStore } from '../../store/appstore';
import { appro_gasoil } from '../../models/modeles';
import { WenService } from '../../wen.service';
import { app } from '../../../../server';


@Component({
    selector: 'app-approgo',
    imports: [ImportedModule],
    templateUrl: './approgo.component.html',
    styleUrl: './approgo.component.scss'
})
export class ApprogoComponent  implements OnInit{
  
  approgo_store = inject(ApproGasoilStore);
  formGroup: FormGroup
  displayedColumns: string[] = ['date', 'quantite', 'reception', 'actions']
  donnees= linkedSignal(
    () => this.approgo_store.datasource(),
  );
  datasource = computed(
    () => new MatTableDataSource<appro_gasoil>(this.donnees()),
  );
  current_row= signal<appro_gasoil|undefined>(undefined)
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort;
  is_update=signal<boolean>(true);
  onRowAdd = output()
  default_date = new Date()
  constructor(
    private _service:WenService,
    fb: FormBuilder
  ) {
    this.formGroup = fb.group({
      id: new FormControl(''),
      date: new FormControl(new Date(), Validators.required),
      quantite: new FormControl(0, Validators.required),
      reception: new FormControl('', Validators.required)
    })
  }
  ngOnInit() {
  }
  updateTableData() {
    if (this.formGroup.valid) {
      let valeur = this.formGroup.value;
      if (!this.is_update()) {
        let val_tr:appro_gasoil = {
          id:'',
          date: valeur.date.toLocaleDateString(),
          quantite: valeur.quantite,
          reception: valeur.reception
        }
        this.approgo_store.addappro(val_tr)
      }
      else {
        let val_tr = {
          id: valeur.id,
          date: valeur.date.toLocaleDateString(),
          quantite: valeur.quantite,
          reception: valeur.reception
        }
        this.approgo_store.updateappro(val_tr)
      }
      this.formGroup.patchValue({
        id:'',
        date:new Date(),
        quantite:0,
        reception:''
      })
      this.current_row.set(undefined)
    }
  }
  addappro() {
    this.is_update.set(false)
    let dates = new Date();
    let newdata:appro_gasoil = {
      id: '',
      date: dates.toLocaleDateString(),
      quantite: 0,
      reception: ''
    }
    this.donnees.update((data:any) => [newdata, ...data])
    this.current_row.set(newdata)
    this.formGroup.reset()
    this.formGroup.get("date")?.setValue(dates);
  }
  editappro(appro: any) {
    this.is_update.set(true)
    let dates = this._service.convertDate(appro.date);
    this.formGroup.patchValue({ ...appro, date: dates }
    )
    this.current_row.set(appro);
  }
  deleteappro(id: string) {
    if (confirm('voulez-vous supprimer cet élement?'))
    this.approgo_store.removeappro(id)
  }
  annuler() {
    this.current_row.set(undefined)
    this.formGroup.reset()
    if (!this.is_update())
      this.donnees.update((data: any) => data.filter((x: any) => x.id != ""))
   }
  quitter() {
    this.formGroup.patchValue({
      id:'',
      date:new Date(),
      quantite:0,
      reception:''
    })
    this.onRowAdd.emit();
  }
}
