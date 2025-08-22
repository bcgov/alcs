import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil, firstValueFrom, EMPTY, catchError, debounceTime } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import moment, { Moment } from 'moment';
import {
  ResponsiblePartyDto,
  ResponsiblePartyType,
  FOIPPACategory,
  CreateResponsiblePartyDto,
  UpdateResponsiblePartyDto,
  CreateResponsiblePartyDirectorDto,
} from '../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.dto';
import { ResponsiblePartiesService } from '../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { ToastService } from '../../../services/toast/toast.service';
import { strictEmailValidator } from '../../../shared/validators/email-validator';
import { C_E_AUTOSAVE_DEBOUNCE_MS } from '../constants';

@Component({
  selector: 'app-compliance-and-enforcement-responsible-parties',
  templateUrl: './responsible-parties.component.html',
  styleUrls: ['./responsible-parties.component.scss'],
})
export class ResponsiblePartiesComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() fileUuid?: string;
  @Input() isPropertyCrown = false;

  ResponsiblePartyType = ResponsiblePartyType;
  FOIPPACategory = FOIPPACategory;

  responsiblePartyTypes = Object.entries(ResponsiblePartyType).map(([key, value]) => ({ key, value }));
  foippaCategories = Object.entries(FOIPPACategory).map(([key, value]) => ({ key, value }));

  responsibleParties: ResponsiblePartyDto[] = [];
  form = new FormArray<FormGroup>([]);

  isLoading = false;
  showRequiredError = false;

  // Prevent duplicate create calls for the same form during rapid value changes
  private creatingForms = new WeakSet<FormGroup>();
  
  // Flag to prevent auto-save during deletion operations
  private isDeleting = false;

  constructor(
    private readonly responsiblePartiesService: ResponsiblePartiesService,
    private readonly confirmationDialogService: ConfirmationDialogService,
    private readonly toastService: ToastService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    if (this.fileUuid) {
      this.loadResponsibleParties();
    }
  }

  async loadResponsibleParties() {
    if (!this.fileUuid) return;

    this.isLoading = true;
    try {
      this.responsibleParties = await this.responsiblePartiesService.fetchByFileUuid(this.fileUuid);
      this.buildFormArray();
    } catch (error: any) {
      if (error.status !== 404) {
        console.error('Error loading responsible parties', error);
        this.toastService.showErrorToast('Failed to load responsible parties');
      }
    } finally {
      this.isLoading = false;
    }
  }

  buildFormArray() {
    this.form.clear();

    this.responsibleParties.forEach((party) => {
      const partyForm = this.createPartyFormGroup(party);
      this.form.push(partyForm);
    });

  }

  createPartyFormGroup(party?: ResponsiblePartyDto): FormGroup {
    const directorsArray = new FormArray<FormGroup>([]);

    if (party?.directors) {
      party.directors.forEach((director) => {
        directorsArray.push(this.createDirectorFormGroup(director));
      });
    }

    const partyForm = new FormGroup({
      uuid: new FormControl<string>(party?.uuid || ''),
      partyType: new FormControl<ResponsiblePartyType>(party?.partyType || ResponsiblePartyType.PROPERTY_OWNER, [
        Validators.required,
      ]),
      foippaCategory: new FormControl<FOIPPACategory>(party?.foippaCategory || FOIPPACategory.INDIVIDUAL, [
        Validators.required,
      ]),
      isPrevious: new FormControl<boolean>(party?.isPrevious || false),
      ownerSince: new FormControl<Moment | null>(party?.ownerSince ? moment(party.ownerSince) : null),

      // Individual fields
      individualName: new FormControl<string>(party?.individualName || ''),
      individualMailingAddress: new FormControl<string>(party?.individualMailingAddress || ''),
      individualTelephone: new FormControl<string>(party?.individualTelephone || ''),
      individualEmail: new FormControl<string>(party?.individualEmail || '', [strictEmailValidator]),
      individualNote: new FormControl<string>(party?.individualNote || ''),

      // Organization fields
      organizationName: new FormControl<string>(party?.organizationName || ''),
      organizationTelephone: new FormControl<string>(party?.organizationTelephone || ''),
      organizationEmail: new FormControl<string>(party?.organizationEmail || '', [strictEmailValidator]),
      organizationNote: new FormControl<string>(party?.organizationNote || ''),
      directors: directorsArray,
    });

    this.updateValidators(partyForm);
    this.subscribeToFormChanges(partyForm, party);

    return partyForm;
  }

  createDirectorFormGroup(director?: any): FormGroup {
    return new FormGroup({
      uuid: new FormControl<string>(director?.uuid || ''),
      directorName: new FormControl<string>(director?.directorName || '', [Validators.required]),
      directorMailingAddress: new FormControl<string>(director?.directorMailingAddress || '', [Validators.required]),
      directorTelephone: new FormControl<string>(director?.directorTelephone || ''),
      directorEmail: new FormControl<string>(director?.directorEmail || '', [strictEmailValidator]),
    });
  }

  updateValidators(partyForm: FormGroup) {
    const partyType = partyForm.get('partyType')?.value;
    const foippaCategory = partyForm.get('foippaCategory')?.value;

    // Clear all validators first
    partyForm.get('individualName')?.setValidators([]);
    partyForm.get('individualMailingAddress')?.setValidators([]);
    partyForm.get('organizationName')?.setValidators([]);
    partyForm.get('ownerSince')?.setValidators([]);

    // Set validators based on FOIPPA category
    if (foippaCategory === FOIPPACategory.INDIVIDUAL) {
      partyForm.get('individualName')?.setValidators([Validators.required]);
      partyForm.get('individualMailingAddress')?.setValidators([Validators.required]);
    } else if (foippaCategory === FOIPPACategory.ORGANIZATION) {
      partyForm.get('organizationName')?.setValidators([Validators.required]);
    }

    // Set Owner Since validator for Property Owner
    if (partyType === ResponsiblePartyType.PROPERTY_OWNER) {
      partyForm.get('ownerSince')?.setValidators([Validators.required]);
    }

    // Update validity
    partyForm.get('individualName')?.updateValueAndValidity();
    partyForm.get('individualMailingAddress')?.updateValueAndValidity();
    partyForm.get('organizationName')?.updateValueAndValidity();
    partyForm.get('ownerSince')?.updateValueAndValidity();
  }

  subscribeToFormChanges(partyForm: FormGroup, existingParty?: ResponsiblePartyDto) {
    partyForm.valueChanges
      .pipe(
        debounceTime(C_E_AUTOSAVE_DEBOUNCE_MS),
        takeUntil(this.$destroy),
        catchError((error) => {
          console.error('Error in form changes', error);
          return EMPTY;
        }),
      )
      .subscribe(async (formValue) => {
        // Skip auto-save if we're in the middle of a deletion operation
        if (this.isDeleting) {
          return;
        }
        
        if (!this.fileUuid) {
          console.warn('No fileUuid available for responsible party save');
          return;
        }

        await this.handleFormValueChange(formValue, partyForm, existingParty);
      });

    this.subscribeToFieldChanges(partyForm);
  }

  private async handleFormValueChange(formValue: any, partyForm: FormGroup, existingParty?: ResponsiblePartyDto) {
    const updateDto = this.buildUpdateDto(formValue);

    try {
      if (existingParty?.uuid) {
        await this.updateExistingParty(existingParty.uuid, updateDto);
      } else if (this.shouldUpdateExistingParty(formValue)) {
        await this.updateExistingParty(formValue.uuid, updateDto);
      } else {
        await this.createNewParty(formValue, updateDto, partyForm);
      }
    } catch (error) {
      console.error('Error saving responsible party', error);
      this.toastService.showErrorToast('Failed to save responsible party');
      this.creatingForms.delete(partyForm);
    }
  }

  private buildUpdateDto(formValue: any): UpdateResponsiblePartyDto {
    return {
      partyType: formValue.partyType,
      foippaCategory: formValue.foippaCategory,
      isPrevious: formValue.isPrevious,
      ownerSince: formValue.ownerSince?.toDate().getTime() || null,
      individualName: formValue.individualName,
      individualMailingAddress: formValue.individualMailingAddress,
      individualTelephone: formValue.individualTelephone,
      individualEmail: formValue.individualEmail,
      individualNote: formValue.individualNote,
      organizationName: formValue.organizationName,
      organizationTelephone: formValue.organizationTelephone,
      organizationEmail: formValue.organizationEmail,
      organizationNote: formValue.organizationNote,
      directors: formValue.directors,
    };
  }

  private shouldUpdateExistingParty(formValue: any): boolean {
    return formValue.uuid && this.responsibleParties.find(p => p.uuid === formValue.uuid);
  }

  private async updateExistingParty(uuid: string, updateDto: UpdateResponsiblePartyDto) {
    await firstValueFrom(this.responsiblePartiesService.update(uuid, updateDto));
    this.toastService.showSuccessToast('Responsible party updated');
  }

  private async createNewParty(formValue: any, updateDto: UpdateResponsiblePartyDto, partyForm: FormGroup) {
    // Guard against duplicate in-flight creates for this form
    if (this.creatingForms.has(partyForm)) {
      return;
    }

    this.creatingForms.add(partyForm);
    const createDto = this.buildCreateDto(formValue, updateDto);
    
    try {
      const newParty = await firstValueFrom(this.responsiblePartiesService.create(createDto));
      this.handleNewPartyCreated(newParty, partyForm);
    } finally {
      this.creatingForms.delete(partyForm);
    }
  }

  private buildCreateDto(formValue: any, updateDto: UpdateResponsiblePartyDto): CreateResponsiblePartyDto {
    return {
      fileUuid: this.fileUuid!,
      partyType: formValue.partyType || ResponsiblePartyType.PROPERTY_OWNER,
      foippaCategory: formValue.foippaCategory || FOIPPACategory.INDIVIDUAL,
      isPrevious: updateDto.isPrevious || false,
      ownerSince: updateDto.ownerSince,
      individualName: updateDto.individualName,
      individualMailingAddress: updateDto.individualMailingAddress,
      individualTelephone: updateDto.individualTelephone,
      individualEmail: updateDto.individualEmail,
      individualNote: updateDto.individualNote,
      organizationName: updateDto.organizationName,
      organizationTelephone: updateDto.organizationTelephone,
      organizationEmail: updateDto.organizationEmail,
      organizationNote: updateDto.organizationNote,
      directors: updateDto.directors?.map(director => ({
        directorName: director.directorName || '',
        directorMailingAddress: director.directorMailingAddress || '',
        directorTelephone: director.directorTelephone,
        directorEmail: director.directorEmail,
      })),
    };
  }

  private handleNewPartyCreated(newParty: ResponsiblePartyDto, partyForm: FormGroup) {
    // Update the form with the new UUID (without triggering valueChanges)
    partyForm.get('uuid')?.setValue(newParty.uuid, { emitEvent: false });
    this.responsibleParties.push(newParty);
    this.toastService.showSuccessToast('Responsible party created');
  }

  private subscribeToFieldChanges(partyForm: FormGroup) {
    // Subscribe to party type and FOIPPA category changes to update validators
    partyForm.get('partyType')?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.updateValidators(partyForm);
    });

    partyForm.get('foippaCategory')?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((newCategory) => {
      this.clearFieldsOnCategoryChange(partyForm, newCategory);
    });
  }

  clearFieldsOnCategoryChange(partyForm: FormGroup, newCategory: FOIPPACategory) {
    if (newCategory === FOIPPACategory.INDIVIDUAL) {
      // Switching to Individual - clear organization fields
      partyForm.get('organizationName')?.setValue('', { emitEvent: false });
      partyForm.get('organizationTelephone')?.setValue('', { emitEvent: false });
      partyForm.get('organizationEmail')?.setValue('', { emitEvent: false });
      partyForm.get('organizationNote')?.setValue('', { emitEvent: false });
      partyForm.get('ownerSince')?.setValue(null, { emitEvent: false });

      // Clear directors array for organizations
      const directorsArray = partyForm.get('directors') as FormArray;
      directorsArray.clear();
      
      // Mark the directors field as dirty to ensure it gets saved
      directorsArray.markAsDirty();
    } else if (newCategory === FOIPPACategory.ORGANIZATION) {
      // Switching to Organization - clear individual fields
      partyForm.get('individualName')?.setValue('', { emitEvent: false });
      partyForm.get('individualMailingAddress')?.setValue('', { emitEvent: false });
      partyForm.get('individualTelephone')?.setValue('', { emitEvent: false });
      partyForm.get('individualEmail')?.setValue('', { emitEvent: false });
      partyForm.get('individualNote')?.setValue('', { emitEvent: false });
      partyForm.get('ownerSince')?.setValue(null, { emitEvent: false });
    }
    
    // After clearing fields, update validators with a small delay this seems to prevent race conditions with the form value changes
    setTimeout(() => {
      this.updateValidators(partyForm);
    });
  }

  addParty() {
    const newPartyForm = this.createPartyFormGroup();
    this.form.push(newPartyForm);
  }

  addPartyOfType(partyType: ResponsiblePartyType) {
    const newPartyForm = this.createPartyFormGroup();
    newPartyForm.get('partyType')?.setValue(partyType);
    this.form.push(newPartyForm);
  }

  async deleteParty(index: number) {
    const partyForm = this.form.at(index);
    const partyUuid = partyForm.get('uuid')?.value;

    if (partyUuid) {
      const confirmed = await firstValueFrom(
        this.confirmationDialogService.openDialog({
          body: 'Are you sure you want to delete this Responsible Party?',
        }),
      );

      if (confirmed) {
        try {
          // Set deletion flag to prevent auto-save during deletion
          this.isDeleting = true;
          await this.responsiblePartiesService.delete(partyUuid);
          
          this.form.removeAt(index);
          this.responsibleParties = this.responsibleParties.filter(p => p.uuid !== partyUuid);
          
          // Reset deletion flag to allow normal auto-save functionality
          this.isDeleting = false;
          
          this.toastService.showSuccessToast('Responsible party deleted');
        } catch (error) {
          console.error('Error deleting responsible party', error);
          this.toastService.showErrorToast('Failed to delete responsible party');
          // Reset deletion flag on error as well
          this.isDeleting = false;
        }
      }
    } else {
      // Show confirmation even for unsaved parties
      const confirmed = await firstValueFrom(
        this.confirmationDialogService.openDialog({
          body: 'Are you sure you want to delete this Responsible Party?',
        }),
      );

      if (confirmed) {
        this.form.removeAt(index);
        this.toastService.showSuccessToast('Responsible party deleted');
      }
    }
  }

  addDirector(partyIndex: number) {
    const partyForm = this.form.at(partyIndex);
    const directorsArray = partyForm.get('directors') as FormArray;
    const newDirectorForm = this.createDirectorFormGroup();
    directorsArray.push(newDirectorForm);
    this.toastService.showSuccessToast('Director added');
  }

  async removeDirector(partyIndex: number, directorIndex: number) {

    const partyForm = this.form.at(partyIndex);
    const directorsArray = partyForm.get('directors') as FormArray;

    // Prevent deletion of the last director when there's only one
    if (directorsArray.length <= 1) {
      return; // Simply return without showing any message
    }
    const confirmed = await firstValueFrom(
      this.confirmationDialogService.openDialog({
        body: 'Are you sure you want to delete this Director?',
      }),
    );

    if (confirmed) {
      const partyForm = this.form.at(partyIndex);
      const directorsArray = partyForm.get('directors') as FormArray;
      directorsArray.removeAt(directorIndex);
      this.toastService.showSuccessToast('Director deleted');
    }
  }

  // Party type is selected when adding a party; header is read-only

  onFoippaCategoryChange(partyIndex: number, category: FOIPPACategory) {
    const partyForm = this.form.at(partyIndex);
    partyForm.get('foippaCategory')?.setValue(category);
    this.updateValidators(partyForm);

    // If switching to Organization and no directors exist, add one by default
    if (category === FOIPPACategory.ORGANIZATION) {
      const directorsArray = partyForm.get('directors') as FormArray;
      if (directorsArray.length === 0) {
        directorsArray.push(this.createDirectorFormGroup());
      }
    }
  }

  getDirectorsArray(partyIndex: number): FormArray {
    const partyForm = this.form.at(partyIndex);
    return partyForm.get('directors') as FormArray;
  }

  isPropertyOwner(partyIndex: number): boolean {
    const partyForm = this.form.at(partyIndex);
    return partyForm.get('partyType')?.value === ResponsiblePartyType.PROPERTY_OWNER;
  }

  isIndividual(partyIndex: number): boolean {
    const partyForm = this.form.at(partyIndex);
    return partyForm.get('foippaCategory')?.value === FOIPPACategory.INDIVIDUAL;
  }

  isOrganization(partyIndex: number): boolean {
    const partyForm = this.form.at(partyIndex);
    return partyForm.get('foippaCategory')?.value === FOIPPACategory.ORGANIZATION;
  }

  async clearAllParties() {
    if (!this.fileUuid) return;

    try {
      // Set deletion flag to prevent auto-save during bulk deletion
      this.isDeleting = true;
      
      // Delete all existing parties from the API
      for (const party of this.responsibleParties) {
        if (party.uuid) {
          await this.responsiblePartiesService.delete(party.uuid);
        }
      }

      // Clear the component's data and form
      this.responsibleParties = [];
      this.form.clear();

      // Reset deletion flag to allow normal auto-save functionality
      this.isDeleting = false;

      this.toastService.showSuccessToast('Responsible parties cleared for Crown property');
    } catch (error) {
      console.error('Error clearing responsible parties', error);
      this.toastService.showErrorToast('Failed to clear responsible parties');
      // Reset deletion flag on error as well
      this.isDeleting = false;
    }
  }

  refreshFormForPropertyChange() {
    // This method is called when property ownership changes to ensure proper form state
    this.buildFormArray();
  }

  validateRequiredParties(): boolean {
    // Only require parties for fee simple (non-Crown) properties
    if (this.isPropertyCrown) {
      this.showRequiredError = false;
      return true;
    }

    const hasParties = this.form.length > 0;
    this.showRequiredError = !hasParties;
    return hasParties;
  }

  markAsRequiredError() {
    this.showRequiredError = true;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
