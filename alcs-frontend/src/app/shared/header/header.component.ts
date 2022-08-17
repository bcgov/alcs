import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApplicationDecisionMakerDto } from '../../services/application/application-code.dto';
import { ApplicationService } from '../../services/application/application.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  homeUrl = environment.homeUrl;
  decisionMakers: ApplicationDecisionMakerDto[] = [];

  constructor(
    private authService: AuthenticationService,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.loadTokenFromStorage().then(() => {
      this.applicationService.setup();
    });

    this.applicationService.$applicationDecisionMakers.subscribe((dms) => {
      this.decisionMakers = dms;
    });
  }

  onSelectBoard(event: Event) {
    //@ts-ignore
    const newCode = event.currentTarget.value;
    this.router.navigateByUrl(`/admin/${newCode}`);
  }

  onLogout() {
    this.authService.logout();
  }
}
