import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { LocalGovernmentDto } from '../../../services/admin-local-government/admin-local-government.dto';
import { AdminLocalGovernmentService } from '../../../services/admin-local-government/admin-local-government.service';
import { HolidayDto } from '../../../services/stat-holiday/holiday.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
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
  search?: number = undefined;
  holidays: HolidayDto[] = [];
  total: number = 0;
  displayedColumns: string[] = ['name', 'bceidBusinessGuid', 'isFirstNation', 'actions'];

  constructor(
    private adminLgService: AdminLocalGovernmentService,
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.fetch();

    this.adminLgService.$localGovernments
      .pipe(takeUntil(this.destroy))
      .subscribe((result: { data: any[]; total: number }) => {
        this.holidays = result.data;
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
}
