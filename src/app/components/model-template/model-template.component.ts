import { Component, computed, effect, input, model, OnInit, output, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { tab_personnel } from '../../models/modeles';
import { ImportedModule } from '../../modules/imported/imported.module';
import { FormSaisiComponent } from '../form-saisi/form-saisi.component';

@Component({
  selector: 'app-model-template',
  imports: [ImportedModule, FormSaisiComponent],
  templateUrl: './model-template.component.html',
  styleUrl: './model-template.component.scss'
})
export class ModelTemplateComponent implements OnInit {
  constructor() {
    effect(() => {
    })
  }
  ngOnInit() {
    this.header_titles = Object.keys(this.displayedColumns());
  }
  is_open = model<boolean>(false);
  is_open2 = input<boolean>(false);
  is_update = input<boolean>(false);
  mes_saisies = input<TemplateRef<any> | null>(null);
  titre = input.required<string>();
  pointage = input<TemplateRef<any> | undefined>(undefined);
  table_update_form = input.required<FormGroup>();
  table = input()
  displayedColumns = input.required<any>()
  dataSource = input<any>()
  className = input<string>()
  action_template = input.required<TemplateRef<any>>();
  clicker = input.required<boolean[]>()
  current_row = model<any>()

  newItemEvent = output<any>()
  RechercheEvent = output<any>()
  AfficheToutEvent = output()
  ChangeSelectEvent = output<any>()
  PatchEvent = output()
  addEvent = output()
  header_titles: string[] = []
  clear_event = output()

  donnees_table = computed(() => {
    return new MatTableDataSource<any>(this.dataSource())
  })
  columnsToDisplayWithExpand = this.header_titles;


  modifier(row: any, id: string) {
    this.is_open.set(true)
    this.PatchEvent.emit(row)

  }

  addNewItem() {
    if (this.table_update_form().valid) {
      let valeur = this.table_update_form().value
      this.newItemEvent.emit([valeur])
    }

  }

  annuler() {
    this.current_row.set(undefined)
    if (!this.is_update())
      this.clear_event.emit()
  }
  addElement() {
    console.log('add element')
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
  saisie(element: any) {
  }
}
