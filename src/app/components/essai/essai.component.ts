import { Component, EventEmitter, Input, OnInit, Output, Signal, TemplateRef, ViewChild, WritableSignal, computed, inject, input, output, signal } from '@angular/core';
import { TableComponent } from '../table/table.component';
import { MatTableDataSource } from '@angular/material/table';
import { Engins, tab_personnel } from '../../models/modeles';
import { EnginsStore, PersonnelStore, ClasseEnginsStore } from '../../store/appstore';
import { KeyValuePipe } from '@angular/common';
import { ImportedModule } from '../../modules/imported/imported.module';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormSaisiComponent } from '../form-saisi/form-saisi.component';

@Component({
    selector: 'app-essai',
    imports: [TableComponent, FormSaisiComponent, KeyValuePipe, ImportedModule],
    templateUrl: './essai.component.html',
    styleUrl: './essai.component.scss'
})
export class EssaiComponent implements OnInit {
  ngOnInit() {
    this.header_titles = Object.keys(this.displayedColumns());
  }
  is_open = signal(false)
  is_update = signal(false)
  current_row=signal([])

  titre = input.required<TemplateRef<any>>();
  table_update_form = input.required<FormGroup>();
  table = input()
  displayedColumns = input.required<any>()
  dataSource = input<any>()
  className = input<string>()
  action_template = input<TemplateRef<any>>()

  newItemEvent = output<any>()
  RemoveItemEvent = output<any>()
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
      this.newItemEvent.emit([valeur, this.current_row(), this.is_update()])
      this.is_open.set(false)
    }

  }
  supprimer(id: string) {
    this.is_update.set(false);
    this.RemoveItemEvent.emit(id);
  }
  annuler() {
    this.is_open.set(false)
  }
  addElement() {

    this.is_open.set(true)
    this.is_update.set(false)
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
