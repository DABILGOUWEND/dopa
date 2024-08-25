import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnInit, TemplateRef, WritableSignal, computed, inject } from '@angular/core';
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
export class TableComponent implements OnInit {
  @Input() Entete: TemplateRef<any>;
  @Input() Corps: TemplateRef<any>;
  @Input() is_open:WritableSignal<boolean>
  ngOnInit() {

  }
}
