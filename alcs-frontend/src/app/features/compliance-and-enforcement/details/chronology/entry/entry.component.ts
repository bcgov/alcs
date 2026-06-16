import { Component, computed, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { catchError, debounceTime, EMPTY, firstValueFrom, Subject, switchMap, takeUntil } from 'rxjs';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from '../../../../../services/compliance-and-enforcement/chronology/chronology.dto';
import { ComplianceAndEnforcementChronologyService } from '../../../../../services/compliance-and-enforcement/chronology/chronology.service';
import { ComplianceAndEnforcementChronologyInspectionService } from '../../../../../services/compliance-and-enforcement/chronology/inspection/inspection.service';
import { ComplianceAndEnforcementDocumentDto } from '../../../../../services/compliance-and-enforcement/documents/document.dto';
import {
  ComplianceAndEnforcementDocumentService,
  Section,
} from '../../../../../services/compliance-and-enforcement/documents/document.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { UserDto } from '../../../../../services/user/user.dto';
import { UserService } from '../../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DocumentUploadDialogComponent } from '../../../../../shared/document-upload-dialog/document-upload-dialog.component';
import { DocumentDto } from '../../../../../shared/document-upload-dialog/document-upload-dialog.dto';
import {
  DocumentUploadDialogData,
  DocumentUploadDialogOptions,
} from '../../../../../shared/document-upload-dialog/document-upload-dialog.interface';
import { DOCUMENT_TYPE } from '../../../../../shared/document/document.dto';
import { C_E_AUTOSAVE_DEBOUNCE_MS } from '../../../constants';

@Component({
  selector: 'app-compliance-and-enforcement-chronology-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  standalone: false,
})
export class ComplianceAndEnforcementChronologyEntryComponent implements OnInit, OnDestroy {
  @Input() fileNumber?: string;
  _entry?: ComplianceAndEnforcementChronologyEntryDto;
  @Input() set entry(entry: ComplianceAndEnforcementChronologyEntryDto) {
    this.fillForm(entry);

    this._entry = entry;
  }
  get entry(): ComplianceAndEnforcementChronologyEntryDto | undefined {
    return this._entry;
  }
  @Input() authors?: UserDto[];
  @Input() datesInUse?: number[];
  @Input() editDisabled = false;

  @Output() addCorrespondence: EventEmitter<string> = new EventEmitter<string>();

  sortedInspections = computed(() =>
    Array.from(this.inspectionService.inspectionsByUuid().values())
      .filter((inspection) => inspection.entryUuid === this.entry?.uuid)
      .sort((a, b) => (a.date && b.date ? a.createdAt - b.createdAt : -1)),
  );

  section: Section = Section.CHRONOLOGY_ENTRY;

  documentOptions: DocumentUploadDialogOptions = {
    allowedVisibilityFlags: [],
    allowsFileEdit: true,
    defaultDocumentType: DOCUMENT_TYPE.CORRESPONDENCE,
  };

  currentUserUuid?: string;
  showErrors = false;

  date: FormControl<moment.Moment | null> = new FormControl<moment.Moment | null>(null, [
    Validators.required,
    this.dateInUseValidator.bind(this),
  ]);
  authorDropdown = new FormControl<string | null>(null, [Validators.required]);
  description: FormControl<string | null> = new FormControl<string | null>(null, [Validators.required]);
  form: FormGroup = new FormGroup({
    date: this.date,
    authorUuid: this.authorDropdown,
    description: this.description,
  });

  $destroy = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly chronologyService: ComplianceAndEnforcementChronologyService,
    private readonly documentService: ComplianceAndEnforcementDocumentService,
    private readonly inspectionService: ComplianceAndEnforcementChronologyInspectionService,
    private readonly userService: UserService,
    private readonly toastService: ToastService,
    private readonly confirmationDialogService: ConfirmationDialogService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.userService.$userProfile.subscribe((currentUse) => {
      this.currentUserUuid = currentUse?.uuid;
    });

    this.form.valueChanges
      .pipe(
        debounceTime(C_E_AUTOSAVE_DEBOUNCE_MS),
        switchMap((formData: typeof this.form.value) => {
          if (!this.entry?.uuid) {
            return EMPTY;
          }

          return this.chronologyService.updateEntry(this.entry.uuid, this.dtoFromForm(formData));
        }),
        catchError((error) => {
          console.error('Error saving draft chronology entry', error);
          this.toastService.showErrorToast('Failed to save draft chronology entry');
          return EMPTY;
        }),
        takeUntil(this.$destroy),
      )
      .subscribe(() => {
        this.toastService.showSuccessToast('Draft chronology entry saved');
      });

    if (!this.entry) {
      return;
    }

    this.inspectionService.loadInspections({ filterByEntryUuid: this.entry.uuid }).subscribe();
  }

  fillForm(entry: ComplianceAndEnforcementChronologyEntryDto): void {
    this.form.patchValue(
      {
        date: entry.date !== undefined && entry.date !== null ? moment(entry.date) : null,
        authorUuid: entry.author.uuid,
        description: entry.description,
      },
      { emitEvent: false },
    );
  }

  dtoFromForm(formData: typeof this.form.value): UpdateComplianceAndEnforcementChronologyEntryDto {
    if (!this.entry) {
      throw new Error('No entry set');
    }

    const dto: UpdateComplianceAndEnforcementChronologyEntryDto = {};

    if (formData.date) {
      dto.date = formData.date.toDate().getTime();
    }

    if (formData.authorUuid) {
      dto.authorUuid = formData.authorUuid;
    }

    if (formData.description) {
      dto.description = formData.description;
    }

    return dto;
  }

  dateInUseValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.datesInUse) {
      return null;
    }

    return !control.value || !this.datesInUse?.includes(control.value.toDate().getTime()) ? null : { dateInUse: true };
  }

  async onCompleteButtonClick(): Promise<void> {
    if (this.form.invalid || this.hasDraftInspections()) {
      this.date.markAsTouched();
      this.description.markAsTouched();
      this.showErrors = true;
      return;
    }
    this.showErrors = false;

    await this.save(false);
  }

  hasDraftInspections(): boolean {
    return this.sortedInspections().some((inspection) => inspection.isDraft);
  }

  async onAddInspectionClick(): Promise<void> {
    if (!this.entry || !this.entry?.uuid) {
      console.error('Must have a chronology entry with valid UUID');
      this.toastService.showErrorToast("Can't find chronology entry");
      return;
    }

    if (!this.currentUserUuid) {
      console.error('Current user not loaded. Wait and try again.');
      this.toastService.showErrorToast('Current user not loaded. Wait and try again.');
      return;
    }

    await this.save();

    try {
      const inspectionUuid = await this.inspectionService.createDraft(this.currentUserUuid, this.entry.uuid);
      this.toastService.showSuccessToast('Draft inspection created');
      this.router.navigate(['entry', this.entry.uuid, 'inspection', inspectionUuid, 'edit'], {
        relativeTo: this.route,
      });
    } catch (error) {
      console.error("Couldn't create draft inspection", error);
      this.toastService.showErrorToast("Couldn't create draft inspection");
    }
  }

  async onEditInspectionClick(inspectionUuid: string) {
    if (!this.entry || !this.entry?.uuid) {
      console.error('Must have a chronology entry with valid UUID');
      this.toastService.showErrorToast("Can't find chronology entry");
      return;
    }

    await this.save();

    await this.router.navigate(['entry', this.entry.uuid, 'inspection', inspectionUuid, 'edit'], {
      relativeTo: this.route,
    });
  }

  async confirmInspectionDelete(inspectionUuid: string) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete the inspection and associated report?`,
      })
      .subscribe(async (accepted) => {
        if (!accepted) {
          return;
        }

        try {
          await firstValueFrom(this.inspectionService.delete(inspectionUuid));
          this.toastService.showSuccessToast('Inspection deleted successfully.');
        } catch (error) {
          console.error('Error deleting inspection:', error);
          this.toastService.showErrorToast('Failed to delete inspection.');
        }

        if (!this.entry) {
          console.error("Couldn't refresh entry. No entry found.");
          this.toastService.showErrorToast("Couldn't refresh entry");
          return;
        }

        this.chronologyService.loadEntries({ filterByUuid: this.entry.uuid }).subscribe();
        this.inspectionService.loadInspections({ filterByEntryUuid: this.entry.uuid }).subscribe();
      });
  }

  async setDraft(uuid: string): Promise<void> {
    const updateDto: UpdateComplianceAndEnforcementChronologyEntryDto = { isDraft: true };

    try {
      await firstValueFrom(this.chronologyService.updateEntry(uuid, updateDto));
    } catch (error) {
      console.error('Error setting draft entry:', error);
      this.toastService.showErrorToast('Failed to set draft entry.');
    }

    if (!this.entry) {
      return;
    }

    this.chronologyService.loadEntries({ filterByUuid: this.entry.uuid }).subscribe();
  }

  confirmEntryDelete(uuid?: string): void {
    if (!uuid) {
      console.error('No entry UUID provided for deletion');
      this.toastService.showErrorToast('Failed to delete entry');
      return;
    }

    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete this chronology entry?`,
      })
      .subscribe(async (accepted) => {
        if (!accepted) {
          return;
        }

        try {
          await firstValueFrom(this.chronologyService.deleteEntry(uuid));
          this.toastService.showSuccessToast('Entry deleted successfully.');
        } catch (error) {
          console.error('Error deleting entry:', error);
          this.toastService.showErrorToast('Failed to delete entry.');
        }

        if (!this.fileNumber) {
          return;
        }

        this.chronologyService.loadEntries({ filterByFileNumber: this.fileNumber }).subscribe();
      });
  }

  async save(isDraft: boolean = true) {
    if (!this.entry || !this.entry?.uuid) {
      console.error('Must have a chronology entry with valid UUID');
      this.toastService.showErrorToast("Can't find chronology entry");
      return;
    }

    const saveSuccessMessage = isDraft
      ? 'Draft chronology entry saved successfully'
      : 'Chronology entry completed successfully';
    const saveErrorMessage = isDraft ? 'Failed to save draft chronology entry' : 'Failed to complete chronology entry';

    const updateDto = this.dtoFromForm(this.form.value);
    updateDto.isDraft = isDraft;

    try {
      await firstValueFrom(this.chronologyService.updateEntry(this.entry.uuid, updateDto));
      this.toastService.showSuccessToast(saveSuccessMessage);
    } catch (error) {
      console.error('Error updating chronology entry:', error);
      this.toastService.showErrorToast(saveErrorMessage);
    }

    if (!this.entry) {
      return;
    }

    this.chronologyService.loadEntries({ filterByUuid: this.entry.uuid }).subscribe();
  }

  openAddCorrespondenceDialog(entryUuid: string): void {
    this.openDocumentDialog({
      chronologyEntryUuid: entryUuid,
    });
  }

  openEditDocumentDialog(document: ComplianceAndEnforcementDocumentDto) {
    this.openDocumentDialog({}, document);
  }

  openDocumentDialog(optionOverrides?: DocumentUploadDialogOptions, document?: DocumentDto) {
    if (!this.fileNumber) {
      console.error('File number is required to open the upload dialog.');
      return;
    }

    const data: DocumentUploadDialogData = {
      ...this.documentOptions,
      ...{
        documentService: this.documentService,
        fileId: this.fileNumber,
        section: this.section,
        existingDocument: document,
      },
      ...optionOverrides,
    };

    this.dialog
      .open(DocumentUploadDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data,
      })
      .afterClosed()
      .subscribe((saved) => {
        if (!saved) {
          return;
        }

        if (!this.fileNumber) {
          console.warn('No file number not found. Chronology not loaded.');
          return;
        }

        this.chronologyService.loadEntries({ filterByFileNumber: this.fileNumber }).subscribe();
      });
  }

  confirmDocumentDelete(document: ComplianceAndEnforcementDocumentDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${document.fileName}?`,
      })
      .subscribe(async (accepted) => {
        if (!accepted) {
          return;
        }

        try {
          await this.documentService.delete(document.uuid);
          this.toastService.showSuccessToast('Document deleted');
        } catch (error) {
          console.error('Error deleting document:', error);
          this.toastService.showErrorToast('Failed to delete document.');
        }

        if (!this.fileNumber) {
          console.warn('No file number not found. Chronology not loaded.');
          return;
        }

        this.chronologyService.loadEntries({ filterByFileNumber: this.fileNumber }).subscribe();
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
