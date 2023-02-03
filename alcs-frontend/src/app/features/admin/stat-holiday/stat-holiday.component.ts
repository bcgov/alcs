import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { StatHolidayDto } from '../../../services/stat-holiday/stat-holiday.dto';
import { StatHolidayService } from '../../../services/stat-holiday/stat-holiday.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { HolidayDialogComponent } from './holiday-dialog/holiday-dialog.component';

@Component({
  selector: 'app-stat-holiday',
  templateUrl: './stat-holiday.component.html',
  styleUrls: ['./stat-holiday.component.scss'],
})
export class StatHolidayComponent implements OnDestroy, AfterViewInit {
  destroy = new Subject<void>();

  public $statHolidays = new BehaviorSubject<StatHolidayDto[]>([]);
  pageNumber = 0;
  itemsPerPage = 20;
  search?: number = undefined;
  holidays: StatHolidayDto[] = [];
  total: number = 0;
  displayedColumns: string[] = ['name', 'day', 'actions'];

  constructor(
    private holidayService: StatHolidayService,
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngAfterViewInit(): void {
    this.fetch();

    this.holidayService.$statHolidays
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
    this.pageNumber = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    this.fetch();
  }

  fetch() {
    this.holidayService.fetch(this.pageNumber, this.itemsPerPage, this.search);
  }

  async onCreate() {
    const dialog = this.dialog.open(HolidayDialogComponent, {
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

  async onEdit(holiday: StatHolidayDto) {
    const dialog = this.dialog.open(HolidayDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        ...holiday,
      },
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onDelete(holiday: StatHolidayDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${holiday.name} ${holiday.day}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          await this.holidayService.delete(holiday.uuid);
          await this.fetch();
        }
      });
  }
}
