import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationService } from '../../services/application/application.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public name = '';

  constructor(
    private authenticationService: AuthenticationService,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authenticationService.currentUser;
    if (user) {
      this.name = user.name;
    }
  }

  async onCreateApplication() {
    const res = await this.applicationService.create();
    if (res) {
      await this.router.navigateByUrl(`/application/${res.fileId}`);
    }
  }
}
