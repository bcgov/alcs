import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionConditionDateDto } from '../../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { NoticeOfIntentDecisionConditionDateDto } from '../../../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import moment, { Moment } from 'moment';

export interface DueDate {
  uuid?: string;
  date?: Moment;
}

@Component({
    selector: 'app-decision-condition-date-dialog',
    templateUrl: './decision-condition-date-dialog.component.html',
    styleUrls: ['./decision-condition-date-dialog.component.scss'],
    standalone: false
})
export class DecisionConditionDateDialogComponent {
  displayedColumns = ['index', 'date', 'actions'];
  dates: DueDate[] = [];
  tableData = new MatTableDataSource<DueDate, MatPaginator>([]);
  isAdding: boolean = false;
  isRequired: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dates: ApplicationDecisionConditionDateDto[] | NoticeOfIntentDecisionConditionDateDto[];
      isAdding: boolean;
      isRequired: boolean;
    },
    private dialogRef: MatDialogRef<DecisionConditionDateDialogComponent>,
  ) {
    if (data) {
      this.dates =
        data.dates.length > 0
          ? data.dates.map(({ uuid, date }) => ({
              uuid,
              date: date ? moment(date) : undefined,
            }))
          : [{}];
      this.tableData = new MatTableDataSource(this.dates);
      this.isAdding = data.isAdding;
      this.isRequired = data.isRequired;
    }
  }

  addDueDate() {
    this.dates.push({});
    this.tableData = new MatTableDataSource(this.dates);
  }

  removeDueDate(i: number) {
    this.dates.splice(i, 1);
    this.tableData = new MatTableDataSource(this.dates);
  }

  async onSubmit() {
    this.dialogRef.close(this.dates);
  }

  async onCancel() {
    this.dialogRef.close(null);
  }
}
