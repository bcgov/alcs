import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../services/document/document.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'document-file-loader',
  templateUrl: './document-file-loader.component.html',
  styleUrl: './document-file-loader.component.scss',
})
export class DocumentFileLoader implements OnDestroy {
  $destroy = new Subject<void>();
  isAuthenticated = false;
  uuid: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private authenticationService: AuthenticationService,
  ) {}

  ngAfterViewInit() {
    this.uuid = this.route.snapshot.paramMap.get('uuid');

    this.authenticationService.$currentProfile
      .pipe(
        takeUntil(this.$destroy),
        filter((user) => user !== undefined),
      )
      .subscribe((user) => {
        const isAuthenticated = !!user;

        if (this.uuid !== null) {
          this.open(this.uuid, isAuthenticated);
        }
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async open(uuid: string, isAuthenticated: boolean) {
    const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, true, isAuthenticated);
    const object = window.document.createElement('object');

    object.data = url;

    object.style.borderWidth = '0';
    object.style.width = '100%';
    object.style.height = '100%';

    window.document.documentElement.replaceChild(object, document.body);
    window.document.title = fileName;
  }
}
