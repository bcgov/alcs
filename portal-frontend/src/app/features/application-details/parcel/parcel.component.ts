import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { getDiff } from 'recursive-diff';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import {
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
  PARCEL_TYPE,
} from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { formatBooleanToYesNoString } from '../../../shared/utils/boolean-helper';
import { getLetterCombinations } from '../../../shared/utils/number-to-letter-helper';

export class ApplicationParcelBasicValidation {
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

interface ApplicationParcelExtended extends Omit<ApplicationParcelUpdateDto, 'ownerUuids'> {
  parcelType: string;
  isFarmText?: string;
  ownershipType?: BaseCodeDto;
  validation?: ApplicationParcelBasicValidation;
  owners: ApplicationOwnerDto[];
  certificateOfTitle?: ApplicationDocumentDto;
}

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent {
  // TODO instead of providing application load parcel as input or in addition to application
  $destroy = new Subject<void>();

  @Input() $applicationSubmission!: BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>;
  @Input() originalSubmissionUuid: string | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;
  @Input() parcelType: PARCEL_TYPE = PARCEL_TYPE.APPLICATION;

  PARCEL_TYPES = PARCEL_TYPE;

  pageTitle: string = '1. Identify Parcel(s) Under Application';
  showCertificateOfTitle: boolean = true;
  navigationStepInd = 0;

  fileId = '';
  submissionUuid = '';
  parcels: ApplicationParcelExtended[] = [];
  application!: ApplicationSubmissionDetailedDto;
  updatedFields: string[] = [];

  constructor(
    private applicationParcelService: ApplicationParcelService,
    private applicationDocumentService: ApplicationDocumentService,
    private ownerService: ApplicationOwnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;
        this.application = applicationSubmission;
        this.loadParcels().then(async () => await this.validateParcelDetails());
      }
    });

    if (this.parcelType === PARCEL_TYPE.OTHER) {
      this.pageTitle = '2. Other Parcels in the Community';
      this.showCertificateOfTitle = false;
      this.navigationStepInd = 1;
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadParcels() {
    const parcels = (await this.applicationParcelService.fetchBySubmissionUuid(this.submissionUuid)) || [];
    this.parcels = parcels
      .filter((p) => p.parcelType === this.parcelType)
      .map((p) => ({ ...p, isFarmText: formatBooleanToYesNoString(p.isFarm) }));

    if (this.originalSubmissionUuid) {
      const oldParcels = await this.applicationParcelService.fetchBySubmissionUuid(this.originalSubmissionUuid);
      if (oldParcels) {
        const oldTypedParcels = oldParcels.filter((p) => p.parcelType === this.parcelType);
        const diffResult = getDiff(oldTypedParcels, this.parcels);
        const changedFields = new Set<string>();
        for (const diff of diffResult) {
          const partialPath = [];
          for (const path of diff.path) {
            partialPath.push(path);
            changedFields.add(partialPath.join('.'));
          }
        }
        this.updatedFields = [...changedFields.keys()];
      }
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
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  private validateParcelBasic(parcel: ApplicationParcelDto) {
    const validation = new ApplicationParcelBasicValidation();

    if (!parcel.ownershipType) {
      validation.isTypeRequired = true;

      if (!parcel.pid && !parcel.pin) {
        validation.isPidRequired = true;
      }

      if (!parcel.purchasedDate) {
        validation.isPurchasedDateRequired = true;
      }
    }

    if (!parcel.pid && parcel.ownershipType?.code === 'SMPL') {
      validation.isPidRequired = true;
    }

    if (!parcel.legalDescription) {
      validation.isLegalDescriptionRequired = true;
    }

    if (!parcel.mapAreaHectares) {
      validation.isMapAreaHectaresRequired = true;
    }

    if (!parcel.purchasedDate && parcel.ownershipType?.code === 'SMPL') {
      validation.isPurchasedDateRequired = true;
    }

    if (parcel.ownershipType?.code === 'CRWN') {
      validation.isCrownSelectionMandatory = true;
    }

    if (!parcel.isFarm) {
      validation.isFarmRequired = true;
    }

    validation.isCertificateUploaded = !!parcel.certificateOfTitle;
    const isCrownWithPid = parcel.ownershipType?.code === 'CRWN' && parcel.pid && parcel.pid.length > 0;
    const isFeeSimple = parcel.ownershipType?.code === 'SMPL';
    if (this.showCertificateOfTitle && (isCrownWithPid || isFeeSimple)) {
      validation.isCertificateRequired = true;
    }

    validation.isInvalid = this.isInvalid(validation);

    return validation;
  }

  private isInvalid(validationObj: ApplicationParcelBasicValidation) {
    for (const prop in validationObj) {
      if (validationObj[prop as keyof typeof validationObj]) {
        return true;
      }
    }

    return false;
  }

  onEditParcelsClick($event: any) {
    $event.stopPropagation();
    if (this.draftMode) {
      this.router.navigateByUrl(`alcs/application/${this.fileId}/edit/${this.navigationStepInd}?errors=t`);
    } else {
      this.router.navigateByUrl(`application/${this.fileId}/edit/${this.navigationStepInd}?errors=t`);
    }
  }

  onEditParcelClick(uuid: string) {
    if (this.draftMode) {
      this.router.navigateByUrl(
        `alcs/application/${this.fileId}/edit/${this.navigationStepInd}?parcelUuid=${uuid}&errors=t`
      );
    } else {
      this.router.navigateByUrl(
        `application/${this.fileId}/edit/${this.navigationStepInd}?parcelUuid=${uuid}&errors=t`
      );
    }
  }

  getLetterIndex(num: number) {
    return getLetterCombinations(num);
  }
}
