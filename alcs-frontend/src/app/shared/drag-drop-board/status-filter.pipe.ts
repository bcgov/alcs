import { Pipe, PipeTransform } from '@angular/core';
import { DragDropItem } from './drag-drop-item.interface';

@Pipe({
  name: 'statusfilter',
  pure: false,
})
export class StatusFilterPipe implements PipeTransform {
  transform(items: DragDropItem[], status: string): any {
    if (!items || !status) {
      return items;
    }
    return items.filter((item) => item.status === status);
  }
}
