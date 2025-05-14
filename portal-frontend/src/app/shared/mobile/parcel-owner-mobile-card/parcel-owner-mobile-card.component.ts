import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { NoticeOfIntentOwnerDto } from '../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { downloadFile } from '../../utils/file';
import { DocumentService } from '../../../services/document/document.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-parcel-owner-mobile-card',
  templateUrl: './parcel-owner-mobile-card.component.html',
  styleUrl: './parcel-owner-mobile-card.component.scss',
})
export class ParcelOwnerMobileCardComponent implements OnInit {
  @Input() owner!: ApplicationOwnerDto | NoticeOfIntentOwnerDto;
  @Input() isLast: boolean = false;
  @Input() isReviewStep: boolean = false;
  @Input() isCrown: boolean = false;
  @Output() editClicked = new EventEmitter<ApplicationOwnerDto | NoticeOfIntentOwnerDto>();
  @Output() removeClicked = new EventEmitter<ApplicationOwnerDto | NoticeOfIntentOwnerDto>();
  @Output() openFileClicked = new EventEmitter<ApplicationOwnerDto | NoticeOfIntentOwnerDto>();

  constructor(
    private documentService: DocumentService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {}

  onEdit() {
    this.editClicked.emit(this.owner);
  }

  onRemove() {
    this.removeClicked.emit(this.owner);
  }

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

      downloadFile(url, fileName);
    } catch (e) {
      this.toastService.showErrorToast('Failed to download file');
    }
  }
}
