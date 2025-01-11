import { Component, OnInit } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';

@Component({
  selector: 'app-essai-ssr',
  imports: [ImportedModule],
  templateUrl: './essai-ssr.component.html',
  styleUrl: './essai-ssr.component.scss'
})
export class EssaiSsrComponent  implements OnInit {
  constructor() { }
  ngOnInit() {
    console.log('essai-ssr');
  }
}
