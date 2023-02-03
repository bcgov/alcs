import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-holiday-dialog',
  templateUrl: './holiday-dialog.component.html',
  styleUrls: ['./holiday-dialog.component.scss'],
})
export class HolidayDialogComponent implements OnInit {
  ngOnInit(): void {
    console.log('HolidayDialogComponent ngOnInit');
  }
}
