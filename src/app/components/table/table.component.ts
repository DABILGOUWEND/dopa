import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnInit, TemplateRef, WritableSignal, computed, inject, input } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ClasseEnginsStore, EnginsStore, PersonnelStore } from '../../store/appstore';
import { MatTableDataSource } from '@angular/material/table';
import { Engins } from '../../models/modeles'
import { FormSaisiComponent } from '../form-saisi/form-saisi.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgTemplateOutlet, ImportedModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent  {
  Entete = input.required<TemplateRef<any>>();
  Entete2= input<TemplateRef<any>|null>(null);
  Corps = input.required<TemplateRef<any>>();
  is_open = input.required<boolean>()
  is_open2 = input<boolean>(false)
  className = input<string>()

}
