import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { getDiff } from 'recursive-diff';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../services/application-parcel/application-parcel.dto';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerDto } from '../../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import {
  NoticeOfIntentParcelDto,
  NoticeOfIntentParcelUpdateDto,
} from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.dto';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { BaseCodeDto } from '../../../../shared/dto/base.dto';
import { formatBooleanToYesNoString } from '../../../../shared/utils/boolean-helper';
import { getLetterCombinations } from '../../../../shared/utils/number-to-letter-helper';

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
  @Input() originalSubmissionUuid: string | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;

  fileId = '';
  submissionUuid = '';
  parcels: NoticeOfIntentParcelExtended[] = [];
  noticeOfIntentSubmission!: NoticeOfIntentSubmissionDetailedDto;
  updatedFields: string[] = [];

  constructor(
    private noticeOfIntentParcelService: NoticeOfIntentParcelService,
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private ownerService: NoticeOfIntentOwnerService,
    private router: Router
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
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadParcels() {
    const parcels = (await this.noticeOfIntentParcelService.fetchBySubmissionUuid(this.submissionUuid)) || [];
    this.parcels = parcels.map((p) => ({ ...p, isFarmText: formatBooleanToYesNoString(p.isFarm) }));

    if (this.originalSubmissionUuid) {
      await this.calculateParcelDiffs(this.originalSubmissionUuid);
    }
  }

  private async calculateParcelDiffs(originalSubmissionUuid: string) {
    const oldParcels = await this.noticeOfIntentParcelService.fetchBySubmissionUuid(originalSubmissionUuid);
    if (oldParcels) {
      const diffResult = getDiff(oldParcels, this.parcels);
      const changedFields = new Set<string>();
      for (const diff of diffResult) {
        const partialPath = [];
        const fullPath = diff.path.join('.');
        if (!fullPath.toLowerCase().includes('uuid')) {
          for (const path of diff.path) {
            if (typeof path !== 'string' || !path.includes('Uuid')) {
              partialPath.push(path);
              changedFields.add(partialPath.join('.'));
            }
          }
          if ((diff.op = 'add') && typeof diff.val === 'object') {
            for (const key of Object.keys(diff.val)) {
              changedFields.add(`${diff.path.join('.')}.${key}`);
            }
          }
        }
      }
      this.updatedFields = [...changedFields.keys()];
    }
  }

  private async validateParcelDetails() {
    if (this.parcels) {
      this.parcels.forEach((p) => {
        p.validation = this.validateParcelBasic(p);
      });
    }
  }

  async onOpenFile(uuid: string) {
    const res = await this.noticeOfIntentDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
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

  getLetterIndex(num: number) {
    return getLetterCombinations(num);
  }
}
