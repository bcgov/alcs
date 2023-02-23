import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DOCUMENT_TYPE } from '../../services/application/application-document/application-document.service';
import { CommissionerApplicationDto } from '../../services/commissioner/commissioner.dto';
import { CommissionerService } from '../../services/commissioner/commissioner.service';

@Component({
  selector: 'app-commissioner',
  templateUrl: './commissioner.component.html',
  styleUrls: ['./commissioner.component.scss'],
})
export class CommissionerComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  DOCUMENT_TYPE = DOCUMENT_TYPE;
  application: CommissionerApplicationDto | undefined;
  fileNumber: string | undefined;

  constructor(
    private commissionerService: CommissionerService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.application = await this.commissionerService.fetchApplication(fileNumber);
      this.titleService.setTitle(
        `${environment.siteName} | ${this.application.fileNumber} (${this.application.applicant})`
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
