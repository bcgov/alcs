import { test } from '@playwright/test';
import { baseUrl, filePathToUseAsUpload, password, userName } from '../../config';

test('test', async ({ page }) => {
  await page.goto(baseUrl);
  await page.getByRole('button', { name: 'Login with BCeID' }).click();
  await page.locator('#user').click();
  await page.locator('#user').fill(userName);
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue to inbox' }).click();
  await page.getByRole('button', { name: '+ Create New' }).click();
  await page.getByRole('dialog', { name: 'Create New' }).getByText('Application').click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Non-Farm Uses within the ALR').click();
  await page.getByRole('button', { name: 'create' }).click();
  await page
    .locator('section')
    .filter({
      hasText: 'Application Edit Application 1. Identify Parcel(s) Under Application 2. Other Pa',
    })
    .getByRole('button', { name: 'Edit Application' })
    .click();
  await page.getByRole('button', { name: 'Fee Simple' }).click();
  await page.getByPlaceholder('Enter legal description').click();
  await page.getByPlaceholder('Enter legal description').fill('some description');
  await page.getByPlaceholder('Enter parcel size').click();
  await page.getByPlaceholder('Enter parcel size').fill('1');
  await page.getByPlaceholder('Enter PID').click();
  await page.getByPlaceholder('Enter PID').fill('222-222-222');
  await page.getByRole('button', { name: 'Open calendar' }).click();
  await page.locator('td:nth-child(3) > .mat-calendar-body-cell').first().click();
  await page.getByRole('button', { name: 'March 22, 2023' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.setInputFiles('input.file-input', filePathToUseAsUpload);
  await page.getByPlaceholder('Type owner name').click();
  await page
    .getByRole('option', { name: 'No owner matching search Add new owner' })
    .getByRole('button', { name: 'Add new owner' })
    .click();
  await page
    .locator(
      '.ng-untouched > .form-row > div:nth-child(2) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
    )
    .click();
  await page.getByPlaceholder('Enter First Name').fill('test');
  await page.getByPlaceholder('Enter Last Name').click();
  await page.getByPlaceholder('Enter Last Name').fill('user');
  await page
    .locator(
      '.mat-mdc-dialog-content > form > .form-row > div:nth-child(4) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
    )
    .click();
  await page.getByPlaceholder('(555) 555-5555').fill('(444) 444-44444');
  await page.getByPlaceholder('Enter Email').click();
  await page.getByPlaceholder('Enter Email').fill('44@44');
  await page.getByRole('button', { name: 'Add' }).click();
  await page
    .getByLabel(
      'I confirm that the owner information provided above matches the current Certificate of Title. Mismatched information can cause significant delays to processing time.'
    )
    .check();
  await page.getByRole('button', { name: 'Add another parcel to the application' }).click();
  await page.getByRole('textbox', { name: 'Enter legal description' }).click();
  await page.getByRole('textbox', { name: 'Enter legal description' }).fill('another description');
  await page.getByRole('button', { name: 'Crown' }).click();
  await page
    .locator(
      '.ng-invalid > .form-row > div:nth-child(3) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
    )
    .click();
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill('2');
  await page
    .locator(
      '.ng-invalid > .form-row > div:nth-child(4) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
    )
    .click();
  await page
    .locator(
      '.ng-invalid > .form-row > div:nth-child(4) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
    )
    .click();
  await page.getByRole('textbox', { name: 'Enter PID' }).fill('333-333-333');
  await page.getByRole('button', { name: 'No', exact: true }).click();
  await page.setInputFiles('input.file-input', filePathToUseAsUpload);
  await page.getByText('Provincial Crown').click();
  await page.getByPlaceholder('Search by Ministry or Department').click();
  await page
    .getByRole('option', {
      name: 'No owner matching search Add new government contact',
    })
    .getByRole('button', { name: 'Add new government contact' })
    .click();
  await page.getByPlaceholder('Type ministry or department name').fill('test ministry');
  await page.getByPlaceholder('Enter First Name').click();
  await page.getByPlaceholder('Enter First Name').fill('test');
  await page.getByPlaceholder('Enter Last Name').click();
  await page.getByPlaceholder('Enter Last Name').fill('ministry');
  await page.getByPlaceholder('(555) 555-5555').click();
  await page.getByPlaceholder('(555) 555-5555').fill('(222) 222-22222');
  await page.getByPlaceholder('Enter Email').click();
  await page.getByPlaceholder('Enter Email').fill('22@22');
  await page.getByRole('button', { name: 'Add' }).click();
  await page
    .getByRole('checkbox', {
      name: 'I confirm that the owner information provided above matches the current Certificate of Title. Mismatched information can cause significant delays to processing time.',
    })
    .check();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.locator('#mat-button-toggle-17-button').click();
  await page.getByText('Primary Contact').click();
  await page.getByRole('button', { name: 'Make Primary Contact' }).first().click();
  await page.getByText('Government', { exact: true }).click();
  await page.getByPlaceholder('Type government').click();
  await page.getByPlaceholder('Type government').fill('peace');
  await page.getByText('Peace River Regional District').click();
  await page.getByText('Land Use').click();
  await page
    .getByLabel('Quantify and describe in detail all agriculture that currently takes place on the parcel(s).')
    .click();
  await page
    .getByLabel('Quantify and describe in detail all agriculture that currently takes place on the parcel(s).')
    .fill('4');
  await page.getByLabel('Quantify and describe in detail all agricultural improvements made to the parcel(s).').click();
  await page
    .getByLabel('Quantify and describe in detail all agricultural improvements made to the parcel(s).')
    .fill('4');
  await page
    .getByLabel('Quantify and describe all non-agricultural uses that currently take place on the parcel(s).')
    .click();
  await page
    .getByLabel('Quantify and describe all non-agricultural uses that currently take place on the parcel(s).')
    .fill('4');
  await page
    .locator(
      '.land-use-type > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
    )
    .first()
    .click();
  await page.getByText('Other', { exact: true }).click();
  await page.locator('#mat-select-value-7').getByText('Main Land Use Type').click();
  await page.getByText('Industrial').first().click();
  await page.locator('#mat-select-value-7').click();
  await page.getByText('Civic / Institutional').first().click();
  await page.locator('#mat-select-value-9').click();
  await page.getByRole('option', { name: 'Agricultural / Farm' }).first().click();
  await page.locator('#northLandUseTypeDescription').click();
  await page.locator('#northLandUseTypeDescription').fill('4');
  await page.locator('#eastLandUseTypeDescription').click();
  await page.locator('#eastLandUseTypeDescription').fill('5');
  await page
    .locator(
      'div:nth-child(3) > .land-use-type-wrapper > .full-width-input > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
    )
    .click();
  await page.locator('#southLandUseTypeDescription').click();
  await page.locator('#southLandUseTypeDescription').fill('5');
  await page
    .locator(
      'div:nth-child(4) > .land-use-type-wrapper > .full-width-input > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
    )
    .click();
  await page.locator('#westLandUseTypeDescription').fill('5');
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByPlaceholder('Type size in hectares').click();
  await page.getByPlaceholder('Type size in hectares').fill('5');
  await page.getByLabel('What is the purpose of the proposal?').click();
  await page.getByLabel('What is the purpose of the proposal?').fill('6');
  await page
    .getByLabel(
      'Could this proposal be accommodated on lands outside of the ALR? Please justify why the proposal cannot be carried out on lands outside the ALR.'
    )
    .click();
  await page
    .getByLabel(
      'Could this proposal be accommodated on lands outside of the ALR? Please justify why the proposal cannot be carried out on lands outside the ALR.'
    )
    .fill('6');
  await page.getByLabel('Does the proposal support agriculture in the short or long term? Please explain.').click();
  await page.getByLabel('Does the proposal support agriculture in the short or long term? Please explain.').fill('6');
  await page.getByRole('button', { name: 'No' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
});
