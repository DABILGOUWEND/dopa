import { Component, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { TachesProjetsComponent } from '../taches-projets/taches-projets.component';

@Component({
  selector: 'app-tableau-bord',
  standalone: true,
  imports: [ImportedModule,TachesProjetsComponent],
  templateUrl: './tableau-bord.component.html',
  styleUrl: './tableau-bord.component.scss'
})
export class TableauBordComponent {
  is_click_taches = signal(false);

  click_taches()
  {
    this.is_click_taches.set(true);
  }

}
