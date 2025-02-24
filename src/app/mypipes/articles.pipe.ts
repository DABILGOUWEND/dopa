import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { articles } from '../models/modeles';

@Pipe({
  name: 'articles'
})
export class ArticlesPipe implements PipeTransform {

  transform(article_id: string, articles: articles[]): Observable<string> {
    
    if (articles) {
      const article = articles.find(article => article.id === article_id);
      return article ? of(article.designation) : of('');
    }
    return of('');

  }

}
