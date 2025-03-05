import { Routes } from '@angular/router';
import { EnginsComponent } from './components/engins/engins.component';
import { GasoilComponent } from './components/gasoil/gasoil.component';
import { LoginComponent } from './components/login/login.component';
import { PannesComponent } from './components/pannes/pannes.component';
import { PersonnelComponent } from './components/personnel/personnel.component';
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
import { TestComponent } from './test_components/test/test.component';
import { Essai2Component } from './components/essai2/essai2.component';
import { MyessaisComponent } from './components/myessais/myessais.component';
import { fournisseursStore } from './store/appstore';
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { GestMaterielComponent } from './components/gest-materiel/gest-materiel.component';
import { GestPersonnelComponent } from './components/gest-personnel/gest-personnel.component';
import { EntreesMatComponent } from './components/entrees-mat/entrees-mat.component';
import { SortiesMatComponent } from './components/sorties-mat/sorties-mat.component';

export const routes: Routes = [
    {
        path: "", redirectTo: "/accueil", pathMatch: "full"
    },
    {
        path: 'essai2', component: Essai2Component,
    }
    ,
    {
        path: 'home', component: HomeComponent, canActivate: [homeGuard]
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: "home_materiel",
        component: GestMaterielComponent,canActivate: [gestionGuard],
        children: [

            {
                path: "", redirectTo: "/home_materiel/gasoil", pathMatch: "full"
            },
            {
                path: "gasoil",
                component: GasoilComponent
            }
            ,
            {
                path: "pannes",
                component: PannesComponent
            },
            {
                path: "materiel",
                component: EnginsComponent
            }

        ]
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
                component: MesConstatsComponent,
                data: { title: 'Constats de travaux' }
            }
            ,
            {
                path: "attachements",
                component: MesAttachementsComponent,

                data: { title: 'Attachements travaux' }
            },
            {
                path: "decomptes",
                component: DecomptesComponent,
                data: { title: 'Decomptes' }
            }
            ,
            {
                path: "liste_sstraitants",
                component: ListeSstraitantsComponent,
                data: { title: 'Liste des sous-traitants' }

            }

        ]
    },
    
    {
        path: "home_personnel",
        component: GestPersonnelComponent,canActivate: [gestionGuard],
        children: [
            {
                path: "", redirectTo: "/home_personnel/pointages", pathMatch: "full"
            }
            ,
            {
                path: "pointages",
                component: PointageComponent,
                data: { title: "Pointages" }
            }
            ,
            {
                path: "personnel",
                component: PersonnelComponent,
                data: { title: "Gestion du personnel" }
            }
        ]
    },
    {
        path: "home_gestion",
        component: GestionComponent,  canActivate: [adminGuard],
        children: [
            {
                path: "", redirectTo: "/home_gestion/commandes", pathMatch: "full"
            }
            ,
            {
                path: "fournisseurs",
                component: FournisseursComponent
            },
            {
                path: "commandes",
                component: CommandesComponent
            }
            ,
            {
                path: "entrees_materiaux",
                component: EntreesMatComponent
            }
            
            ,
            {
                path: "sorties_materiaux",
                component: SortiesMatComponent
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
        path: "mes_constats",
        component: MesConstatsComponent
    },
    {
        path: "mes_attachements",
        component: MesAttachementsComponent
    },
    {
        path: "telecharger",
        component: TelechargerComponent
    }

    ,
    {
        path: "accueil",
        component: AccueilComponent
    }
];
