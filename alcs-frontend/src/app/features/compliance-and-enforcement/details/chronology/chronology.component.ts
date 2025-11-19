import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { catchError, debounceTime, EMPTY, firstValueFrom, skip, Subject, switchMap, takeUntil } from 'rxjs';
import {
  ComplianceAndEnforcementDocumentService,
  Section,
} from '../../../../services/compliance-and-enforcement/documents/document.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../../services/toast/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from '../../../../services/compliance-and-enforcement/chronology/chronology.dto';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../../shared/document/document.dto';
import { ComplianceAndEnforcementDocumentDto } from '../../../../services/compliance-and-enforcement/documents/document.dto';
import { ComplianceAndEnforcementChronologyService } from '../../../../services/compliance-and-enforcement/chronology/chronology.service';
import {
  DocumentUploadDialogData,
  DocumentUploadDialogOptions,
} from '../../../../shared/document-upload-dialog/document-upload-dialog.interface';
import { DocumentUploadDialogComponent } from '../../../../shared/document-upload-dialog/document-upload-dialog.component';
import { DocumentDto } from '../../../../shared/document-upload-dialog/document-upload-dialog.dto';
import { ComplianceAndEnforcementChronologyEntryComponent } from './entry/entry.component';
import { C_E_AUTOSAVE_DEBOUNCE_MS } from '../../constants';
import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';

@Component({
  selector: 'app-compliance-and-enforcement-chronology',
  templateUrl: './chronology.component.html',
  styleUrls: ['./chronology.component.scss'],
})
export class ComplianceAndEnforcementChronologyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(ComplianceAndEnforcementChronologyEntryComponent)
  entryComponents?: QueryList<ComplianceAndEnforcementChronologyEntryComponent>;

  section: Section = Section.CHRONOLOGY_ENTRY;

  documentOptions: DocumentUploadDialogOptions = {
    allowedVisibilityFlags: [],
    allowsFileEdit: true,
    defaultDocumentSource: DOCUMENT_SOURCE.PUBLIC,
    defaultDocumentType: DOCUMENT_TYPE.CORRESPONDENCE,
  };

  fileNumber?: string;
  fileUuid?: string;

  entries: ComplianceAndEnforcementChronologyEntryDto[] = [];

  $destroy = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: ComplianceAndEnforcementChronologyService,
    private readonly complianceAndEnforcementService: ComplianceAndEnforcementService,
    private readonly documentService: ComplianceAndEnforcementDocumentService,
    private readonly confirmationDialogService: ConfirmationDialogService,
    private readonly toastService: ToastService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.fileNumber = this.findFileNumberInRouteTree(this.route);
    this.loadChronology(this.fileNumber);
  }

  ngAfterViewInit() {
    if (!this.entryComponents) {
      return;
    }

    // List of entries will change as they are added and deleted
    this.entryComponents.changes
      .pipe(takeUntil(this.$destroy))
      .subscribe((entryComponents: QueryList<ComplianceAndEnforcementChronologyEntryComponent>) => {
        entryComponents.forEach((component: ComplianceAndEnforcementChronologyEntryComponent) => {
          component.$changes
            .pipe(
              skip(1), // Skip the initial emission to prevent save on load
              debounceTime(C_E_AUTOSAVE_DEBOUNCE_MS),
              switchMap(([uuid, entry]: [string | undefined, UpdateComplianceAndEnforcementChronologyEntryDto]) => {
                if (!uuid) {
                  return EMPTY;
                }

                return this.service.updateEntry(uuid, entry);
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
        });
      });
  }

  async createDraftEntry(): Promise<void> {
    if (!this.fileUuid) {
      console.error('File UUID is required to create a draft entry.');
      this.toastService.showErrorToast('Failed to create draft entry');
      return;
    }

    const createDto: UpdateComplianceAndEnforcementChronologyEntryDto = {
      isDraft: true,
      fileUuid: this.fileUuid,
    };

    try {
      await firstValueFrom(this.service.createEntry(createDto));
      this.toastService.showSuccessToast('Draft entry created successfully.');
    } catch (error) {
      console.error('Error creating draft entry:', error);
      this.toastService.showErrorToast('Failed to create draft entry.');
    }

    if (!this.fileNumber) {
      console.warn('No file number not found. Chronology not loaded.');
      return;
    }

    this.loadChronology(this.fileNumber);
  }

  hasDraftEntries(): boolean {
    return this.entries.some((entry) => entry.isDraft);
  }

  async setDraft(uuid: string): Promise<void> {
    const updateDto: UpdateComplianceAndEnforcementChronologyEntryDto = { isDraft: true };

    try {
      await firstValueFrom(this.service.updateEntry(uuid, updateDto));
    } catch (error) {
      console.error('Error setting draft entry:', error);
      this.toastService.showErrorToast('Failed to set draft entry.');
    }

    if (!this.fileNumber) {
      console.warn('No file number not found. Chronology not loaded.');
      return;
    }

    this.loadChronology(this.fileNumber);
  }

  async completeDraftEntry({
    uuid,
    updateDto,
  }: {
    uuid: string;
    updateDto: UpdateComplianceAndEnforcementChronologyEntryDto;
  }) {
    updateDto.isDraft = false;

    try {
      await firstValueFrom(this.service.updateEntry(uuid, updateDto));
      this.toastService.showSuccessToast('Entry completed successfully.');
    } catch (error) {
      console.error('Error completing draft entry:', error);
      this.toastService.showErrorToast('Failed to complete draft entry.');
    }

    if (!this.fileNumber) {
      console.warn('No file number not found. Chronology not loaded.');
      return;
    }

    this.loadChronology(this.fileNumber);
  }

  async confirmEntryDelete(uuid: string) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete this chronology entry?`,
      })
      .subscribe(async (accepted) => {
        if (!accepted) {
          return;
        }

        try {
          await this.service.deleteEntry(uuid);
          this.toastService.showSuccessToast('Entry deleted successfully.');
        } catch (error) {
          console.error('Error deleting entry:', error);
          this.toastService.showErrorToast('Failed to delete entry.');
        }

        if (!this.fileNumber) {
          console.warn('No file number not found. Chronology not loaded.');
          return;
        }

        this.loadChronology(this.fileNumber);
      });
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

        this.loadChronology(this.fileNumber);
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

        this.loadChronology(this.fileNumber);
      });
  }

  async loadChronology(fileNumber: string) {
    if (!this.fileUuid) {
      this.fileUuid = await this.complianceAndEnforcementService.uuidByFileNumber(fileNumber);
    }

    this.entries = await firstValueFrom(this.service.entriesByFileId(this.fileUuid, { idType: 'uuid' }));
  }

  findFileNumberInRouteTree(startingRoute: ActivatedRoute): string {
    let route: ActivatedRoute | null = startingRoute;

    while (route) {
      const fileNumber = route.snapshot.paramMap.get('fileNumber');

      if (fileNumber) {
        return fileNumber;
      }

      route = route.parent;
    }

    throw new Error('File number not found in route');
  }

  datesInUse(excludedUuid: string): number[] {
    return this.entries
      .filter((entry) => entry.date !== null && entry.uuid !== excludedUuid)
      .map((entry) => entry.date as number);
  }
  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
