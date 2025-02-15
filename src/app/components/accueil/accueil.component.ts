import { Component, OnInit, TemplateRef, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ApproGasoilStore, EnginsStore, GasoilStore, PersonnelStore, ProjetStore, TravauxStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { AuthenService } from '../../authen.service';

import { DataLoaderService } from '../../services/data-loader.service';
import { Router } from '@angular/router';
import { HomeComponent } from "../home/home.component";

import { EssaiComponent } from "../essai/essai.component";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { tab_personnel } from '../../models/modeles';
import { HomeTemplateComponent } from '../../utilitaires/home-template/home-template.component';



@Component({
    selector: 'app-accueil',
    imports: [ImportedModule, HomeTemplateComponent],
    templateUrl: './accueil.component.html',
    styleUrl: './accueil.component.scss'
})
export class AccueilComponent implements OnInit {
    _autservice = inject(AuthenService)
    router = inject(Router);

    constructor(
        private _fb: FormBuilder
    ) {

    }
    ngOnInit(): void {
    }


    logout() {
        this._autservice.logout().subscribe()

    }
}
