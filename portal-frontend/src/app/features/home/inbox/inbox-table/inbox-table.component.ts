import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TableChange } from '../../../public/search/search.interface';
import { InboxResultDto } from '../inbox.component';

@Component({
  selector: 'app-inbox-table',
  templateUrl: './inbox-table.component.html',
  styleUrls: ['./inbox-table.component.scss'],
})
export class InboxTableComponent {
  _items: InboxResultDto[] = [];
  @Input() set items(applications: InboxResultDto[]) {
    this._items = applications;
    this.isLoading = false;
    this.dataSource = new MatTableDataSource<InboxResultDto>(applications);
  }

  @Input() totalCount: number = 0;
  @Input() type = 'Applications';
  @Input() pageIndex: number = 0;

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns: string[] = ['fileNumber', 'dateCreated', 'applicant', 'applicationType', 'status', 'lastUpdated'];
  dataSource = new MatTableDataSource<InboxResultDto>();
  itemsPerPage = 10;
  total = 0;
  sortDirection = 'DESC';
  sortField = 'lastUpdate';
  isLoading = false;

  constructor(private router: Router) {}

  onTableChange() {
    this.isLoading = true;
    this.tableChange.emit({
      pageIndex: this.pageIndex,
      itemsPerPage: this.itemsPerPage,
      sortDirection: this.sortDirection,
      sortField: this.sortField,
      tableType: this.getTableType(),
    });
  }

  async onPageChange($event: PageEvent) {
    this.pageIndex = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    this.onTableChange();
  }

  async onRowClick(link: string) {
    if (link) {
      await this.router.navigateByUrl(link);
    }
  }

  private getTableType(): string {
    switch (this.type) {
      case 'Notice of Intent':
        return 'NOI';
      case 'Notification':
        return 'NOTI';
      default:
        return 'APP';
    }
  }
}
