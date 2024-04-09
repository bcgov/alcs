import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface FileHandle {
  file: File;
  url: SafeUrl;
}

@Directive({
  selector: '[appDragDropFile]',
})
export class DragDropDirective {
  private backgroundColor = '#fff';
  private borderStyle = '0.15rem dashed #56565650';

  @Input() disabled = false;
  @Output() files: EventEmitter<FileHandle> = new EventEmitter();

  @HostBinding('style.background') private background = this.backgroundColor;
  @HostBinding('style.border') private border = this.borderStyle;

  constructor(private sanitizer: DomSanitizer) {}

  @HostListener('dragover', ['$event'])
  public onDragOver(evt: DragEvent): void {
    if (!this.disabled) {
      evt.preventDefault();
      evt.stopPropagation();
      this.background = '#acd2ed30';
      this.border = '0.15rem solid #0c2e4650 !important';
    }
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = this.backgroundColor;
    this.border = this.borderStyle;
  }

  @HostListener('drop', ['$event'])
  public onDrop(dragEvent: DragEvent): void {
    if (!this.disabled) {
      dragEvent.preventDefault();
      dragEvent.stopPropagation();
      this.background = this.backgroundColor;
      this.border = this.borderStyle;

      if (!dragEvent.dataTransfer) {
        return;
      }

      for (let i = 0; i < dragEvent.dataTransfer.files.length; i++) {
        const file = dragEvent.dataTransfer.files[i];
        const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
        this.files.emit({ file, url });
      }
    }
  }
}
