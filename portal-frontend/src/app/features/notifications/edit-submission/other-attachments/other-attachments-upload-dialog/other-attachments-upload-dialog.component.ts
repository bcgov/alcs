import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Inject, type OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { NotificationDocumentDto, NotificationDocumentUpdateDto } from "../../../../../services/notification-document/notification-document.dto";
import { DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from "../../../../../shared/dto/document.dto";
import { FileHandle } from "../../../../../shared/file-drag-drop/drag-drop.directive";
import { OtherAttachmentsComponent } from "../other-attachments.component";
import { NotificationDocumentService } from "../../../../../services/notification-document/notification-document.service";
import { CodeService } from "../../../../../services/code/code.service";
import { ToastService } from "../../../../../services/toast/toast.service";

const USER_CONTROLLED_TYPES = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

@Component({
    selector: 'app-other-attachments-upload-dialog',

    templateUrl: './other-attachments-upload-dialog.component.html',
    styleUrl: './other-attachments-upload-dialog.component.scss',
})
export class OtherAttachmentsUploadDialogComponent implements OnInit {
    isDirty = false;
    isFileDirty = false;
    isSaving = false;
    showVirusError = false;
    title: string = '';
    isEditing = false;

    attachment: NotificationDocumentDto[] = [];
    attachmentForDelete: NotificationDocumentDto[] = [];
    pendingFile: FileHandle | undefined;
    selectableTypes: DocumentTypeDto[] = [];
    private documentCodes: DocumentTypeDto[] = [];

    fileDescription = new FormControl<string | null>(null, [Validators.required]);
    fileType = new FormControl<string | null>(null, [Validators.required]);
    currentDescription: string | null = null;
    currentType: DocumentTypeDto | null = null;

    form = new FormGroup({
        fileDescription: this.fileDescription,
        fileType: this.fileType,
    });

    constructor(
        private dialogRef: MatDialogRef<OtherAttachmentsUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) 
        public data: {
            otherAttachmentsComponent: OtherAttachmentsComponent, 
            existingDocument?: NotificationDocumentDto,
            fileId: string,
        },
        private notificationDocumentService: NotificationDocumentService,
        private codeService: CodeService,
        private toastService: ToastService
    ) {}

    ngOnInit(): void {
        this.loadDocumentCodes();
        if (this.data.existingDocument) {
            this.title = 'Edit';
            this.isEditing = true;
            this.fileType.setValue(this.data.existingDocument.type!.code);
            this.fileDescription.setValue(this.data.existingDocument.description!);
            this.currentDescription = this.data.existingDocument.description!;
            this.currentType = this.data.existingDocument.type;
            this.attachment = [this.data.existingDocument];
        } else {
            this.title = 'Add';
        }
    }

    async attachDocument(file: FileHandle) {
        this.pendingFile = file;
        this.attachment = [{uuid: '', 
            fileName: file.file.name, 
            type: null, 
            fileSize: file.file.size, 
            uploadedBy: '',
            uploadedAt: file.file.lastModified,
            source: DOCUMENT_SOURCE.APPLICANT,
            surveyPlanNumber: null,
            controlNumber: null,
        }];
        this.isFileDirty = true;
    }

    openFile() {
        if (this.isEditing && this.pendingFile === undefined) {
            this.data.otherAttachmentsComponent.openFile(this.attachment[0]);
        } else {
            if (this.pendingFile) {
                const fileURL = URL.createObjectURL(this.pendingFile.file);
                window.open(fileURL, '_blank');
            }
        }
    }

    deleteFile() {
        this.pendingFile = undefined;
        if (this.isEditing) {
            this.attachmentForDelete = this.attachment;
        }
        this.attachment = [];
    }

    onChangeDescription() {
        this.isDirty = true;
        this.currentDescription = this.fileDescription.value;
    }

    onChangeType(selectedValue: DOCUMENT_TYPE) {
        this.isDirty = true;
        const newType = this.documentCodes.find((code) => code.code === selectedValue);
        this.currentType = newType !== undefined ? newType : null;
    }

    async onAdd() {
        if (this.isFileDirty) {
            this.isSaving = true;
            const res = await this.data.otherAttachmentsComponent.attachFile(this.pendingFile!, null);
            this.showVirusError = !res;
            if (res) {
                const documents = await this.notificationDocumentService.getByFileId(this.data.fileId);
                if (documents) {
                    const sortedDocuments = documents.sort((a, b) => {return b.uploadedAt - a.uploadedAt});
                    const updateDtos: NotificationDocumentUpdateDto[] = sortedDocuments.map((file) => ({
                        uuid: file.uuid,
                        description: file.description,
                        type: file.type?.code ?? null,
                    }));
                    updateDtos[0] = {
                        ...updateDtos[0],
                        description: this.currentDescription,
                        type: this.currentType?.code ?? null,
                    }
                    await this.notificationDocumentService.update(this.data.fileId, updateDtos);
                    this.toastService.showSuccessToast('Attachment added successfully');
                    this.dialogRef.close();
                } else {
                    this.toastService.showErrorToast("Could not read attached documents");
                }
            }
            this.isDirty = false;
            this.isFileDirty = true;
            this.isSaving = false;
        }
    }

    async onEdit() {
        if (this.isFileDirty) {
            this.data.otherAttachmentsComponent.onDeleteFile(this.attachmentForDelete[0]);
            await this.onAdd();
        } else {
            if (this.isDirty) {
                const documents = await this.notificationDocumentService.getByFileId(this.data.fileId);
                if (documents) {
                    const updateDtos: NotificationDocumentUpdateDto[] = documents.map((file) => ({
                        uuid: file.uuid,
                        description: file.description,
                        type: file.type?.code ?? null,
                    }));
                    for (let i = 0; i < updateDtos.length; i++) {
                        if (updateDtos[i].uuid === this.data.existingDocument?.uuid) {
                            updateDtos[i] = {
                                ...updateDtos[i],
                                description: this.currentDescription,
                                type: this.currentType?.code ?? null,
                            }
                        }
                    }
                    await this.notificationDocumentService.update(this.data.fileId, updateDtos);
                    this.toastService.showSuccessToast('Attachment updated successully');
                    this.dialogRef.close();
                } else {
                    this.toastService.showErrorToast("Could not read attached documents");
                }
            }
        }
    }

    private async loadDocumentCodes() {
        const codes = await this.codeService.loadCodes();
        this.documentCodes = codes.documentTypes;
        this.selectableTypes = this.documentCodes.filter((code) => USER_CONTROLLED_TYPES.includes(code.code));
    }
}
