import { Component } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';

@Component({
    selector: 'app-toolbar',
    imports: [ImportedModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {

}
