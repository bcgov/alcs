import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { Component, Injectable } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FileOverlaySpinnerComponent } from './file-overlay-spinner/file-overlay-spinner.component';

@Injectable({
  providedIn: 'root',
})
export class OverlaySpinnerService {
  private spinnerRef: OverlayRef = this.createSpinner();
  private spinnerIsVisible = false;

  constructor(private overlay: Overlay) {}

  showFileSpinner() {
    this.showSpinner(FileOverlaySpinnerComponent);
  }

  showSpinner(component: ComponentType<any> = MatProgressSpinner) {
    if (!this.spinnerIsVisible) {
      this.spinnerIsVisible = true;
      const portal = new ComponentPortal(component);
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
