import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, WritableSignal, computed, inject, input, output, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ImportedModule } from '../../modules/imported/imported.module';
import { FormSaisiComponent } from '../form-saisi/form-saisi.component';
import { ModelComponent } from '../model/model.component';
import { ApprogoComponent } from '../approgo/approgo.component';
import { EnginsStore, GasoilStore } from '../../store/appstore';

@Component({
    selector: 'app-gasoil-model',
    imports: [ImportedModule, FormSaisiComponent, ApprogoComponent],
    templateUrl: './gasoil-model.component.html',
    styleUrl: './gasoil-model.component.scss'
})
export class GasoilModelComponent implements OnInit {
  _gasoil_store=inject(GasoilStore)
  _engins_store=inject(EnginsStore)
  constructor(){
  }
  appro_opened = input.required<boolean>();
  is_update = signal(false);
  is_open = signal(false);
  current_row = signal([]);

  titre = input.required<TemplateRef<any>>();
  conso = input.required<TemplateRef<any>>();
  table_update_form = input.required<FormGroup>();
  table = input.required<any>();
  displayedColumns = input.required<any>();

  dataSource = input<any>({
    transform: (value: any) => new MatTableDataSource<any>(value)
  });

  appro_openedEmit = output();
  appro_closedEmit = output();
  newItemEvent = output<any[]>();
  RemoveItemEvent = output<string>();
  RechercheEvent = output<string>();
  AfficheToutEvent = output();
  ChangeSelectEvent = output<any[]>();
  PatchEvent = output();
  addEvent = output();
  printEvent = output();

  header_titles: string[] = [];

  ngOnInit() {
    this.header_titles = Object.keys(this.displayedColumns())
  }
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
    this.is_update.set(false)
    this.RemoveItemEvent.emit(id)
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


  annuler2() {
    this.appro_closedEmit.emit();
  }
  ouvrir_appro() {
    this.appro_openedEmit.emit();
  }

  printElement() {
    this.printEvent.emit();
  }
  retourQuitter() {
    this.appro_closedEmit.emit()
  }
}
