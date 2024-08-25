import { inject, Pipe, PipeTransform } from '@angular/core';
import { SstraitantStore } from './store/appstore';
import { Observable, of } from 'rxjs';
import { Ligne_devis, sous_traitant } from './models/modeles';

@Pipe({
  name: 'entreprises',
  standalone: true
})
export class EntreprisesPipe implements PipeTransform {
  transform(id:string,data:sous_traitant[]): Observable<string> {
   let ent= data.find(x=>x.id==id)
    return of(ent?ent?.entreprise:'')
  }

}
