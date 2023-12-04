import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { TableChange } from '../../../public/search/search.interface';
import { InboxResultDto } from '../inbox.component';

@Component({
  selector: 'app-inbox-table',
  templateUrl: './inbox-table.component.html',
  styleUrls: ['./inbox-table.component.scss'],
})
export class InboxTableComponent implements OnDestroy {
  $destroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  _items: InboxResultDto[] = [];
  @Input() set items(applications: InboxResultDto[]) {
    this._items = applications;
    this.dataSource = new MatTableDataSource<InboxResultDto>(applications);
  }

  _totalCount = 0;
  @Input() set totalCount(count: number) {
    this._totalCount = count;

    // this will ensure the reset of subscriber once the table is hidden because of empty
    this.initSorting();
  }

  @Input() type = 'Applications';
  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns: string[] = ['fileNumber', 'dateCreated', 'applicant', 'applicationType', 'status', 'lastUpdated'];
  dataSource = new MatTableDataSource<InboxResultDto>();
  pageIndex = 0;
  itemsPerPage = 10;
  total = 0;
  sortDirection = 'DESC';
  sortField = 'lastUpdate';

  private subscribedToSort = false;

  constructor() {}

  async onTableChange() {
    this.tableChange.emit({
      pageIndex: this.pageIndex,
      itemsPerPage: this.itemsPerPage,
      sortDirection: this.sortDirection,
      sortField: this.sortField,
      tableType: this.type === 'Notices of Intent' ? 'NOI' : this.type === 'Notifications' ? 'NOTI' : 'APP',
    });
  }

  async onPageChange($event: PageEvent) {
    this.pageIndex = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    await this.onTableChange();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private initSorting() {
    if (this._totalCount <= 0) {
      this.subscribedToSort = false;
    }

    // push subscription to next render cycle, after the table is rendered
    setTimeout(() => {
      if (this.sort && !this.subscribedToSort) {
        this.subscribedToSort = true;
        this.sort.sortChange.pipe(takeUntil(this.$destroy)).subscribe(async (sortObj) => {
          this.paginator.pageIndex = 0;
          this.pageIndex = 0;
          this.sortDirection = sortObj.direction.toUpperCase();
          this.sortField = sortObj.active;

          await this.onTableChange();
        });
      }
    });
  }

  onRowClick(event: Event) {
    if (event.currentTarget instanceof HTMLElement) {
      console.log(event.currentTarget.querySelector<HTMLElement>('td > a')!.click());
    }
  }
}
