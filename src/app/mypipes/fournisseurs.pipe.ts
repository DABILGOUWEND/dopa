import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { fournisseurs } from '../models/modeles';

@Pipe({
  name: 'fournisseurs'
})
export class FournisseursPipe implements PipeTransform {

  transform(fournisseur_id: string, fournisseurs: fournisseurs[]): Observable<string> {
    
    if (fournisseurs) {
      const fournisseur = fournisseurs.find(fournisseur => fournisseur.id === fournisseur_id);
      return fournisseur ? of(fournisseur.designation) : of('');
    }
    return of('');
  }

}
