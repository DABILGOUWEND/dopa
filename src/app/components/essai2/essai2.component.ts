import { Component, effect, inject, OnInit } from '@angular/core';
import { WenService } from '../../wen.service';
import { ApproGasoilStore, EnginsStore, GasoilStore, TachesStore, UnitesStore } from '../../store/appstore';

@Component({
  selector: 'app-essai2',
  standalone: true,
  imports: [],
  templateUrl: './essai2.component.html',
  styleUrl: './essai2.component.scss'
})
export class Essai2Component  implements OnInit{

  constructor()
  {
    effect(()=>{
     let gasoil=this.gasoilstore.conso_data().filter(x=>x.id_engin=="98bg6qCYbSyCcqeLw0zD" && this.service.convertDate(x.date).getTime()>= this.service.convertDate("01/07/2024").getTime()).map(
      x=>Number(x.quantite_go))
     console.log(this.service.somme(gasoil))
    })
  }
  ngOnInit() {
    this.gasoilstore.loadconso();
    this.enginsstore.loadengins();
    this.approgasoil.loadappro();
    this.taches_store.loadTaches();
    this.unites_store.loadUnites();
  }
  service = inject(WenService)
  gasoilstore=inject(GasoilStore)
  enginsstore=inject(EnginsStore)
  approgasoil=inject(ApproGasoilStore)
  taches_store=inject(TachesStore)
  unites_store=inject(UnitesStore)
  valider() {
    // let enginId=this.enginsstore.donnees_engins().map(x=>x.id);
    //this.service. uploadGasoilNumero(enginId).subscribe()
  
  }

  
}
