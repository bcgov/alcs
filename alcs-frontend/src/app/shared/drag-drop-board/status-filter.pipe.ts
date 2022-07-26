import { Pipe, PipeTransform } from '@angular/core';
import { CardData } from '../card/card.component';

@Pipe({
  name: 'statusfilter',
  pure: false,
})
export class StatusFilterPipe implements PipeTransform {
  transform(items: CardData[], status: string): any {
    if (!items || !status) {
      return items;
    }
    return items.filter((item) => item.status === status);
  }
}
