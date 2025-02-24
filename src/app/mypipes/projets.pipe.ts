import { Pipe, PipeTransform } from '@angular/core';
import { Projet } from '../models/modeles';
import e from 'express';
import { Observable, of } from 'rxjs';

@Pipe({
  name: 'projets'
})
export class ProjetsPipe implements PipeTransform {

  transform(projet_id: string, projets: Projet[]): Observable<string> {
    if (projets) {
      const projet = projets.find(projet => projet.id === projet_id);
      return projet ? of(projet.intitule) : of('');
    }
    return of('');
  }

}
