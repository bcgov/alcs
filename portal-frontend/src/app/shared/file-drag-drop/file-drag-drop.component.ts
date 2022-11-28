import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FileHandle } from './drag-drop.directive';

@Component({
  selector: 'app-file-drag-drop',
  templateUrl: './file-drag-drop.component.html',
  styleUrls: ['./file-drag-drop.component.scss'],
})
export class FileDragDropComponent implements OnInit {
  @Output() files: EventEmitter<FileHandle[]> = new EventEmitter();

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {}

  filesDropped($event: FileHandle[]) {
    this.files.emit($event);
  }

  fileSelected($event: Event) {
    const target = $event.target as HTMLInputElement;
    const selectedFiles = target.files as FileList;
    let files: FileHandle[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      files.push({ file, url });
    }
    if (files.length > 0) {
      this.files.emit(files);
    }
  }
}
