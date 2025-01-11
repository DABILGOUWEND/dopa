import { Routes } from '@angular/router';
import { EnginsComponent } from './components/engins/engins.component';
import { GasoilComponent } from './components/gasoil/gasoil.component';
import { LoginComponent } from './components/login/login.component';
import { PannesComponent } from './components/pannes/pannes.component';
import { PersonnelComponent } from './components/personnel/personnel.component';
import { ConstatsComponent } from './components/constats/constats.component';
import { AttachementsComponent } from './components/attachements/attachements.component';
import { DecomptesComponent } from './components/decomptes/decomptes.component';
import { RegisterComponent } from './components/register/register.component';
import { travauxGuard } from './travaux.guard';
import { homeGuard } from './home.guard';
import { AdminComponent } from './components/admin/admin.component';
import { adminGuard } from './admin.guard';
import { HomeComptaComponent } from './components/home-compta/home-compta.component';
import { HomeTravauxComponent } from './components/home-travaux/home-travaux.component';
import { GestionComponent } from './components/gestion/gestion.component';
import { gestionGuard } from './gestion.guard';
import { PointageComponent } from './components/pointage/pointage.component';
import { TelechargerComponent } from './components/telecharger/telecharger.component';
import { TableauBordComponent } from './components/tableau-bord/tableau-bord.component';
import { HomeComponent } from './components/home/home.component';
import { ListeDevisComponent } from './components/liste-devis/liste-devis.component';
import { ListeSstraitantsComponent } from './components/liste-sstraitants/liste-sstraitants.component';
import { LignedevisComponent } from './components/lignedevis/lignedevis.component';
import { MesConstatsComponent } from './components/mes-constats/mes-constats.component';
import { MesAttachementsComponent } from './components/mes-attachements/mes-attachements.component';
import { AccueilComponent } from './components/accueil/accueil.component';
import { EssaiComponent } from './components/essai/essai.component';

export const routes: Routes = [
    {
        path: "", redirectTo: "/home", pathMatch: "full"
    }
    ,
    {
        path: 'home', component: HomeComponent
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: "home_compta",
        component: HomeComptaComponent,
    },
    {
        path: "home_travaux",
        component: HomeTravauxComponent, canActivate: [travauxGuard],
        children: [

            {
                path: "", redirectTo: "/home_travaux/constats", pathMatch: "full"
            },
            {
                path: "constats",
                component: MesConstatsComponent
            }
            ,
            {
                path: "attachements",
                component: MesAttachementsComponent
            },
            {
                path: "decomptes",
                component: DecomptesComponent
            }
            ,
            {
                path: "liste_sstraitants",
                component: ListeSstraitantsComponent
            }

        ]
    },
    {
        path: "home_gestion",
        component: GestionComponent, canActivate: [gestionGuard],
        children: [
            {
                path: "", redirectTo: "/home_gestion/gasoil", pathMatch: "full"
            },
            {
                path: "gasoil",
                component: GasoilComponent
            },
            {
                path: "pannes",
                component: PannesComponent
            }
            ,
            {
                path: "pointages",
                component: PointageComponent
            }
            ,
            {
                path: "materiel",
                component: EnginsComponent
            }
            ,
            {
                path: "personnel",
                component: PersonnelComponent
            }
        ]
    },
    {
        path: "admin",
        component: AdminComponent, canActivate: [adminGuard],
        children: [
            {
                path: "", redirectTo: "/admin/tableau_bord", pathMatch: "full"
            },
            {
                path: "register",
                component: RegisterComponent
            },
            {
                path: "tableau_bord",
                component: TableauBordComponent
            },
            
            {
                path: "devis",
                component: LignedevisComponent
            },
            {
                path: "liste_devis",
                component: ListeDevisComponent
            }
        ]
    },
    {
        path: "lignedevis",
        component: LignedevisComponent
    },
    {
        path: "telecharger",
        component: TelechargerComponent
    },
    {
        path:"mes_constats",
        component:MesConstatsComponent
    },
    {
        path:"mes_attachements",
        component:MesAttachementsComponent
    },
    {
        path:"telecharger",
        component:TelechargerComponent
    }
    
    ,
    {
        path:"accueil",
        component:AccueilComponent,canActivate:[homeGuard]
    }
];
