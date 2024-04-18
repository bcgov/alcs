import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test('TUR', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: process.env.PORTAL_BASE_URL });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.logIn(process.env.BCEID_BASIC_USERNAME, process.env.BCEID_BASIC_PASSWORD);

  // Create TUR app
  await page.getByRole('button', { name: '+ Create New' }).click();
  await page.getByText('Application', { exact: true }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Transportation, Utility, or Recreational Trail Uses within the ALR').click();
  await page.getByRole('button', { name: 'create' }).click();
  await page.getByText('Parcel Details', { exact: true }).click(); // Ensure parcels page

  // Step 1a: Parcels
  await page.getByRole('button', { name: 'Fee Simple' }).click();
  await page.getByPlaceholder('Type legal description').fill('Parcel description');
  await page.getByPlaceholder('Type parcel size').fill('1');
  await page.getByPlaceholder('Type PID').fill('111-111-111');
  await page.getByRole('button', { name: 'Open calendar' }).click();
  await page.getByText('2014').click();
  await page.getByText('Apr').click();
  await page.getByText('23').click();
  await page.getByText('Yes').click();
  await page.getByPlaceholder('Type Address').fill('123 Street Rd');

  // Upload
  const titleFileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose file to Upload', exact: true }).click();
  const titleFileChooser = await titleFileChooserPromise;
  titleFileChooser.setFiles('data/temp.txt');

  // Step 1b: Parcel Owners
  await page.getByRole('button', { name: 'Add new owner' }).click();
  await page.getByRole('button', { name: 'Individual' }).click();
  await page.getByPlaceholder('Enter First Name').fill('1');
  await page.getByPlaceholder('Enter Last Name').fill('1');
  await page.getByPlaceholder('(555) 555-5555').fill('(111) 111-11111');
  await page.getByPlaceholder('Enter Email').fill('1@1');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByText('I confirm that the owner information provided above matches the current Certific').click();
  await page.getByText('Other Owned Parcels', { exact: true }).click();

  // Step 2: Other Parcels
  await page.getByRole('button', { name: 'Yes' }).click();
  await page
    .getByLabel('Describe the other parcels including their location, who owns or leases them, and their use.')
    .fill('Other parcels');
  await page.getByText('Primary Contact', { exact: true }).click();

  // Step 3: Primary Contact
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByLabel('1 1').check();
  await page.getByText('Government', { exact: true }).click();

  // Step 4: Government
  await page.getByPlaceholder('Type government').click();
  await page.getByPlaceholder('Type government').fill('peace');
  await page.getByText('Peace River Regional District').click();
  await page.getByText('Land Use').click();

  // Step 5: Land Use
  await page.getByLabel('Describe all agriculture that currently takes place on the parcel(s).').fill('This');
  await page.getByLabel('Describe all agricultural improvements made to the parcel(s).').fill('That');
  await page.getByLabel('Describe all other uses that currently take place on the parcel(s).').fill('The other');

  // North
  await page.getByPlaceholder('Main Land Use Type').nth(0).click();
  await page.locator('#northLandUseType-panel').getByRole('option', { name: 'Agricultural / Farm' }).click();
  await page.getByRole('textbox', { name: 'North land use type description' }).fill('1');

  // East
  await page.getByPlaceholder('Main Land Use Type').nth(1).click();
  await page.locator('#eastLandUseType-panel').getByRole('option', { name: 'Civic / Institutional' }).click();
  await page.getByRole('textbox', { name: 'East land use type description' }).fill('1');

  // South
  await page.getByPlaceholder('Main Land Use Type').nth(2).click();
  await page.locator('#southLandUseType-panel').getByRole('option', { name: 'Commercial / Retail' }).click();
  await page.getByRole('textbox', { name: 'South land use type description' }).fill('1');

  // West
  await page.getByPlaceholder('Main Land Use Type').nth(3).click();
  await page.locator('#westLandUseType-panel').getByRole('option', { name: 'Industrial' }).click();
  await page.getByRole('textbox', { name: 'West land use type description' }).fill('1');

  await page.getByText('Proposal', { exact: true }).click();

  // Step 6: Proposal
  await page.getByLabel('What is the purpose of the proposal?').fill('This');
  await page
    .getByLabel(
      'Specify any agricultural activities such as livestock operations, greenhouses or horticultural activities in proximity to the proposal.',
    )
    .fill('That');
  await page
    .getByLabel('What steps will you take to reduce potential negative impacts on surrounding agricultural lands?')
    .fill('The other');
  await page.getByLabel('Could this proposal be accommodated on lands outside of the ALR?').fill('And another');
  await page.getByPlaceholder('Type total area').fill('1');
  await page.getByText('I confirm that all affected property owners with land in the ALR have been notif').click();

  // File upload
  const proofOfServiceNoticeFileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose file to Upload', exact: true }).nth(0).click();
  const proofOfServiceNoticeFileChooser = await proofOfServiceNoticeFileChooserPromise;
  proofOfServiceNoticeFileChooser.setFiles('data/temp.txt');

  // File upload
  const proposalMapFileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose file to Upload', exact: true }).nth(1).click();
  const proposalMapFileChooser = await proposalMapFileChooserPromise;
  proposalMapFileChooser.setFiles('data/temp.txt');

  await page.getByText('Upload Attachments').click();

  // Step 7: Optional attachments
  // File upload first file
  const optionalFile1ChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose file to Upload', exact: true }).click();
  const optionalFile1Chooser = await optionalFile1ChooserPromise;
  optionalFile1Chooser.setFiles('data/temp.txt');
  await page.getByPlaceholder('Select a type').nth(0).click();
  await page.getByText('Professional Report').click();
  await page.getByPlaceholder('Type description').nth(0).fill('Desc');

  // File upload second file
  const optionalFile2ChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose file to Upload', exact: true }).click();
  const optionalFile2Chooser = await optionalFile2ChooserPromise;
  optionalFile2Chooser.setFiles('data/temp.txt');
  await page.getByPlaceholder('Select a type').nth(1).click();
  await page.getByText('Site Photo').click();
  await page.getByPlaceholder('Type description').nth(1).fill('Desc');

  await page.getByText('Review & Submit').click();

  // Step 8: Review
  // 1. Parcels
  // Parcel 1
  await expect(page.getByTestId('parcel-0-type')).toHaveText('Fee Simple');
  await expect(page.getByTestId('parcel-0-legal-description')).toHaveText('Parcel description');
  await expect(page.getByTestId('parcel-0-map-area')).toHaveText('1 ha');
  await expect(page.getByTestId('parcel-0-pid')).toHaveText('111-111-111');
  await expect(page.getByTestId('parcel-0-purchase-date')).toHaveText('Apr 23, 2014');
  await expect(page.getByTestId('parcel-0-is-farm')).toHaveText('Yes');
  await expect(page.getByTestId('parcel-0-civic-address')).toHaveText('123 Street Rd');
  await expect(page.getByTestId('parcel-0-certificate-of-title')).toHaveText('temp.txt');

  // Owners
  await expect(page.getByTestId('parcel-0-owner-0-name')).toHaveText('1 1');
  await expect(page.getByTestId('parcel-0-owner-0-organization')).toHaveText('No Data');
  await expect(page.getByTestId('parcel-0-owner-0-phone-number')).toHaveText('(111) 111-1111');
  await expect(page.getByTestId('parcel-0-owner-0-email')).toHaveText('1@1');
  await expect(page.getByTestId('parcel-0-owner-0-corporate-summary')).toHaveText('Not Applicable');

  await expect(page.getByTestId('parcel-0-is-confirmed-by-applicant')).toHaveText('Yes');

  // 2. Other Parcels
  await expect(page.getByTestId('has-other-parcels')).toHaveText('Yes');
  await expect(page.getByTestId('other-parcels-description')).toHaveText('Other parcels');

  // 3. Primary Contact
  await expect(page.getByTestId('primary-contact-type')).toHaveText('Land Owner');
  await expect(page.getByTestId('primary-contact-first-name')).toHaveText('1');
  await expect(page.getByTestId('primary-contact-last-name')).toHaveText('1');
  await expect(page.getByTestId('primary-contact-organization')).toHaveText('No Data');
  await expect(page.getByTestId('primary-contact-phone-number')).toHaveText('(111) 111-1111');
  await expect(page.getByTestId('primary-contact-email')).toHaveText('1@1');

  // 4. Government
  await expect(page.getByTestId('government-name')).toHaveText('Peace River Regional District');

  // 5. Land Use
  await expect(page.getByTestId('parcels-agriculture-description')).toHaveText('This');
  await expect(page.getByTestId('parcels-agriculture-improvement-description')).toHaveText('That');
  await expect(page.getByTestId('parcels-non-agriculture-description')).toHaveText('The other');
  await expect(page.getByTestId('north-land-use-type')).toHaveText('Agricultural / Farm');
  await expect(page.getByTestId('north-land-use-description')).toHaveText('1');
  await expect(page.getByTestId('east-land-use-type')).toHaveText('Civic / Institutional');
  await expect(page.getByTestId('east-land-use-description')).toHaveText('1');
  await expect(page.getByTestId('south-land-use-type')).toHaveText('Commercial / Retail');
  await expect(page.getByTestId('south-land-use-description')).toHaveText('1');
  await expect(page.getByTestId('west-land-use-type')).toHaveText('Industrial');
  await expect(page.getByTestId('west-land-use-description')).toHaveText('1');

  // 6. Proposal
  await expect(page.getByTestId('tur-purpose')).toHaveText('This');
  await expect(page.getByTestId('tur-agricultural-activities')).toHaveText('That');
  await expect(page.getByTestId('tur-reduce-negative-impacts')).toHaveText('The other');
  await expect(page.getByTestId('tur-outside-lands')).toHaveText('And another');
  await expect(page.getByTestId('tur-total-corridor-area')).toHaveText('1 ha');
  await expect(page.getByTestId('tur-all-owners-notified')).toHaveText('Yes');
  await expect(page.getByTestId('tur-proof-of-serving-notice')).toHaveText('temp.txt');
  await expect(page.getByTestId('tur-proposal-map')).toHaveText('temp.txt');

  // 7. Optional Documents
  // Doc 1
  await expect(page.getByTestId('optional-document-0-file-name')).toHaveText('temp.txt');
  await expect(page.getByTestId('optional-document-0-type')).toHaveText('Professional Report');
  await expect(page.getByTestId('optional-document-0-description')).toHaveText('Desc');

  // Doc 2
  await expect(page.getByTestId('optional-document-1-file-name')).toHaveText('temp.txt');
  await expect(page.getByTestId('optional-document-1-type')).toHaveText('Site Photo');
  await expect(page.getByTestId('optional-document-1-description')).toHaveText('Desc');
});
