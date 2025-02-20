import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionConditionDto } from '../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { countToString } from '../../../../../../../shared/utils/count-to-string';

@Component({
  selector: 'app-decision-condition-order-dialog',
  templateUrl: './decision-condition-order-dialog.component.html',
  styleUrl: './decision-condition-order-dialog.component.scss',
})
export class DecisionConditionOrderDialogComponent implements OnInit {
  displayedColumns = ['index', 'type', 'description', 'actions'];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { conditions: { condition: ApplicationDecisionConditionDto; index: number }[]; decision: string },
    private dialogRef: MatDialogRef<DecisionConditionOrderDialogComponent>,
  ) {}

  async ngOnInit() {
    console.log(this.data);
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onSave(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  alphaIndex(index: number) {
    return countToString(index);
  }
}
