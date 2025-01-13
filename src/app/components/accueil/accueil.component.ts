import { Component, OnInit, TemplateRef, computed, effect, inject, input, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ApproGasoilStore, EnginsStore, GasoilStore, ProjetStore, TravauxStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { AuthenService } from '../../authen.service';

import { DataLoaderService } from '../../services/data-loader.service';


@Component({
    selector: 'app-accueil',
    imports: [ImportedModule],
    templateUrl: './accueil.component.html',
    styleUrl: './accueil.component.scss'
})
export class AccueilComponent  {
    email=signal("dabilgou10@gmail.com")
    //methods
    open(){
        console.log("open")
    }
 
}
