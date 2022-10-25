import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommissionerApplicationDto } from '../../services/commissioner/commissioner.dto';
import { CommissionerService } from '../../services/commissioner/commissioner.service';

@Component({
  selector: 'app-commissioner',
  templateUrl: './commissioner.component.html',
  styleUrls: ['./commissioner.component.scss'],
})
export class CommissionerComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();

  application: CommissionerApplicationDto | undefined;
  fileNumber: string | undefined;

  constructor(private commissionerService: CommissionerService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.application = await this.commissionerService.fetchApplication(fileNumber);
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
