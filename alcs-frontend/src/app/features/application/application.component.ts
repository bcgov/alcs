import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationDetailedDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ProcessingComponent } from './processing/processing.component';
import { ReviewComponent } from './review/review.component';

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

  onOutletLoaded(component: ReviewComponent | ProcessingComponent) {
    if (component instanceof ReviewComponent) {
      component.fileNumber = this.application?.fileNumber || '';
    } else if (component instanceof ProcessingComponent) {
      // TODO: this is just an example, delete once not needed
      console.log('place parameters for processing here');
    }
  }
}
