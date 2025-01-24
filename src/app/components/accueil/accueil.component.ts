import { Component, OnInit, TemplateRef, computed, effect, inject, input, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ApproGasoilStore, EnginsStore, GasoilStore, ProjetStore, TravauxStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { AuthenService } from '../../authen.service';

import { DataLoaderService } from '../../services/data-loader.service';
import { Router } from '@angular/router';
import { HomeComponent } from "../home/home.component";

import { EssaiComponent } from "../essai/essai.component";



@Component({
    selector: 'app-accueil',
    imports: [ImportedModule],
    templateUrl: './accueil.component.html',
    styleUrl: './accueil.component.scss'
})
export class AccueilComponent  {
    _autservice=inject(AuthenService);
 
}
