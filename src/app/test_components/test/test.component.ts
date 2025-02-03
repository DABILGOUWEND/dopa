import { Component } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';

@Component({
  selector: 'app-test',
  imports: [ImportedModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

}
