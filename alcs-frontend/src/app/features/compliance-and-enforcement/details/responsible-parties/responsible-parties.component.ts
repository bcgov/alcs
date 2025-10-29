import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ComplianceAndEnforcementDto } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { Section } from '../../../../services/compliance-and-enforcement/documents/document.service';
import { ComplianceAndEnforcementPropertyService } from '../../../../services/compliance-and-enforcement/property/property.service';
import {
  FOIPPACategory,
  ResponsiblePartyDto,
  ResponsiblePartyType,
  UpdateResponsiblePartyDto,
} from '../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.dto';
import { ResponsiblePartiesService } from '../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { DocumentUploadDialogData } from '../../../../shared/document-upload-dialog/document-upload-dialog.interface';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../../shared/document/document.dto';
import { ResponsiblePartiesComponent } from '../../responsible-parties/responsible-parties.component';

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
    DOCUMENT_TYPE.SURVEY_PLAN,
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
    private readonly propertyService: ComplianceAndEnforcementPropertyService,
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
        this.ownershipDocumentOptions.parcelService = {
          fetchParcels: async (fileNumber: string) => {
            const properties = await this.propertyService.fetchParcels(fileNumber);
            return properties.map(property => ({
              uuid: property.uuid,
              pid: property.pid || undefined,
              certificateOfTitleUuid: property.certificateOfTitleUuid
            }));
          }
        };
        this.ownershipDocumentOptions.submissionService = this.responsiblePartiesService;
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
    
    return party.partyType;
  }

  getHeaderPartyType(): string {
    // If there are responsible parties, get the most common party type
    if (this.responsibleParties.length === 0) {
      return 'Responsible Party';
    }

    // If there's only one party, use its type
    if (this.responsibleParties.length === 1) {
      return this.responsibleParties[0].partyType;
    }

    // If multiple parties, check if they're all the same type
    const firstPartyType = this.responsibleParties[0].partyType;
    const allSameType = this.responsibleParties.every(party => party.partyType === firstPartyType);
    
    if (allSameType) {
      return firstPartyType;
    }

    // Mixed types, use generic term
    return 'Responsible Parties';
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

  async saveDirectorInlineEdit(party: ResponsiblePartyDto, director: any, field: 'email' | 'phone', newValue: string | null) {
    // Convert null to undefined for DTO compatibility
    const value = newValue === null ? undefined : newValue;
    const updateDto: UpdateResponsiblePartyDto = {
      directors: party.directors?.map(d => {
        if (d.uuid === director.uuid) {
          return {
            ...d,
            ...(field === 'email' ? { directorEmail: value } : { directorTelephone: value })
          };
        }
        return d;
      })
    };

    try {
      await firstValueFrom(this.responsiblePartiesService.update(party.uuid, updateDto));
      this.toastService.showSuccessToast(`Director ${field} updated successfully`);
      this.loadResponsibleParties();
    } catch (error) {
      console.error(`Error updating director ${field}:`, error);
      this.toastService.showErrorToast(`Error updating director ${field}`);
    }
  }

  async saveResponsibleParties() {
    // Force immediate save of all form changes in the responsible parties component ( this bypasses the debounce and saves immediately )
    if (this.responsiblePartiesComponent) {
      await this.responsiblePartiesComponent.saveAllForms();
    }
    
    // Navigate immediately
    this.router.navigate(['..'], { relativeTo: this.route });
    
    // Show success toast after navigation
    setTimeout(() => {
      this.toastService.showSuccessToast('Responsible parties updated successfully');
    }, 100); // Short delay to ensure navigation completes
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
