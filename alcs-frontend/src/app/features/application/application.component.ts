import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { ApplicationDetailedDto } from '../../services/application/application.dto';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
})
export class ApplicationComponent implements OnInit {
  application?: ApplicationDetailedDto;
  fileNumber?: string;

  constructor(private applicationDetailService: ApplicationDetailService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.loadApplication();
    });
    this.applicationDetailService.$application.subscribe((application) => {
      this.application = application;
    });
  }

  async loadApplication() {
    await this.applicationDetailService.loadApplication(this.fileNumber!);
  }
}
