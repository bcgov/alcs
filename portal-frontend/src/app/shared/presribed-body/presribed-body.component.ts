import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthenticationService } from '../../services/authentication/authentication.service';

const FIRST_NATION = 'First Nation Government';
const LOCAL = 'Local Government';

@Component({
  selector: 'app-presribed-body',
  templateUrl: './presribed-body.component.html',
  styleUrls: ['./presribed-body.component.scss'],
})
export class PresribedBodyComponent implements OnInit {
  @Input() value: string | undefined;
  @Output() select = new EventEmitter<string>();

  PRESCRIBED_BODIES = [
    'Regional Health Board (as per s.4(1) Health Authorities Act)',
    'Educational Body (as per the Freedom of Information and Protection of Privacy Act)',
    'An Improvement District (as per the Local Government Act)',
    'The BC Transportation Financing Authority',
    'The BC Housing Management Commission',
    'The BC Hydro and Power Authority',
    'The South Coast BC Transportation Authority',
    'The BC Transit Corporation',
    'The Columbia Power Corporation',
    'The Province of BC',
    FIRST_NATION,
    LOCAL,
  ];
  prescribedBodies: { label: string; enabled: boolean; selected: boolean }[] = [];
  isLocalGovernmentUser = false;
  isFirstNationUser = false;
  showGovernmentWarning = false;
  selectedValue: string | undefined;

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.prescribedBodies = this.PRESCRIBED_BODIES.map((body) => ({
      label: body,
      enabled: true,
      selected: false,
    }));

    this.selectedValue = this.value;

    this.authenticationService.$currentProfile.subscribe((profile) => {
      if (profile && profile.government) {
        this.isLocalGovernmentUser = profile.isLocalGovernment;
        this.isFirstNationUser = profile.isFirstNationGovernment;

        if (this.isLocalGovernmentUser) {
          this.onSelect(LOCAL);
        } else {
          this.onSelect(FIRST_NATION);
        }

        this.prescribedBodies = this.PRESCRIBED_BODIES.map((body) => ({
          label: body,
          enabled: body === this.selectedValue,
          selected: body === this.selectedValue,
        }));
      }
    });
  }

  onSelect(chosenValue: string) {
    this.selectedValue = chosenValue;
    if (
      (chosenValue === LOCAL && !this.isLocalGovernmentUser) ||
      (chosenValue === FIRST_NATION && !this.isFirstNationUser)
    ) {
      this.showGovernmentWarning = true;
      this.select.emit(undefined);
    } else {
      this.showGovernmentWarning = false;
      this.select.emit(this.selectedValue);
    }
  }
}
