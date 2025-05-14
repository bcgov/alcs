import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../services/application-parcel/application-parcel.dto';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentOwnerDto } from '../../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import {
  NoticeOfIntentParcelDto,
  NoticeOfIntentParcelUpdateDto,
} from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.dto';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { BaseCodeDto } from '../../../../shared/dto/base.dto';
import { formatBooleanToYesNoString } from '../../../../shared/utils/boolean-helper';
import { downloadFile } from '../../../../shared/utils/file';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';
import { DocumentService } from '../../../../services/document/document.service';
import { ToastService } from '../../../../services/toast/toast.service';

export class NoticeOfIntentParcelBasicValidation {
  // indicates general validity check state, including owner related information
  isInvalid = false;

  isTypeRequired = false;
  isPidRequired = false;
  isPinRequired = false;
  isLegalDescriptionRequired = false;
  isMapAreaHectaresRequired = false;
  isPurchasedDateRequired = false;
  isFarmRequired = false;
  isCertificateRequired = false;
  isCertificateUploaded = false;
  isConfirmedByApplicant = false;
  isCrownSelectionMandatory = false;
}

interface NoticeOfIntentParcelExtended extends Omit<NoticeOfIntentParcelUpdateDto, 'ownerUuids'> {
  isFarmText?: string;
  ownershipType?: BaseCodeDto;
  validation?: NoticeOfIntentParcelBasicValidation;
  owners: NoticeOfIntentOwnerDto[];
  certificateOfTitle?: NoticeOfIntentDocumentDto;
}

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent {
  $destroy = new Subject<void>();

  @Input() $noticeOfIntentSubmission!: BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>;
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;

  fileId = '';
  submissionUuid = '';
  parcels: NoticeOfIntentParcelExtended[] = [];
  noticeOfIntentSubmission!: NoticeOfIntentSubmissionDetailedDto;

  isMobile = false;

  constructor(
    private noticeOfIntentParcelService: NoticeOfIntentParcelService,
    private documentService: DocumentService,
    private router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.$noticeOfIntentSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      if (noiSubmission) {
        this.fileId = noiSubmission.fileNumber;
        this.submissionUuid = noiSubmission.uuid;
        this.noticeOfIntentSubmission = noiSubmission;
        this.loadParcels().then(async () => await this.validateParcelDetails());
      }
    });
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadParcels() {
    const parcels = (await this.noticeOfIntentParcelService.fetchBySubmissionUuid(this.submissionUuid)) || [];
    this.parcels = parcels.map((p) => ({ ...p, isFarmText: formatBooleanToYesNoString(p.isFarm) }));
  }

  private async validateParcelDetails() {
    if (this.parcels) {
      this.parcels.forEach((p) => {
        p.validation = this.validateParcelBasic(p);
      });
    }
  }

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

      downloadFile(url, fileName);
    } catch (e) {
      this.toastService.showErrorToast('Failed to download file');
    }
  }

  private validateParcelBasic(parcel: NoticeOfIntentParcelDto) {
    const validation = new NoticeOfIntentParcelBasicValidation();

    if (!parcel.ownershipType) {
      validation.isTypeRequired = true;

      if (!parcel.pid && !parcel.pin) {
        validation.isPidRequired = true;
      }

      if (!parcel.purchasedDate) {
        validation.isPurchasedDateRequired = true;
      }
    }

    if (!parcel.pid && parcel.ownershipType?.code === this.PARCEL_OWNERSHIP_TYPES.FEE_SIMPLE) {
      validation.isPidRequired = true;
    }

    if (!parcel.legalDescription) {
      validation.isLegalDescriptionRequired = true;
    }

    if (!parcel.mapAreaHectares) {
      validation.isMapAreaHectaresRequired = true;
    }

    if (!parcel.purchasedDate && parcel.ownershipType?.code === this.PARCEL_OWNERSHIP_TYPES.FEE_SIMPLE) {
      validation.isPurchasedDateRequired = true;
    }

    if (parcel.ownershipType?.code === this.PARCEL_OWNERSHIP_TYPES.CROWN) {
      validation.isCrownSelectionMandatory = true;
    }

    if (!parcel.isFarm) {
      validation.isFarmRequired = true;
    }

    validation.isCertificateUploaded = !!parcel.certificateOfTitle;
    const isCrownWithPid =
      parcel.ownershipType?.code === this.PARCEL_OWNERSHIP_TYPES.CROWN && parcel.pid && parcel.pid.length > 0;
    const isFeeSimple = parcel.ownershipType?.code === this.PARCEL_OWNERSHIP_TYPES.FEE_SIMPLE;
    if (isCrownWithPid || isFeeSimple) {
      validation.isCertificateRequired = true;
    }

    validation.isInvalid = this.isInvalid(validation);

    return validation;
  }

  private isInvalid(validationObj: NoticeOfIntentParcelBasicValidation) {
    for (const prop in validationObj) {
      if (validationObj[prop as keyof typeof validationObj]) {
        return true;
      }
    }

    return false;
  }

  async onEditParcelsClick($event: any) {
    $event.stopPropagation();
    if (this.draftMode) {
      await this.router.navigateByUrl(`alcs/notice-of-intent/${this.fileId}/edit/0?errors=t`);
    } else {
      await this.router.navigateByUrl(`notice-of-intent/${this.fileId}/edit/0?errors=t`);
    }
  }

  async onEditParcelClick(uuid: string) {
    if (this.draftMode) {
      await this.router.navigateByUrl(`alcs/notice-of-intent/${this.fileId}/edit/0?parcelUuid=${uuid}&errors=t`);
    } else {
      await this.router.navigateByUrl(`notice-of-intent/${this.fileId}/edit/0?parcelUuid=${uuid}&errors=t`);
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
