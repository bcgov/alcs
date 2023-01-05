import { Component, Input, OnInit } from '@angular/core';
import { CodeService } from '../../services/code/code.service';
import { SubmissionTypeDto } from '../../services/code/code.dto';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  @Input() isControlsVisible = true;
  submissionTypes: SubmissionTypeDto[] = [];

  constructor(private codeService: CodeService) {}

  ngOnInit(): void {
    this.loadCodes();
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.submissionTypes = codes.submissionTypes.sort((a, b) => (a.code > b.code ? 1 : -1));
  }
}
