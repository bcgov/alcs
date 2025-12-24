import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../services/common/document/document.service';

@Component({
    selector: 'document-file-loader',
    templateUrl: './document-file-loader.component.html',
    styleUrl: './document-file-loader.component.scss',
    standalone: false
})
export class DocumentFileLoader {
  uuid: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
  }

  ngAfterViewInit() {
    if (this.uuid !== null) {
      this.open(this.uuid);
    }
  }

  async open(uuid: string) {
    const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid);
    const object = window.document.createElement('object');

    object.data = url;

    object.style.borderWidth = '0';
    object.style.width = '100%';
    object.style.height = '100%';

    window.document.documentElement.replaceChild(object, document.body);
    window.document.title = fileName;
  }
}
