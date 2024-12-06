import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ClasseEnginsStore, EnginsStore, EntrepriseStore, PersonnelStore, ProjetStore, StatutStore, TachesEnginsStore, TachesStore, UnitesStore, UserStore } from '../../store/appstore';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { SaisiComponent } from '../../utilitaires/saisi/saisi.component';
import { EssaiComponent } from '../essai/essai.component';
import { TbordUsersComponent } from '../tbord-users/tbord-users.component';
import { TbordClassesEnginsComponent } from '../tbord-classes-engins/tbord-classes-engins.component';
import { TbordEntreprisesComponent } from '../tbord-entreprises/tbord-entreprises.component';
import { TbordProjetsComponent } from '../tbord-projets/tbord-projets.component';

@Component({
    selector: 'app-tableau-bord',
    imports: [
        TbordUsersComponent,
        TbordClassesEnginsComponent,
        TbordEntreprisesComponent,
        TbordProjetsComponent,
        ImportedModule
    ],
    templateUrl: './tableau-bord.component.html',
    styleUrl: './tableau-bord.component.scss'
})
export class TableauBordComponent  implements OnInit {

    _fb = inject(NonNullableFormBuilder);

  ngOnInit(): void {

  }
  
  selected_rubrique = signal(0)
  items = [
    {
      'id': 1,
      'value': "users",
    },
    {
      'id': 2,
      'value': "classes engins",
    },
    {
      'id': 3,
      'value': "entreprises",
    }
    ,
    {
      'id': 4,
      'value': "projets",
    }

  ]
  choix_rubrique(data: any) {
    switch (data.value) {
      case 1:
        {
          this.selected_rubrique.set(1)
        }
        break;
      case 2:
        {
          this.selected_rubrique.set(2)
        }
        break;
      case 3:
        {
          this.selected_rubrique.set(3)
        }
        break;
      case 4:
        {
          this.selected_rubrique.set(4)
        }
        break;
      default:
        {
          this.selected_rubrique.set(0)
        }
        break

    }


  }

}
