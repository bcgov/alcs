import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { InquiryDetailService } from '../../../services/inquiry/inquiry-detail.service';
import { InquiryParcelUpdateDto } from '../../../services/inquiry/inquiry-parcel/inquiry-parcel.dto';
import { InquiryDto } from '../../../services/inquiry/inquiry.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-parcel',
    templateUrl: './parcels.component.html',
    styleUrls: ['./parcels.component.scss'],
    standalone: false
})
export class ParcelsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  inquiry?: InquiryDto;
  isEditing = false;

  displayedColumns = ['index', 'address', 'pid', 'pin', 'actions'];
  parcels: InquiryParcelUpdateDto[] = [];
  tableSource: MatTableDataSource<InquiryParcelUpdateDto> = new MatTableDataSource();

  constructor(
    private inquiryDetailService: InquiryDetailService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
    this.inquiryDetailService.$inquiry.pipe(takeUntil(this.$destroy)).subscribe((inquiry) => {
      this.inquiry = inquiry;
      if (inquiry && inquiry.parcels) {
        this.parcels = inquiry.parcels;
        this.tableSource = new MatTableDataSource<InquiryParcelUpdateDto>(inquiry.parcels);
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onRemoveParcel(index: number) {
    if (this.isEditing) {
      this.onRemoveEditParcel(index);
    } else {
      this.onRemoveConfirmParcel(index);
    }
  }

  onRemoveConfirmParcel(index: number) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete this parcel?',
      })
      .subscribe((onConfirm) => {
        if (onConfirm) {
          this.parcels.splice(index, 1);
          this.onSave();
        }
      });
  }

  onRemoveEditParcel(index: number) {
    this.parcels.splice(index, 1);
    this.tableSource = new MatTableDataSource(this.parcels);
  }

  onAddParcel() {
    this.isEditing = true;
    this.parcels.push({
      civicAddress: '',
    });
    this.tableSource = new MatTableDataSource(this.parcels);
  }

  async onSave() {
    if (this.inquiry) {
      await this.inquiryDetailService.update(this.inquiry.fileNumber, {
        parcels: this.parcels,
      });
      this.isEditing = false;
    }
  }

  areParcelsValid() {
    return this.parcels.reduce((previousValue, parcel) => {
      const addressValid = !!parcel.civicAddress && parcel.civicAddress.length > 0;
      const pidValid = parcel.pid ? parcel.pid.length === 9 : true;
      return previousValue && pidValid && addressValid;
    }, true);
  }

  onEditParcel() {
    this.isEditing = true;
  }

  async onCancelEdit() {
    if (this.inquiry) {
      await this.inquiryDetailService.loadInquiry(this.inquiry.fileNumber);
      this.isEditing = false;
    }
  }
}
