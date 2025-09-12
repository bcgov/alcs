import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementDto } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { Section } from '../../../../services/compliance-and-enforcement/documents/document.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyComponent } from '../../property/property.component';
import { ToastService } from '../../../../services/toast/toast.service';
import { DocumentUploadDialogData } from '../../../../shared/document-upload-dialog/document-upload-dialog.interface';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../../shared/document/document.dto';
import { ComplianceAndEnforcementPropertyService } from '../../../../services/compliance-and-enforcement/property/property.service';
import { ApplicationLocalGovernmentService } from '../../../../services/application/application-local-government/application-local-government.service';
import { ApplicationLocalGovernmentDto } from '../../../../services/application/application-local-government/application-local-government.dto';

export const mapsDocumentOptions: DocumentUploadDialogData = {
  // A necessary hack to make this work without rewriting lots of code
  fileId: '',
  allowedVisibilityFlags: [],
  allowsFileEdit: true,
  allowedDocumentSources: [
    DOCUMENT_SOURCE.PUBLIC,
    DOCUMENT_SOURCE.LFNG,
    DOCUMENT_SOURCE.BC_GOVERNMENT,
    DOCUMENT_SOURCE.OTHER_AGENCY,
    DOCUMENT_SOURCE.ALC,
  ],
  allowedDocumentTypes: [DOCUMENT_TYPE.PROPOSAL_MAP, DOCUMENT_TYPE.OTHER],
};

@Component({
  selector: 'app-property-maps',
  templateUrl: './property-maps.component.html',
  styleUrls: ['./property-maps.component.scss'],
})
export class PropertyMapsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  Section = Section;

  @ViewChild(PropertyComponent) propertyComponent?: PropertyComponent;

  fileNumber?: string;
  file?: ComplianceAndEnforcementDto;
  localGovernments: ApplicationLocalGovernmentDto[] = [];

  form = new FormGroup({});

  editing: string | null = null;

  mapsDocumentOptions = mapsDocumentOptions;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly service: ComplianceAndEnforcementService,
    private readonly propertyService: ComplianceAndEnforcementPropertyService,
    private readonly toastService: ToastService,
    private readonly localGovernmentService: ApplicationLocalGovernmentService,
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.$destroy)).subscribe(async (data) => {
      this.editing = data['editing'];
    });

    this.service.$file.pipe(takeUntil(this.$destroy)).subscribe((file) => {
      if (file) {
        this.file = file;
        this.fileNumber = file.fileNumber;
        this.mapsDocumentOptions.fileId = file.fileNumber;
      }
    });

    this.loadLocalGovernments();
  }

  async loadLocalGovernments() {
    try {
      this.localGovernments = await this.localGovernmentService.list();
    } catch (error) {
      console.error('Error loading local governments:', error);
    }
  }

  getLocalGovernmentName(localGovernmentUuid?: string): string {
    if (!localGovernmentUuid || !this.localGovernments.length) {
      return '';
    }
    const lg = this.localGovernments.find(g => g.uuid === localGovernmentUuid);
    return lg?.name || '';
  }


  async saveProperty() {
    const propertyUpdate = this.propertyComponent?.$changes.getValue() ?? {};

    if (!this.file?.property?.uuid) {
      console.error('Error loading property. Property UUID not defined.');
      this.toastService.showErrorToast('Error loading property');
      return;
    }

    try {
      await firstValueFrom(this.propertyService.update(this.file.property.uuid, propertyUpdate));
      this.toastService.showSuccessToast('Property updated successfully');
      
      // Reload the file to get updated property data
      if (this.fileNumber) {
        await this.service.loadFile(this.fileNumber, { withProperty: true });
      }
      
      this.router.navigate(['../..'], { relativeTo: this.route });
    } catch (error) {
      console.error('Error updating property:', error);
      this.toastService.showErrorToast('Error updating property');
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
