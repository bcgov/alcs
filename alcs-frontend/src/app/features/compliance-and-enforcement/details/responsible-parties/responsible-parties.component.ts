import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementDto } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { Section } from '../../../../services/compliance-and-enforcement/documents/document.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../services/toast/toast.service';
import { DocumentUploadDialogData } from '../../../../shared/document-upload-dialog/document-upload-dialog.interface';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../../shared/document/document.dto';
import {
  ResponsiblePartyDto,
  ResponsiblePartyType,
  FOIPPACategory,
  UpdateResponsiblePartyDto,
} from '../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.dto';
import { ResponsiblePartiesService } from '../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.service';
import { ResponsiblePartiesComponent } from '../../responsible-parties/responsible-parties.component';
import moment from 'moment';

export const ownershipDocumentOptions: DocumentUploadDialogData = {
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
  allowedDocumentTypes: [
    DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
    DOCUMENT_TYPE.CORPORATE_SUMMARY,
    DOCUMENT_TYPE.BC_ASSESSMENT_REPORT,
    DOCUMENT_TYPE.OTHER,
  ],
};

@Component({
  selector: 'app-responsible-parties-details',
  templateUrl: './responsible-parties.component.html',
  styleUrls: ['./responsible-parties.component.scss'],
})
export class ResponsiblePartiesDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  Section = Section;
  ResponsiblePartyType = ResponsiblePartyType;
  FOIPPACategory = FOIPPACategory;

  @ViewChild(ResponsiblePartiesComponent) responsiblePartiesComponent?: ResponsiblePartiesComponent;

  fileNumber?: string;
  file?: ComplianceAndEnforcementDto;
  responsibleParties: ResponsiblePartyDto[] = [];
  isPropertyCrown = false;
  crownNotes = '';

  form = new FormGroup({});
  editing: string | null = null;

  ownershipDocumentOptions = ownershipDocumentOptions;


  // Crown party object for template usage
  crownParty = { uuid: 'crown' } as ResponsiblePartyDto;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly service: ComplianceAndEnforcementService,
    private readonly responsiblePartiesService: ResponsiblePartiesService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.$destroy)).subscribe(async (data) => {
      this.editing = data['editing'];
    });

    this.service.$file.pipe(takeUntil(this.$destroy)).subscribe((file) => {
      if (file) {
        this.file = file;
        this.fileNumber = file.fileNumber;
        this.ownershipDocumentOptions.fileId = file.fileNumber;
        this.isPropertyCrown = file.property?.ownershipTypeCode === 'CRWN';
        this.loadResponsibleParties();
      }
    });
  }

  async loadResponsibleParties() {
    if (!this.fileNumber) return;

    try {
      this.responsibleParties = await this.responsiblePartiesService.fetchByFileNumber(this.fileNumber);
      this.sortResponsibleParties();
    } catch (error) {
      console.error('Error loading responsible parties:', error);
    }
  }

  sortResponsibleParties() {
    // Sort property owners A-Z by name, then other types
    this.responsibleParties.sort((a, b) => {
      const aName = this.getPartyDisplayName(a);
      const bName = this.getPartyDisplayName(b);
      
      // Property owners first, then others
      if (a.partyType === ResponsiblePartyType.PROPERTY_OWNER && b.partyType !== ResponsiblePartyType.PROPERTY_OWNER) {
        return -1;
      }
      if (b.partyType === ResponsiblePartyType.PROPERTY_OWNER && a.partyType !== ResponsiblePartyType.PROPERTY_OWNER) {
        return 1;
      }
      
      return aName.localeCompare(bName);
    });
  }

  getPartyDisplayName(party: ResponsiblePartyDto): string {
    return party.foippaCategory === FOIPPACategory.INDIVIDUAL
      ? party.individualName || ''
      : party.organizationName || '';
  }

  getPartyEmail(party: ResponsiblePartyDto): string {
    return party.foippaCategory === FOIPPACategory.INDIVIDUAL
      ? party.individualEmail || ''
      : party.organizationEmail || '';
  }

  getPartyPhone(party: ResponsiblePartyDto): string {
    return party.foippaCategory === FOIPPACategory.INDIVIDUAL
      ? party.individualTelephone || ''
      : party.organizationTelephone || '';
  }

  getPartyNotes(party: ResponsiblePartyDto): string {
    return party.foippaCategory === FOIPPACategory.INDIVIDUAL
      ? party.individualNote || ''
      : party.organizationNote || '';
  }

  getPartyAddress(party: ResponsiblePartyDto): string {
    return party.foippaCategory === FOIPPACategory.INDIVIDUAL
      ? party.individualMailingAddress || ''
      : '';
  }

  formatOwnerSince(ownerSince?: number | null): string {
    return ownerSince ? moment(ownerSince).format('MMM D, YYYY') : '';
  }

  getPartyTypeDisplay(party: ResponsiblePartyDto): string {
    if (party.isPrevious) {
      return `Previous ${party.partyType}`;
    }
    
    if (party.partyType === ResponsiblePartyType.PROPERTY_OWNER && party.ownerSince) {
      return `Property Owner Since: ${this.formatOwnerSince(party.ownerSince)}`;
    }
    
    return party.partyType;
  }

  async saveInlineEdit(party: ResponsiblePartyDto, field: 'email' | 'phone' | 'notes', newValue: string | null) {
    // Handle Crown notes separately (stored locally for now)
    if (party.uuid === 'crown' && field === 'notes') {
      this.crownNotes = newValue || '';
      this.toastService.showSuccessToast('Crown notes updated successfully');
      return;
    }

    // Convert null to undefined for DTO compatibility
    const value = newValue === null ? undefined : newValue;
    const updateDto: UpdateResponsiblePartyDto = {};
    
    if (party.foippaCategory === FOIPPACategory.INDIVIDUAL) {
      if (field === 'email') updateDto.individualEmail = value;
      else if (field === 'phone') updateDto.individualTelephone = value;
      else if (field === 'notes') updateDto.individualNote = value;
    } else {
      if (field === 'email') updateDto.organizationEmail = value;
      else if (field === 'phone') updateDto.organizationTelephone = value;
      else if (field === 'notes') updateDto.organizationNote = value;
    }

    try {
      await firstValueFrom(this.responsiblePartiesService.update(party.uuid, updateDto));
      this.toastService.showSuccessToast(`${field} updated successfully`);
      this.loadResponsibleParties();
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      this.toastService.showErrorToast(`Error updating ${field}`);
    }
  }

  async saveResponsibleParties() {
    // This would handle bulk updates from the edit form
    this.toastService.showSuccessToast('Responsible parties updated successfully');
    this.router.navigate(['../..'], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
