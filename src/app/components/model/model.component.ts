import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnInit, TemplateRef, WritableSignal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ApprogoComponent } from '../approgo/approgo.component';

@Component({
  selector: 'app-model',
  standalone: true,
  imports: [NgTemplateOutlet, ImportedModule,ApprogoComponent],
  templateUrl: './model.component.html',
  styleUrl: './model.component.scss'
})
export class ModelComponent implements OnInit {
  @Input() Entete: TemplateRef<any>;
  @Input() Corps: TemplateRef<any>;
  @Input() is_open:WritableSignal<boolean>
  @Input() is_open2:WritableSignal<boolean>
  ngOnInit() {

  }
  retourQuitter()
  {
    this.is_open2.set(false)
  }
}
