import { Directive, HostBinding, HostListener, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface FileHandle {
  file: File;
  url: SafeUrl;
}

@Directive({
  selector: '[dragDropFile]',
})
export class DragDropDirective {
  private backgroundColor = '#f7f7f7';

  @Output() files: EventEmitter<FileHandle> = new EventEmitter();
  @HostBinding('style.background') private background = this.backgroundColor;

  constructor(private sanitizer: DomSanitizer) {}

  @HostListener('dragover', ['$event'])
  public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#aaaaaa';
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = this.backgroundColor;
  }

  @HostListener('drop', ['$event'])
  public onDrop(dragEvent: DragEvent) {
    dragEvent.preventDefault();
    dragEvent.stopPropagation();
    this.background = this.backgroundColor;

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
