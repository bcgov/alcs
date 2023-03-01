import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root',
})
export class OverlaySpinnerService {
  private spinnerRef: OverlayRef = this.createSpinner();
  private spinnerIsVisible = false;

  constructor(private overlay: Overlay) {}

  showSpinner() {
    if (!this.spinnerIsVisible) {
      this.spinnerIsVisible = true;
      const portal = new ComponentPortal(MatProgressSpinner);
      const spinner = this.spinnerRef.attach(portal);
      spinner.instance.mode = 'indeterminate';
      //Steal focus to prevent spamming the button
      spinner.location.nativeElement.focus();
    }
  }

  hideSpinner() {
    if (this.spinnerIsVisible) {
      this.spinnerIsVisible = false;
      this.spinnerRef.detach();
    }
  }

  private createSpinner() {
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });
  }
}
