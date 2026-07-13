import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Subject } from 'rxjs';
import { UpdateComplianceAndEnforcementChronologyEntryDto } from '../../../../services/compliance-and-enforcement/chronology/chronology.dto';
import { ComplianceAndEnforcementChronologyService } from '../../../../services/compliance-and-enforcement/chronology/chronology.service';
import {
  ComplianceAndEnforcementDto,
  UpdateComplianceAndEnforcementDto,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import {
  ComplianceAndEnforcementService,
  DEFAULT_C_AND_E_FETCH_OPTIONS,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementDocumentDto } from '../../../../services/compliance-and-enforcement/documents/document.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogStyle } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DOCUMENT_TYPE } from '../../../../shared/document/document.dto';
import { findFileNumberInRouteTree } from '../../../../shared/utils/routing';

@Component({
  selector: 'app-compliance-and-enforcement-chronology',
  templateUrl: './chronology.component.html',
  styleUrls: ['./chronology.component.scss'],
  standalone: false,
})
export class ComplianceAndEnforcementChronologyComponent implements OnInit, OnDestroy {
  fileNumber?: string;

  file?: ComplianceAndEnforcementDto;
  authors: UserDto[] = [];
  sortedEntries = computed(() =>
    Array.from(this.service.entriesByUuid().values()).sort((a, b) => (a.date && b.date ? b.date - a.date : -1)),
  );

  currentUserUuid?: string;

  rankByDocumentTypeCode: Map<DOCUMENT_TYPE, number> = new Map(
    [DOCUMENT_TYPE.C_AND_E_INSPECTION, DOCUMENT_TYPE.C_AND_E_NOTICE, DOCUMENT_TYPE.CORRESPONDENCE].map(
      (type, index) => [type, index],
    ),
  );

  $destroy = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: ComplianceAndEnforcementChronologyService,
    private readonly complianceAndEnforcementService: ComplianceAndEnforcementService,
    private readonly confirmationDialogService: ConfirmationDialogService,
    private readonly userService: UserService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.complianceAndEnforcementService.$file.subscribe((file) => {
      if (!file) {
        return;
      }

      this.file = file;
    });

    this.userService.$userProfile.subscribe((currentUse) => {
      this.currentUserUuid = currentUse?.uuid;
    });

    this.fileNumber = findFileNumberInRouteTree(this.route);

    if (!this.fileNumber) {
      console.error("There was a problem loading the C&E file. Can't find file number.");
      this.toastService.showErrorToast('There was a problem loading the C&E file');
      return;
    }

    this.loadAuthors();
    this.service.loadEntries({ filterByFileNumber: this.fileNumber }).subscribe();
  }

  async loadAuthors() {
    this.authors = await this.userService.getComplianceAndEnforcementOfficers();
  }

  hasDraftEntries(): boolean {
    return Array.from(this.service.entriesByUuid().values()).some((entry) => entry.isDraft);
  }

  async createDraftEntry(): Promise<void> {
    if (!this.file?.uuid) {
      console.error('File UUID is required to create a draft entry.');
      this.toastService.showErrorToast('Failed to create draft entry');
      return;
    }

    const createDto: UpdateComplianceAndEnforcementChronologyEntryDto = {
      isDraft: true,
      authorUuid: this.currentUserUuid,
      fileUuid: this.file?.uuid,
    };

    try {
      await firstValueFrom(this.service.createEntry(createDto));
      this.toastService.showSuccessToast('Draft entry created successfully.');
    } catch (error) {
      console.error('Error creating draft entry:', error);
      this.toastService.showErrorToast('Failed to create draft entry.');
    }

    if (!this.fileNumber) {
      console.warn('File number not found. Chronology not loaded.');
      return;
    }

    this.service.loadEntries({ filterByFileNumber: this.fileNumber }).subscribe();
  }

  datesInUse(excludedUuid: string): number[] {
    return this.sortedEntries()
      .filter((entry) => entry.date !== null && entry.uuid !== excludedUuid)
      .map((entry) => entry.date as number);
  }

  async confirmCloseChronology() {
    this.confirmationDialogService
      .openDialog({
        body: `Remember to first add a final chronology entry that explains why the file is being closed.`,
        style: ConfirmationDialogStyle.WARN,
      })
      .subscribe(async (accepted) => {
        if (!accepted) {
          return;
        }

        this.closeChronology();
      });
  }

  async closeChronology() {
    if (!this.fileNumber) {
      console.error("There was a problem closing the chronology. The C&E file number can't be found");
      this.toastService.showErrorToast('There was a problem closing the chronology');
      return;
    }

    const updateDto: UpdateComplianceAndEnforcementDto = {
      chronologyClosedAt: Date.now(),
      chronologyClosedByUuid: this.currentUserUuid,
    };

    try {
      await firstValueFrom(
        this.complianceAndEnforcementService.update(this.fileNumber, updateDto, { idType: 'fileNumber' }),
      );
      this.toastService.showSuccessToast('Chronology closed successfully');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Unable to close chronology');
    }

    this.complianceAndEnforcementService.loadFile(this.fileNumber, DEFAULT_C_AND_E_FETCH_OPTIONS);
  }

  async confirmReopenChronology() {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to re-open the chronology?`,
      })
      .subscribe(async (accepted) => {
        if (!accepted) {
          return;
        }

        this.reopenChronology();
      });
  }

  async reopenChronology() {
    if (!this.fileNumber) {
      console.error("There was a problem re-opening the chronology. The C&E file number can't be found");
      this.toastService.showErrorToast('There was a problem re-opening the chronology');
      return;
    }

    const updateDto: UpdateComplianceAndEnforcementDto = {
      chronologyClosedAt: null,
      chronologyClosedByUuid: null,
    };

    try {
      await firstValueFrom(
        this.complianceAndEnforcementService.update(this.fileNumber, updateDto, { idType: 'fileNumber' }),
      );
      this.toastService.showSuccessToast('Chronology re-opened successfully');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Unable to re-open chronology');
    }

    this.complianceAndEnforcementService.loadFile(this.fileNumber, DEFAULT_C_AND_E_FETCH_OPTIONS);
  }

  sortDocuments(documents: ComplianceAndEnforcementDocumentDto[]): ComplianceAndEnforcementDocumentDto[] {
    return documents.sort(
      (documentA, documentB) =>
        (this.rankByDocumentTypeCode.get(documentA.type.code) ?? Number.MAX_SAFE_INTEGER) -
          (this.rankByDocumentTypeCode.get(documentB.type.code) ?? Number.MAX_SAFE_INTEGER) ||
        documentA.uploadedAt - documentB.uploadedAt,
    );
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
