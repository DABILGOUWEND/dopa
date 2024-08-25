import { Routes } from '@angular/router';
import { WendComponent } from './wend/wend.component';
import { AccueilComponent } from './components/accueil/accueil.component';
import { EnginsComponent } from './components/engins/engins.component';
import { GasoilComponent } from './components/gasoil/gasoil.component';
import { LoginComponent } from './components/login/login.component';
import { PannesComponent } from './components/pannes/pannes.component';
import { PersonnelComponent } from './components/personnel/personnel.component';
import { PointageComponent } from './components/pointage/pointage.component';
import { RapportPanneComponent } from './components/rapport-panne/rapport-panne.component';
import { TravauxComponent } from './components/travaux/travaux.component';
import { authGuard } from './auth.guard';
import { Essai2Component } from './components/essai2/essai2.component';
import { SousTraitanceComponent } from './components/sous-traitance/sous-traitance.component';
import { ConstatsComponent } from './components/constats/constats.component';
import { AttachementsComponent } from './components/attachements/attachements.component';
import { PrestationComponent } from './components/prestation/prestation.component';
import { DecomptesComponent } from './components/decomptes/decomptes.component';
import { PointageTrvxEnginsComponent } from './components/pointage-trvx-engins/pointage-trvx-engins.component';
import { TacheProjetStore } from './store/appstore';
import { TableauBordComponent } from './components/tableau-bord/tableau-bord.component';

export const routes: Routes = [{ 
    path: "", component: TableauBordComponent },
{
    path: 'accueil', component: AccueilComponent
},
{
    path: 'login', component: LoginComponent
},
{
    path: 'travaux', component: TravauxComponent,canActivate: [authGuard]
},

{
    path: 'pannes', component: PannesComponent,canActivate: [authGuard]
},
{
    path: 'pointage', component: PointageComponent,canActivate: [authGuard]
},
{
    path: 'materiel', component: EnginsComponent,canActivate: [authGuard]
},
{
    path: 'personnel', component: PersonnelComponent,canActivate: [authGuard]
}
,
{
    path: 'gasoil', component: GasoilComponent,canActivate: [authGuard]
}
,
{
    path: 'rapportpannes', component: RapportPanneComponent,canActivate: [authGuard]
}
,
{
    path: 'essai', component: Essai2Component
} 
,
{
    path: 'sstrce', component: SousTraitanceComponent,canActivate: [authGuard]
}
,
{
    path: 'constats', component: ConstatsComponent,canActivate: [authGuard]
}
,
{
    path: 'attachements', component: AttachementsComponent,canActivate: [authGuard]
}
,
{
    path: 'prestation', component: PrestationComponent,canActivate: [authGuard]
}
,
{
    path: 'decomptes', component: DecomptesComponent,canActivate: [authGuard]
},
{
    path: 'pointagestrvx', component:PointageTrvxEnginsComponent
}
,
{
    path: 'taches_projets', component:TableauBordComponent
}
];
