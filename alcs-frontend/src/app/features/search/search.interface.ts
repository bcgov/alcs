import { SortDirection } from '@angular/material/sort';

export interface TableChange {
  pageIndex: number;
  itemsPerPage: number;
  sortDirection: SortDirection;
  sortField: string;
  tableType: string;
}
