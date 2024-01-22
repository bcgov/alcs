import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../services/code/code.service';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss'],
})
export class MaintenanceComponent implements OnInit {
  constructor(private codeService: CodeService, private router: Router) {}

  ngOnInit(): void {
    this.checkMaintenanceMode();
  }

  private async checkMaintenanceMode() {
    const res = await this.codeService.loadCodes();
    if (res) {
      await this.router.navigateByUrl('/');
    }
  }
}
