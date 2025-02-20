import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DecisionConditionFinancialInstrumentDto } from '../../services/common/decision-condition-financial-instrument/decision-condition-financial-instrument.dto';
import { DialogAction } from '../constants';
import { DecisionConditionFinancialInstrumentDialogComponent } from './decision-condition-financial-instrument-dialog/decision-condition-financial-instrument-dialog.component';
import { DecisionConditionFinancialInstrumentService } from '../../services/common/decision-condition-financial-instrument/decision-condition-financial-instrument.service';

@Component({
  selector: 'app-decision-condition-financial-instrument',
  templateUrl: './decision-condition-financial-instrument.component.html',
  styleUrl: './decision-condition-financial-instrument.component.scss',
})
export class DecisionConditionFinancialInstrumentComponent implements OnInit {
  @Input() conditionUuid!: string;

  constructor(
    private dialog: MatDialog,
    private financialInstrumentService: DecisionConditionFinancialInstrumentService,
  ) {}

  ngOnInit(): void {}

  onAddInstrument(): void {
    const dialogRef = this.dialog.open(DecisionConditionFinancialInstrumentDialogComponent, {
      minWidth: '800px',
      maxWidth: '1100px',
      maxHeight: '80vh',
      data: {
        conditionUuid: this.conditionUuid,
        action: DialogAction.ADD,
        service: this.financialInstrumentService,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  onEditInstrument(instrument: DecisionConditionFinancialInstrumentDto): void {
    // Logic to edit an instrument
    console.log(`Edit instrument with ID: ${instrument.uuid}`);
  }

  onDeleteInstrument(instrument: DecisionConditionFinancialInstrumentDto): void {
    // Logic to delete an instrument
    console.log(`Delete instrument with ID: ${instrument.uuid}`);
  }
}
