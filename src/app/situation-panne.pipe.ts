import { Pipe, PipeTransform, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WenService } from './wen.service';

@Pipe({
  name: 'situationPanne',
  standalone: true
})
export class SituationPannePipe implements PipeTransform {
  _service=inject(WenService)
  transform(element: any, cas: string): Observable<string> {
    let type = element.situation
    switch (cas) {
      case 'nombre':
        switch (type) { 
          case 'garage':
            return of(this._service.calculateDiff1(this._service.convertDate(element.debut_panne), element.heure_debut).toString())
          case 'dépanné':
            return of(this._service.calculateDiff2(this._service.convertDate(element.debut_panne), this._service.convertDate(element.fin_panne), element.heure_debut, element.heure_fin).toString())
          default:
            return of('0')
        }
      case 'debut':
        return of(element.debut_panne + ' ' + element.heure_debut)
      case 'fin':
        switch (type) {
          case 'garage':
            return of('panne en cours')
          case 'dépanné':
            return of(element.fin_panne + ' ' + element.heure_fin)
          default:
            return of('0')
        }
      default:
        return of('')
    }
  }


}
