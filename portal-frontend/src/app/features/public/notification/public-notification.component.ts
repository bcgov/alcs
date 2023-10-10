import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationPortalDecisionDto } from '../../../services/application-decision/application-decision.dto';
import { PublicNotificationSubmissionDto } from '../../../services/public/public-notification.dto';
import { PublicDocumentDto, PublicParcelDto } from '../../../services/public/public.dto';
import { PublicService } from '../../../services/public/public.service';

@Component({
  selector: 'app-public-notification',
  templateUrl: './public-notification.component.html',
  styleUrls: ['./public-notification.component.scss'],
})
export class PublicNotificationComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  submission: PublicNotificationSubmissionDto | undefined;
  documents: PublicDocumentDto[] = [];
  parcels: PublicParcelDto[] = [];
  decisions: ApplicationPortalDecisionDto[] = [];

  constructor(private publicService: PublicService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((routeParams) => {
      const fileId = routeParams.get('fileId');
      if (fileId) {
        this.loadApplication(fileId);
      }
    });
  }

  private async loadApplication(fileId: string) {
    const res = await this.publicService.getNotification(fileId);
    if (res) {
      const { submission, documents, parcels } = res;

      this.submission = submission;
      this.documents = documents;
      this.parcels = parcels;
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
