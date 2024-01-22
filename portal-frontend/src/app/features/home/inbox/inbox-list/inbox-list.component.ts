import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { InboxResultDto } from '../inbox.component';

@Component({
  selector: 'app-inbox-list',
  templateUrl: './inbox-list.component.html',
  styleUrls: ['./inbox-list.component.scss'],
})
export class InboxListComponent implements OnDestroy {
  $destroy = new Subject<void>();

  @Input() totalCount = 0;
  @Input() type = '';

  _items: InboxResultDto[] = [];
  @Input() set items(items: InboxResultDto[]) {
    this._items = items;
    this.visibleCount = items.length;
    this.totalCount = items.length;
  }

  @Output() loadMore = new EventEmitter<void>();
  @Output() selectRecord = new EventEmitter<string>();
  visibleCount = 0;

  constructor(private router: Router) {}

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onLoadMore() {
    this.loadMore.emit();
  }
}
