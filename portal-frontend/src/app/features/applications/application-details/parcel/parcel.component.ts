import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationOwnerDto } from '../../../../services/application-owner/application-owner.dto';
import {
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
  PARCEL_OWNERSHIP_TYPE,
} from '../../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { BaseCodeDto } from '../../../../shared/dto/base.dto';
import { formatBooleanToYesNoString } from '../../../../shared/utils/boolean-helper';
import { openFileIframe } from '../../../../shared/utils/file';

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
  $destroy = new Subject<void>();

  @Input() $applicationSubmission!: BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>;
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;

  showCertificateOfTitle: boolean = true;
  navigationStepInd = 0;

  fileId = '';
  submissionUuid = '';
  parcels: ApplicationParcelExtended[] = [];
  application!: ApplicationSubmissionDetailedDto;

  constructor(
    private applicationParcelService: ApplicationParcelService,
    private applicationDocumentService: ApplicationDocumentService,
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
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadParcels() {
    const parcels = (await this.applicationParcelService.fetchBySubmissionUuid(this.submissionUuid)) || [];
    this.parcels = parcels.map((p) => ({ ...p, isFarmText: formatBooleanToYesNoString(p.isFarm) }));
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
      openFileIframe(res);
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

  async onEditParcelsClick($event: any) {
    $event.stopPropagation();
    if (this.draftMode) {
      await this.router.navigateByUrl(`alcs/application/${this.fileId}/edit/${this.navigationStepInd}?errors=t`);
    } else {
      await this.router.navigateByUrl(`application/${this.fileId}/edit/${this.navigationStepInd}?errors=t`);
    }
  }

  async onEditParcelClick(uuid: string) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `alcs/application/${this.fileId}/edit/${this.navigationStepInd}?parcelUuid=${uuid}&errors=t`
      );
    } else {
      await this.router.navigateByUrl(
        `application/${this.fileId}/edit/${this.navigationStepInd}?parcelUuid=${uuid}&errors=t`
      );
    }
  }
}
