import { Pipe, PipeTransform } from '@angular/core';
import { Ligne_devis } from './models/modeles';
import { Observable, of } from 'rxjs';

@Pipe({
  name: 'devis',
  standalone: true
})
export class DevisPipe implements PipeTransform {

  transform(poste_id: string, cas: string, data: Ligne_devis[]): Observable<string> {
    let poste = data.find(x => x.id == poste_id)
    if(poste)
    {
      switch (cas) {
        case 'poste':
          return of(poste?.poste);
          break
        case 'designation':
          return of(poste?.designation);
          break
        case 'unite':
          return of(poste?.unite)
          break;
        default:
          return of('')
      }
     
    }
    else
    {
      return of('')
    }


  }

}
