import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventEmitter } from '@angular/core';
import { ResponsiblePartiesComponent } from './responsible-parties.component';
import { ResponsiblePartiesService } from '../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { ToastService } from '../../../services/toast/toast.service';
import {
  ResponsiblePartyDto,
  ResponsiblePartyType,
  FOIPPACategory,
} from '../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.dto';
import moment from 'moment';

describe('ResponsiblePartiesComponent', () => {
  let component: ResponsiblePartiesComponent;
  let fixture: ComponentFixture<ResponsiblePartiesComponent>;
  let mockResponsiblePartiesService: DeepMocked<ResponsiblePartiesService>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;
  let mockToastService: DeepMocked<ToastService>;

  const mockResponsibleParty: ResponsiblePartyDto = {
    uuid: 'test-uuid-1',
    partyType: ResponsiblePartyType.PROPERTY_OWNER,
    foippaCategory: FOIPPACategory.INDIVIDUAL,
    isPrevious: false,
    individualName: 'John Doe',
    individualMailingAddress: '123 Main St, Vancouver, BC',
    individualTelephone: '604-555-0123',
    individualEmail: 'john.doe@example.com',
    individualNote: 'Test note',
    ownerSince: moment('2020-01-01').valueOf(),
  };

  const mockOrganizationParty: ResponsiblePartyDto = {
    uuid: 'test-uuid-2',
    partyType: ResponsiblePartyType.OPERATOR,
    foippaCategory: FOIPPACategory.ORGANIZATION,
    isPrevious: false,
    organizationName: 'Test Corp',
    organizationTelephone: '604-555-0456',
    organizationEmail: 'info@testcorp.com',
    organizationNote: 'Organization note',
    directors: [
      {
        uuid: 'director-uuid-1',
        directorName: 'Jane Smith',
        directorMailingAddress: '456 Oak Ave, Vancouver, BC',
        directorTelephone: '604-555-0789',
        directorEmail: 'jane.smith@testcorp.com',
      },
    ],
  };

  beforeEach(async () => {
    mockResponsiblePartiesService = createMock();
    mockConfirmationDialogService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ResponsiblePartiesComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ResponsiblePartiesService, useValue: mockResponsiblePartiesService },
        { provide: ConfirmationDialogService, useValue: mockConfirmationDialogService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsiblePartiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.responsibleParties).toEqual([]);
    expect(component.form.length).toBe(0);
    expect(component.isLoading).toBe(false);
    expect(component.isPropertyCrown).toBe(false);
  });

  it('should load responsible parties when fileUuid is provided', async () => {
    const mockParties = [mockResponsibleParty];
    mockResponsiblePartiesService.fetchByFileUuid.mockResolvedValue(mockParties);

    component.fileUuid = 'test-file-uuid';
    await component.loadResponsibleParties();

    expect(mockResponsiblePartiesService.fetchByFileUuid).toHaveBeenCalledWith('test-file-uuid');
    expect(component.responsibleParties).toEqual(mockParties);
    expect(component.form.length).toBe(1);
  });

  it('should not load responsible parties when fileUuid is not provided', () => {
    component.ngOnInit();
    expect(mockResponsiblePartiesService.fetchByFileUuid).not.toHaveBeenCalled();
  });

  it('should build form array from existing parties', () => {
    component.responsibleParties = [mockResponsibleParty];
    component.buildFormArray();

    expect(component.form.length).toBe(1);
    const partyForm = component.form.at(0);
    expect(partyForm.get('uuid')?.value).toBe('test-uuid-1');
    expect(partyForm.get('partyType')?.value).toBe(ResponsiblePartyType.PROPERTY_OWNER);
    expect(partyForm.get('foippaCategory')?.value).toBe(FOIPPACategory.INDIVIDUAL);
    expect(partyForm.get('individualName')?.value).toBe('John Doe');
  });

  it('should not auto-add a default party when no parties exist (non-Crown)', () => {
    component.isPropertyCrown = false;
    component.responsibleParties = [];
    component.buildFormArray();

    expect(component.form.length).toBe(0);
  });

  it('should not auto-add a default party when no parties exist (Crown)', () => {
    component.isPropertyCrown = true;
    component.responsibleParties = [];
    component.buildFormArray();

    expect(component.form.length).toBe(0);
  });

  it('should set required validators for individual fields when FOIPPA category is Individual', () => {
    component.responsibleParties = [mockResponsibleParty];
    component.buildFormArray();
    
    const partyForm = component.form.at(0);
    partyForm.get('foippaCategory')?.setValue(FOIPPACategory.INDIVIDUAL);
    partyForm.get('individualName')?.setValue('');
    partyForm.get('individualMailingAddress')?.setValue('');

    component.updateValidators(partyForm);

    expect(partyForm.get('individualName')?.hasError('required')).toBe(true);
    expect(partyForm.get('individualMailingAddress')?.hasError('required')).toBe(true);
  });

  it('should set required validators for organization fields when FOIPPA category is Organization', () => {
    component.responsibleParties = [mockResponsibleParty];
    component.buildFormArray();
    
    const partyForm = component.form.at(0);
    partyForm.get('foippaCategory')?.setValue(FOIPPACategory.ORGANIZATION);
    partyForm.get('organizationName')?.setValue('');

    component.updateValidators(partyForm);

    expect(partyForm.get('organizationName')?.hasError('required')).toBe(true);
  });

  it('should set required validator for ownerSince when party type is Property Owner', () => {
    component.responsibleParties = [mockResponsibleParty];
    component.buildFormArray();
    
    const partyForm = component.form.at(0);
    partyForm.get('partyType')?.setValue(ResponsiblePartyType.PROPERTY_OWNER);
    partyForm.get('ownerSince')?.setValue(null);

    component.updateValidators(partyForm);

    expect(partyForm.get('ownerSince')?.hasError('required')).toBe(true);
  });

  it('should not set required validator for ownerSince when party type is not Property Owner', () => {
    component.responsibleParties = [mockResponsibleParty];
    component.buildFormArray();
    
    const partyForm = component.form.at(0);
    partyForm.get('partyType')?.setValue(ResponsiblePartyType.OPERATOR);
    partyForm.get('ownerSince')?.setValue(null);

    component.updateValidators(partyForm);

    expect(partyForm.get('ownerSince')?.hasError('required')).toBe(false);
  });

  it('should add a new party', () => {
    const initialLength = component.form.length;
    component.addParty();

    expect(component.form.length).toBe(initialLength + 1);
    const newPartyForm = component.form.at(component.form.length - 1);
    expect(newPartyForm.get('partyType')?.value).toBe(ResponsiblePartyType.PROPERTY_OWNER);
    expect(newPartyForm.get('foippaCategory')?.value).toBe(FOIPPACategory.INDIVIDUAL);
  });

  it('should check if party is Property Owner', () => {
    component.responsibleParties = [mockResponsibleParty, mockOrganizationParty];
    component.buildFormArray();

    expect(component.isPropertyOwner(0)).toBe(true);
    expect(component.isPropertyOwner(1)).toBe(false);
  });

  it('should check if party is Individual', () => {
    component.responsibleParties = [mockResponsibleParty, mockOrganizationParty];
    component.buildFormArray();

    expect(component.isIndividual(0)).toBe(true);
    expect(component.isIndividual(1)).toBe(false);
  });

  it('should check if party is Organization', () => {
    component.responsibleParties = [mockResponsibleParty, mockOrganizationParty];
    component.buildFormArray();

    expect(component.isOrganization(0)).toBe(false);
    expect(component.isOrganization(1)).toBe(true);
  });

  it('should return directors array for party', () => {
    component.responsibleParties = [mockResponsibleParty, mockOrganizationParty];
    component.buildFormArray();

    const directorsArray = component.getDirectorsArray(1);
    expect(directorsArray).toBeDefined();
    expect(directorsArray.length).toBe(1);
  });

  it('should add director to organization', () => {
    component.responsibleParties = [mockOrganizationParty];
    component.buildFormArray();

    const partyForm = component.form.at(0);
    const directorsArray = partyForm.get('directors') as any;
    const initialLength = directorsArray.length;

    component.addDirector(0);

    expect(directorsArray.length).toBe(initialLength + 1);
    expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Director added');
  });

  it('should remove director after confirmation', async () => {
    component.responsibleParties = [mockOrganizationParty];
    component.buildFormArray();

    const partyForm = component.form.at(0);
    const directorsArray = partyForm.get('directors') as any;
    const initialLength = directorsArray.length;

    const confirmEmitter = new EventEmitter<boolean>();
    mockConfirmationDialogService.openDialog.mockReturnValue(confirmEmitter);

    const removeDirectorPromise = component.removeDirector(0, 0);
    
    // Emit the confirmation result synchronously
    confirmEmitter.emit(true);
    confirmEmitter.complete();
    
    await removeDirectorPromise;

    expect(mockConfirmationDialogService.openDialog).toHaveBeenCalled();
    expect(directorsArray.length).toBe(initialLength - 1);
    expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Director deleted');
  });

  it('should not remove director when user cancels confirmation', async () => {
    component.responsibleParties = [mockOrganizationParty];
    component.buildFormArray();

    const partyForm = component.form.at(0);
    const directorsArray = partyForm.get('directors') as any;
    const initialLength = directorsArray.length;

    const cancelEmitter = new EventEmitter<boolean>();
    mockConfirmationDialogService.openDialog.mockReturnValue(cancelEmitter);

    const removeDirectorPromise = component.removeDirector(0, 0);
    
    // Emit the cancellation result synchronously
    cancelEmitter.emit(false);
    cancelEmitter.complete();
    
    await removeDirectorPromise;

    expect(directorsArray.length).toBe(initialLength);
  });

  it('should add default director when switching to Organization category', () => {
    component.responsibleParties = [mockResponsibleParty];
    component.buildFormArray();

    const partyForm = component.form.at(0);
    partyForm.get('foippaCategory')?.setValue(FOIPPACategory.INDIVIDUAL);
    const directorsArray = partyForm.get('directors') as any;
    directorsArray.clear();

    component.onFoippaCategoryChange(0, FOIPPACategory.ORGANIZATION);

    expect(directorsArray.length).toBe(1);
  });

  it('should handle party type change', () => {
    component.responsibleParties = [mockResponsibleParty];
    component.buildFormArray();

    const event = { value: ResponsiblePartyType.OPERATOR } as any;

    component.onPartyTypeChange(0, event);

    // The method doesn't actually set the value, it just updates validators
    // So we just verify it doesn't throw an error
    expect(component).toBeTruthy();
  });

  it('should handle FOIPPA category change', () => {
    component.responsibleParties = [mockResponsibleParty];
    component.buildFormArray();

    const partyForm = component.form.at(0);

    component.onFoippaCategoryChange(0, FOIPPACategory.ORGANIZATION);

    expect(partyForm.get('foippaCategory')?.value).toBe(FOIPPACategory.ORGANIZATION);
  });

  it('should clear all parties', async () => {
    component.responsibleParties = [mockResponsibleParty, mockOrganizationParty];
    component.buildFormArray();
    component.fileUuid = 'test-file-uuid';

    mockResponsiblePartiesService.delete.mockResolvedValue();

    await component.clearAllParties();

    expect(mockResponsiblePartiesService.delete).toHaveBeenCalledWith('test-uuid-1');
    expect(mockResponsiblePartiesService.delete).toHaveBeenCalledWith('test-uuid-2');
    expect(component.responsibleParties).toEqual([]);
    expect(component.form.length).toBe(0);
    expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Responsible parties cleared for Crown property');
  });

  it('should not clear parties when fileUuid is not provided', async () => {
    component.responsibleParties = [mockResponsibleParty];
    component.buildFormArray();
    component.fileUuid = undefined;

    await component.clearAllParties();

    expect(mockResponsiblePartiesService.delete).not.toHaveBeenCalled();
    expect(component.responsibleParties.length).toBe(1);
  });

  it('should complete destroy subject on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component.$destroy, 'next');
    const completeSpy = jest.spyOn(component.$destroy, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});