import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DecisionConditionFinancialInstrumentDto } from '../../services/common/decision-condition-financial-instrument/decision-condition-financial-instrument.dto';
import { DecisionConditionFinancialInstrumentService } from '../../services/common/decision-condition-financial-instrument/decision-condition-financial-instrument.service';
import { DialogAction } from '../constants';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { ToastService } from '../../services/toast/toast.service';
import { DecisionConditionFinancialInstrumentDialogComponent } from './decision-condition-financial-instrument-dialog/decision-condition-financial-instrument-dialog.component';

@Component({
  selector: 'app-decision-condition-financial-instrument',
  templateUrl: './decision-condition-financial-instrument.component.html',
  styleUrl: './decision-condition-financial-instrument.component.scss',
})
export class DecisionConditionFinancialInstrumentComponent implements OnInit {
  @Input() conditionUuid!: string;

  displayColumns: string[] = ['Amount', 'Type', 'Bank', 'Instrument #', 'Received Date', 'Status', 'Action'];
  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<DecisionConditionFinancialInstrumentDto> = new MatTableDataSource();

  instruments: DecisionConditionFinancialInstrumentDto[] = [];

  constructor(
    private dialog: MatDialog,
    private financialInstrumentService: DecisionConditionFinancialInstrumentService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.initData();
  }

  async initData() {
    this.instruments = await this.financialInstrumentService.getAll(this.conditionUuid);
    this.instruments.sort((a, b) => (a.receivedDate < b.receivedDate ? -1 : 1));
    this.dataSource.data = this.instruments;
  }

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

    dialogRef.afterClosed().subscribe((result: { action: DialogAction; successful: boolean }) => {
      if (result.successful) {
        this.initData();
      }
    });
  }

  onEditInstrument(instrument: DecisionConditionFinancialInstrumentDto): void {
    const dialogRef = this.dialog.open(DecisionConditionFinancialInstrumentDialogComponent, {
      minWidth: '800px',
      maxWidth: '1100px',
      maxHeight: '80vh',
      data: {
        conditionUuid: this.conditionUuid,
        action: DialogAction.EDIT,
        instrument: instrument,
        service: this.financialInstrumentService,
      },
    });

    dialogRef.afterClosed().subscribe((result: { action: DialogAction; successful: boolean }) => {
      if (result.successful) {
        this.initData();
      }
    });
  }

  onDeleteInstrument(instrument: DecisionConditionFinancialInstrumentDto): void {
    this.confirmationDialogService
      .openDialog({ body: 'Are you sure you want to delete this instrument?' })
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            await this.financialInstrumentService.delete(this.conditionUuid, instrument.uuid);
            this.toastService.showSuccessToast('Instrument successfully deleted');
            this.initData();
          } catch (e) {
            this.toastService.showErrorToast('Failed to delete the instrument');
          }
        }
      });
  }

  getFormattedStatus(instrument: DecisionConditionFinancialInstrumentDto): string {
    if (instrument.status === 'Received') {
      return instrument.status;
    }

    if (instrument.receivedDate) {
      return `${instrument.status} on ${new Date(instrument.receivedDate).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      })}`;
    }

    return instrument.status;
  }
}
