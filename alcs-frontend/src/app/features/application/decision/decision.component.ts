import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { SYSTEM_SOURCE_TYPES } from '../../../shared/dto/system-source.types.dto';
import { decisionChildRoutes } from './decision.module';

@Component({
  selector: 'app-app-decision',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.scss'],
})
export class DecisionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  childRoutes = decisionChildRoutes;

  APPLICATION_SYSTEM_SOURCE_TYPES = SYSTEM_SOURCE_TYPES;
  application: ApplicationDto | undefined;

  constructor(private applicationDetailService: ApplicationDetailService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
      } else {
        this.application = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
