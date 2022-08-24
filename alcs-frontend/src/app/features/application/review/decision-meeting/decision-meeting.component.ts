import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateDecisionMeetingDialogComponent } from '../create-decision-meeting-dialog/create-decision-meeting-dialog.component';

const ELEMENT_DATA: any[] = [{ date: new Date() }];

@Component({
  selector: 'app-decision-meeting',
  templateUrl: './decision-meeting.component.html',
  styleUrls: ['./decision-meeting.component.scss'],
})
export class DecisionMeetingComponent implements OnInit {
  displayedColumns: string[] = ['date', 'action'];
  dataSource = ELEMENT_DATA;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  async onCreate() {
    this.dialog.open(CreateDecisionMeetingDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {},
    });
  }

  async onEdit() {
    console.log('onEdit');
  }

  async onDelete() {
    console.log('onDelete');
  }
}
