import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { StatHolidayDto } from '../../../services/stat-holiday/stat-holiday.dto';
import { StatHolidayService } from '../../../services/stat-holiday/stat-holiday.service';

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
  displayedColumns: string[] = ['name', 'day'];

  constructor(private holidayService: StatHolidayService) {}
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

}
