import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationDetailedDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
})
export class ApplicationComponent implements OnInit {
  application?: ApplicationDetailedDto;

  constructor(private applicationService: ApplicationService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      const application = await this.applicationService.fetchApplication(fileNumber);

      if (!application) {
        //WHAT DO?
      }
      this.application = application;
    });
  }
}
