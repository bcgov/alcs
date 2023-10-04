import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { BaseCodeDto } from '../../../shared/dto/base.dto';

export interface InboxListItem {
  applicant?: string;
  fileNumber: string;
  lastStatusUpdate: number;
  createdAt: number;
  status?: BaseCodeDto & {
    portalBackgroundColor: string;
    portalColor: string;
  };
  type: string;
  routerLink?: string;
}

@Component({
  selector: 'app-inbox-list',
  templateUrl: './inbox-list.component.html',
  styleUrls: ['./inbox-list.component.scss'],
})
export class InboxListComponent implements OnDestroy {
  $destroy = new Subject<void>();

  @Input() totalCount = 0;

  _items: InboxListItem[] = [];
  @Input() set items(items: InboxListItem[]) {
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

  async onSelectRecord(record: InboxListItem) {
    this.selectRecord.emit(record.fileNumber);
  }

  onLoadMore() {
    this.loadMore.emit();
  }
}
