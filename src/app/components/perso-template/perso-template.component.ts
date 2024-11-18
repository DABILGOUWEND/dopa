import { Component, computed, input, model, OnInit, output, signal, TemplateRef } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { FormSaisiComponent } from '../form-saisi/form-saisi.component';
import { KeyValuePipe } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'app-perso-template',
  standalone: true,
  imports: [ ImportedModule,FormSaisiComponent,TableComponent],
  templateUrl: './perso-template.component.html',
  styleUrl: './perso-template.component.scss'
})
export class PersoTemplateComponent implements OnInit {
  ngOnInit() {
    this.header_titles = Object.keys(this.displayedColumns());
  }
  is_open =model<boolean>(false)
  is_open2 = input<boolean>(false)
  is_update = signal(false)
  current_row=signal([])

  titre = input.required<TemplateRef<any>>();
  pointage = input.required<TemplateRef<any>>();
  table_update_form = input.required<FormGroup>();
  table = input()
  displayedColumns = input.required<any>()
  dataSource = input<any>()
  className = input<string>()
  action_template = input.required<TemplateRef<any>>();


  newItemEvent = output<any>()
  RechercheEvent = output<any>()
  AfficheToutEvent = output()
  ChangeSelectEvent = output<any>()
  PatchEvent = output()
  addEvent = output()
  header_titles: string[] = []

  donnees_table = computed(() => {
    return new MatTableDataSource<any>(this.dataSource())
  })
 
  modifier(row: any, id: string) {
    this.current_row.update(() => row)
    this.is_open.set(true)
    this.is_update.set(true)
    this.PatchEvent.emit(row)

  }
  addNewItem() {
    if (this.table_update_form().valid) {
      let valeur = this.table_update_form().value
      this.newItemEvent.emit([valeur])
    }

  }

  annuler() {
    this.is_open.set(false)
  }
  addElement() {
    this.is_open.set(true)
    this.addEvent.emit()
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.RechercheEvent.emit(filterValue)
  }
  affichertout() {
    this.AfficheToutEvent.emit()
  }
  ChangeSelect(data: any, controle_name: any) {
    this.ChangeSelectEvent.emit([data, controle_name])
  }
}
