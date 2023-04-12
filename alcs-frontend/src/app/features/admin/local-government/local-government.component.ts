import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { LocalGovernmentDto } from '../../../services/admin-local-government/admin-local-government.dto';
import { AdminLocalGovernmentService } from '../../../services/admin-local-government/admin-local-government.service';
import { LocalGovernmentDialogComponent } from './dialog/local-government-dialog.component';

@Component({
  selector: 'app-admin-local-government',
  templateUrl: './local-government.component.html',
  styleUrls: ['./local-government.component.scss'],
})
export class LocalGovernmentComponent implements OnDestroy, OnInit {
  destroy = new Subject<void>();

  pageIndex = 0;
  itemsPerPage = 20;
  search?: string = undefined;
  localGovernments: LocalGovernmentDto[] = [];
  total: number = 0;
  displayedColumns: string[] = ['name', 'bceidBusinessGuid', 'isFirstNation', 'isActive', 'actions'];
  filteredOptions: string[] = [];

  constructor(private adminLgService: AdminLocalGovernmentService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetch();

    this.adminLgService.$localGovernments
      .pipe(takeUntil(this.destroy))
      .subscribe((result: { data: LocalGovernmentDto[]; total: number }) => {
        this.localGovernments = result.data;
        this.filteredOptions = [];
        this.total = result.total;
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  onPageChange($event: PageEvent) {
    this.pageIndex = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    this.fetch();
  }

  fetch() {
    this.adminLgService.fetch(this.pageIndex, this.itemsPerPage, this.search);
  }

  async onCreate() {
    const dialog = this.dialog.open(LocalGovernmentDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {},
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onEdit(localGovernment: LocalGovernmentDto) {
    const dialog = this.dialog.open(LocalGovernmentDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        ...localGovernment,
      },
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async updateFilter(value: string) {
    const governmentResponse = await this.adminLgService.search(0, 5, value);
    if (governmentResponse) {
      this.filteredOptions = governmentResponse.data.map((gov) => gov.name);
    }
  }
}
