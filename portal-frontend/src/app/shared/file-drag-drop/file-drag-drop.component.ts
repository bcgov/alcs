import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicationDocumentDto } from '../../services/application-document/application-document.dto';
import { FileHandle } from './drag-drop.directive';

@Component({
  selector: 'app-file-drag-drop',
  templateUrl: './file-drag-drop.component.html',
  styleUrls: ['./file-drag-drop.component.scss'],
})
export class FileDragDropComponent implements OnInit {
  @Output() uploadFiles: EventEmitter<FileHandle> = new EventEmitter();
  @Output() deleteFile: EventEmitter<ApplicationDocumentDto> = new EventEmitter();
  @Output() openFile: EventEmitter<ApplicationDocumentDto> = new EventEmitter();
  @Output() beforeFileUploadOpened: EventEmitter<void> = new EventEmitter();

  @Input() allowMultiple = false;
  @Input() disabled = false;
  @Input() uploadedFiles: (ApplicationDocumentDto & { errorMessage?: string })[] = [];
  @Input() isRequired = false;
  @Input() showErrors = false;
  @Input() showHasVirusError = false;
  @Input() showVirusScanFailedError = false;

  private uploadClicked = false;

  @ViewChild('fileUpload') fileUpload!: ElementRef<HTMLInputElement>;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {}

  @HostListener('window:focus')
  onFocus() {
    if (this.uploadClicked) {
      this.showErrors = true;
    }
  }

  _deleteFile(file: ApplicationDocumentDto) {
    this.showErrors = true;
    this.deleteFile.emit(file);
  }

  filesDropped($event: FileHandle) {
    this.showErrors = true;
    this.uploadFiles.emit($event);
  }

  fileOpened(file: ApplicationDocumentDto) {
    this.openFile.emit(file);
  }

  onFileUploadClicked() {
    this.uploadClicked = true;
    this.beforeFileUploadOpened.emit();
    this.fileUpload.nativeElement.click();
  }

  fileSelected($event: Event) {
    this.showErrors = true;
    const target = $event.target as HTMLInputElement;
    const selectedFiles = target.files as FileList;
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      this.uploadFiles.emit({ file, url });
      this.fileUpload.nativeElement.value = '';
    }
  }
}
