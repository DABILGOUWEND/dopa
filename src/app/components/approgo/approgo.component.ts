import { Component, EventEmitter, Input, OnInit, Output, ViewChild, computed, inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ApproGasoilStore } from '../../store/appstore';
import { appro_gasoil } from '../../models/modeles';


@Component({
  selector: 'app-approgo',
  standalone: true,
  imports: [ImportedModule],
  templateUrl: './approgo.component.html',
  styleUrl: './approgo.component.scss'
})
export class ApprogoComponent  implements OnInit{
  
  readonly approgo_store = inject(ApproGasoilStore);
  
  formGroup: FormGroup
  displayedColumns: string[] = ['date', 'quantite', 'reception', 'actions']
  datasource = computed(
    () => new MatTableDataSource<appro_gasoil>(this.approgo_store.datasource()),
  );
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort;
  @Input() is_new_row_being_added: boolean
  @Output() onRowAdd = new EventEmitter<any>();
  default_date = new Date()
  constructor(
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
    this.approgo_store.loadappro()
  }
  updateTableData() {
    if (this.formGroup.valid) {
      let valeur = this.formGroup.value;
      if (this.is_new_row_being_added) {
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
    }
  }
  addappro() {
    this.is_new_row_being_added = true
  }
  editappro(appro: any) {
    let temp=appro.date
    const [day,month,year]=temp.split("/")
    const date= new Date(+year,+month-1,+day)
    this.is_new_row_being_added = false
    this.formGroup.patchValue({
      id:appro.id,
      date:date,
      quantite:appro.quantite,
      reception:appro.reception
    })
  }
  deleteappro(id: string) {
    if (confirm('voulez-vous supprimer cet élement?'))
    this.approgo_store.removeappro(id)
  }
  annuler() { }
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
