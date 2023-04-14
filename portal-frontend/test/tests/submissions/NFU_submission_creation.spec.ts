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
    .filter({ hasText: 'Application Edit Application Download PDF 1. Identify Parcel(s) Under Applicatio' })
    .getByRole('button', { name: 'Edit Application' })
    .click();
  await page.getByRole('button', { name: 'Fee Simple' }).click();
  await page.getByPlaceholder('Enter legal description').click();
  await page.getByPlaceholder('Enter legal description').fill('some description here');
  await page.getByPlaceholder('Enter parcel size').click();
  await page.getByPlaceholder('Enter parcel size').fill('11');
  await page.getByPlaceholder('Enter PID').click();
  await page.getByPlaceholder('Enter PID').fill('111-111-111');
  await page.getByPlaceholder('YYYY-MMM-DD').click();
  await page.getByPlaceholder('YYYY-MMM-DD').fill('2023-Mar-12');
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByPlaceholder('Type owner name').click();
  await page
    .getByRole('option', { name: 'No owner matching search Add new owner' })
    .getByRole('button', { name: 'Add new owner' })
    .click();
  await page.getByRole('button', { name: 'Individual' }).click();
  await page.getByPlaceholder('Enter First Name').click();
  await page.getByPlaceholder('Enter First Name').fill('Test');
  await page.getByPlaceholder('Enter Last Name').click();
  await page.getByPlaceholder('Enter Last Name').fill('Individual');
  await page.getByPlaceholder('(555) 555-5555').click();
  await page.getByPlaceholder('(555) 555-5555').fill('(111) 111-11111');
  await page.getByPlaceholder('Enter Email').click();
  await page.getByPlaceholder('Enter Email').fill('11@11');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.setInputFiles('input.file-input', filePathToUseAsUpload);
  await page
    .getByLabel(
      'I confirm that the owner information provided above matches the current Certificate of Title. Mismatched information can cause significant delays to processing time.'
    )
    .check();
  await page.getByRole('button', { name: 'Add another parcel to the application' }).click();

  await page
    .getByRole('region', { name: 'Parcel #2 Details & Owner Information' })
    .getByRole('button', { name: 'Crown' })
    .click();
  await page.getByRole('button', { name: 'Crown' }).click();
  await page.getByRole('textbox', { name: 'Enter legal description' }).click();
  await page.getByRole('textbox', { name: 'Enter legal description' }).fill('another description');
  await page.getByRole('textbox', { name: 'Enter parcel size' }).click();
  await page.getByRole('textbox', { name: 'Enter parcel size' }).fill('22');
  await page.getByRole('button', { name: 'No', exact: true }).click();
  await page.getByLabel('Provincial Crown').check();
  await page.getByRole('button', { name: 'Add new government contact' }).click();
  await page.getByPlaceholder('Type ministry or department name').click();
  await page.getByPlaceholder('Type ministry or department name').fill('test ministry');
  await page.getByPlaceholder('Enter First Name').click();
  await page.getByPlaceholder('Enter First Name').fill('Ministry');
  await page.getByPlaceholder('Enter Last Name').click();
  await page.getByPlaceholder('Enter Last Name').fill('test');
  await page.getByPlaceholder('(555) 555-5555').click();
  await page.getByPlaceholder('(555) 555-5555').fill('(333) 333-33333');
  await page.getByPlaceholder('Enter Email').click();
  await page.getByPlaceholder('Enter Email').fill('33@33');
  await page.getByRole('button', { name: 'Add' }).click();
  await page
    .getByRole('checkbox', {
      name: 'I confirm that the owner information provided above matches the current Certificate of Title. Mismatched information can cause significant delays to processing time.',
    })
    .last()
    .check();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.locator('#mat-button-toggle-16-button').click();
  await page.getByRole('button', { name: 'Fee Simple' }).click();
  await page.getByPlaceholder('Enter legal description').click();
  await page.getByPlaceholder('Enter legal description').fill('other parcels description');
  await page.getByPlaceholder('Enter parcel size').click();
  await page.getByPlaceholder('Enter parcel size').fill('45');
  await page.getByPlaceholder('Enter PID').click();
  await page.getByPlaceholder('Enter PID').fill('444-444-444');
  await page.getByRole('region', { name: 'Parcel A Details' }).getByRole('button', { name: 'No' }).click();
  await page.getByPlaceholder('Type owner name').click();
  await page.getByRole('option', { name: 'Test Individual Add' }).getByText('Test Individual').click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Make Primary Contact' }).first().click();
  await page.setInputFiles('input.file-input', filePathToUseAsUpload);
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByPlaceholder('Type government').click();
  await page.getByPlaceholder('Type government').fill('Peace');
  await page.getByText('Peace River Regional District').click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page
    .getByLabel('Quantify and describe in detail all agriculture that currently takes place on the parcel(s).')
    .click();
  await page
    .getByLabel('Quantify and describe in detail all agriculture that currently takes place on the parcel(s).')
    .fill('5');
  await page.getByLabel('Quantify and describe in detail all agricultural improvements made to the parcel(s).').click();
  await page
    .getByLabel('Quantify and describe in detail all agricultural improvements made to the parcel(s).')
    .fill('5');
  await page
    .getByLabel('Quantify and describe all non-agricultural uses that currently take place on the parcel(s).')
    .click();
  await page
    .getByLabel('Quantify and describe all non-agricultural uses that currently take place on the parcel(s).')
    .fill('5');
  await page.locator('#northLandUseType svg').click();
  await page.getByText('Agricultural / Farm').click();
  await page.locator('#northLandUseTypeDescription').click();
  await page.locator('#northLandUseTypeDescription').fill('north farm');
  await page.locator('#eastLandUseType svg').click();
  await page.getByText('Civic / Institutional').click();
  await page.locator('#eastLandUseTypeDescription').click();
  await page.locator('#eastLandUseTypeDescription').fill('civic east');
  await page.locator('#southLandUseType svg').click();
  await page.getByText('Commercial / Retail').click();
  await page.locator('#southLandUseTypeDescription').click();
  await page.locator('#southLandUseTypeDescription').fill('commercial');
  await page.getByRole('combobox', { name: 'Main Land Use Type' }).locator('svg').click();
  await page.getByText('Industrial').click();
  await page.locator('#westLandUseTypeDescription').click();
  await page.locator('#westLandUseTypeDescription').fill('industrial west');
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByPlaceholder('Type size in hectares').click();
  await page.getByPlaceholder('Type size in hectares').fill('6');
  await page.getByLabel('What is the purpose of the proposal?').click();
  await page.getByLabel('What is the purpose of the proposal?').fill('no purpose');
  await page
    .getByLabel(
      'Could this proposal be accommodated on lands outside of the ALR? Please justify why the proposal cannot be carried out on lands outside the ALR.'
    )
    .click();
  await page
    .getByLabel(
      'Could this proposal be accommodated on lands outside of the ALR? Please justify why the proposal cannot be carried out on lands outside the ALR.'
    )
    .fill('nope');
  await page.getByLabel('Does the proposal support agriculture in the short or long term? Please explain.').click();
  await page
    .getByLabel('Does the proposal support agriculture in the short or long term? Please explain.')
    .fill('nope');
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByLabel('Describe the type and amount of fill proposed to be placed.').click();
  await page.getByLabel('Describe the type and amount of fill proposed to be placed.').fill('6');
  await page.getByLabel('Briefly describe the origin and quality of fill.').click();
  await page.getByLabel('Briefly describe the origin and quality of fill.').fill('very good');
  await page.getByPlaceholder('Type fill depth').click();
  await page.getByPlaceholder('Type fill depth').fill('6');
  await page.getByPlaceholder('Type placement area').click();
  await page.getByPlaceholder('Type placement area').fill('6');
  await page.getByPlaceholder('Type volume').click();
  await page.getByPlaceholder('Type volume').fill('6');
  await page.getByPlaceholder('Type length as a decimal number').click();
  await page.getByPlaceholder('Type length as a decimal number').fill('6');
  await page.getByText('UnitSelect one').click();
  await page.getByText('Months', { exact: true }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
});
