import { Component, OnInit, computed, inject } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ApproGasoilStore, EnginsStore, GasoilStore, TravauxStore, UserStore } from '../../store/appstore';
import { WenService } from '../../wen.service';


@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [ImportedModule],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss',
})
export class AccueilComponent implements OnInit {
  readonly gasoil_store=inject(GasoilStore)
  readonly travaux_store=inject(TravauxStore)
  readonly approgo_store = inject(ApproGasoilStore);
  ngOnInit() {
    this.gasoil_store.loadconso()
    this.approgo_store.loadappro()
    this.travaux_store.loadtravaux()
    this.travaux_store.filterbyDate('')
  }

  chartOptions1 = computed(() => {
    var mydata = this.gasoil_store.historique_consogo()[0]
    return {
      title: {
        text: "Historique consommation gasoil"
      },
      theme: "light2",
      animationEnabled: true,

      axisX: {
        title: "Date",
        gridThickness: 1,
        tickLength: 10
      },
      axisY: {
        title: "Gasoil(l)",
        gridThickness: 1,
        tickLength: 10,
        includeZero: true

      },
      data: [{
        type: "column", //change type to bar, line, area, pie, etc
        indexLabel: "{y}", //Shows y value on all Data Points
        indexLabelFontColor: "#5A5757",
        dataPoints: mydata
      }]
    }
  }
  )
  chartOptions2 = computed(() => {
    var mydata = this.travaux_store.historique_appro()
    return {
      title: {
        text: "Appro de latérite"
      },
      theme: "light2",
      animationEnabled: true,

      axisX: {
        title: "Date",
        gridThickness: 1,
        tickLength: 10
      },
      axisY: {
        title: "Volume latérite(m3)",
        gridThickness: 1,
        tickLength: 10,
        includeZero: true

      },
      data: [{
        type: "column", //change type to bar, line, area, pie, etc
        indexLabel: "{y}", //Shows y value on all Data Points
        indexLabelFontColor: "#5A5757",
        dataPoints: mydata
      }]
    }
  }
  )

   
}
