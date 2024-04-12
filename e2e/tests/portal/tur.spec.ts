import { test, expect, UserPrefix } from './fixtures';

test.use({ userPrefix: UserPrefix.BceidLg });

test('TUR', async ({ inboxLoggedIn }) => {
  // Create TUR app
  await inboxLoggedIn.getByRole('button', { name: '+ Create New' }).click();
  await inboxLoggedIn.getByText('Application', { exact: true }).click();
  await inboxLoggedIn.getByRole('button', { name: 'Next' }).click();
  await inboxLoggedIn.getByText('Transportation, Utility, or Recreational Trail Uses within the ALR').click();
  await inboxLoggedIn.getByRole('button', { name: 'create' }).click();
  await inboxLoggedIn.getByText('Parcel Details', { exact: true }).click(); // Ensure parcels page

  // Step 1a: Parcels
  await inboxLoggedIn.getByRole('button', { name: 'Fee Simple' }).click();
  await inboxLoggedIn.getByPlaceholder('Type legal description').fill('Parcel description');
  await inboxLoggedIn.getByPlaceholder('Type parcel size').fill('1');
  await inboxLoggedIn.getByPlaceholder('Type PID').fill('111-111-111');
  await inboxLoggedIn.getByRole('button', { name: 'Open calendar' }).click();
  await inboxLoggedIn.getByText('2014').click();
  await inboxLoggedIn.getByText('Apr').click();
  await inboxLoggedIn.getByText('23').click();
  await inboxLoggedIn.getByText('Yes').click();
  await inboxLoggedIn.getByPlaceholder('Type Address').fill('123 Street Rd');

  // Upload
  const titleFileChooserPromise = inboxLoggedIn.waitForEvent('filechooser');
  await inboxLoggedIn.getByRole('button', { name: 'Choose file to Upload', exact: true }).click();
  const titleFileChooser = await titleFileChooserPromise;
  titleFileChooser.setFiles('data/temp.txt');

  // Step 1b: Parcel Owners
  await inboxLoggedIn.getByRole('button', { name: 'Add new owner' }).click();
  await inboxLoggedIn.getByRole('button', { name: 'Individual' }).click();
  await inboxLoggedIn.getByPlaceholder('Enter First Name').fill('1');
  await inboxLoggedIn.getByPlaceholder('Enter Last Name').fill('1');
  await inboxLoggedIn.getByPlaceholder('(555) 555-5555').fill('(111) 111-11111');
  await inboxLoggedIn.getByPlaceholder('Enter Email').fill('1@1');
  await inboxLoggedIn.getByRole('button', { name: 'Add' }).click();
  await inboxLoggedIn
    .getByText('I confirm that the owner information provided above matches the current Certific')
    .click();
  await inboxLoggedIn.getByText('Other Owned Parcels', { exact: true }).click();

  // Step 2: Other Parcels
  await inboxLoggedIn.getByRole('button', { name: 'Yes' }).click();
  await inboxLoggedIn
    .getByLabel('Describe the other parcels including their location, who owns or leases them, and their use.')
    .fill('Other parcels');
  await inboxLoggedIn.getByText('Primary Contact', { exact: true }).click();

  // Step 3: Primary Contact
  await inboxLoggedIn.getByRole('button', { name: 'Yes' }).click();
  await inboxLoggedIn.getByLabel('1 1').check();
  await inboxLoggedIn.getByText('Government', { exact: true }).click();

  // Step 4: Government
  await inboxLoggedIn.getByPlaceholder('Type government').click();
  await inboxLoggedIn.getByPlaceholder('Type government').fill('peace');
  await inboxLoggedIn.getByText('Peace River Regional District').click();
  await inboxLoggedIn.getByText('Land Use').click();

  // Step 5: Land Use
  await inboxLoggedIn.getByLabel('Describe all agriculture that currently takes place on the parcel(s).').fill('This');
  await inboxLoggedIn.getByLabel('Describe all agricultural improvements made to the parcel(s).').fill('That');
  await inboxLoggedIn
    .getByLabel('Describe all other uses that currently take place on the parcel(s).')
    .fill('The other');
  console.log();

  // North
  await inboxLoggedIn.getByPlaceholder('Main Land Use Type').nth(0).click();
  await inboxLoggedIn.getByRole('option', { name: 'Agricultural / Farm' }).click();
  await inboxLoggedIn.getByRole('textbox', { name: 'North land use type description' }).click();
  await inboxLoggedIn.getByRole('textbox', { name: 'North land use type description' }).fill('1');
  await inboxLoggedIn.getByPlaceholder('Main Land Use Type').nth(0).press('Escape'); // Close dropdown

  // East
  await inboxLoggedIn.getByPlaceholder('Main Land Use Type').nth(1).click();
  await inboxLoggedIn.getByRole('option', { name: 'Civic / Institutional' }).click();
  await inboxLoggedIn.getByRole('textbox', { name: 'East land use type description' }).click();
  await inboxLoggedIn.getByRole('textbox', { name: 'East land use type description' }).fill('1');
  await inboxLoggedIn.getByPlaceholder('Main Land Use Type').nth(1).press('Escape'); // Close dropdown

  // South
  await inboxLoggedIn.getByPlaceholder('Main Land Use Type').nth(2).click();
  await inboxLoggedIn.getByRole('option', { name: 'Commercial / Retail' }).click();
  await inboxLoggedIn.getByRole('textbox', { name: 'South land use type description' }).click();
  await inboxLoggedIn.getByRole('textbox', { name: 'South land use type description' }).fill('1');
  await inboxLoggedIn.getByPlaceholder('Main Land Use Type').nth(2).press('Escape'); // Close dropdown

  // West
  await inboxLoggedIn.getByPlaceholder('Main Land Use Type').nth(3).click();
  await inboxLoggedIn.getByRole('option', { name: 'Industrial' }).click();
  await inboxLoggedIn.getByRole('textbox', { name: 'West land use type description' }).click();
  await inboxLoggedIn.getByRole('textbox', { name: 'West land use type description' }).fill('1');
  await inboxLoggedIn.getByPlaceholder('Main Land Use Type').nth(3).press('Escape'); // Close dropdown

  await inboxLoggedIn.getByText('Proposal', { exact: true }).click();

  // Step 6: Proposal
  await inboxLoggedIn.getByLabel('What is the purpose of the proposal?').fill('This');
  await inboxLoggedIn
    .getByLabel(
      'Specify any agricultural activities such as livestock operations, greenhouses or horticultural activities in proximity to the proposal.',
    )
    .fill('That');
  await inboxLoggedIn
    .getByLabel('What steps will you take to reduce potential negative impacts on surrounding agricultural lands?')
    .fill('The other');
  await inboxLoggedIn
    .getByLabel('Could this proposal be accommodated on lands outside of the ALR?')
    .fill('And another');
  await inboxLoggedIn.getByPlaceholder('Type total area').fill('1');
  await inboxLoggedIn
    .getByText('I confirm that all affected property owners with land in the ALR have been notif')
    .click();

  // File upload
  const proofOfServiceNoticeFileChooserPromise = inboxLoggedIn.waitForEvent('filechooser');
  await inboxLoggedIn.getByRole('button', { name: 'Choose file to Upload', exact: true }).nth(0).click();
  const proofOfServiceNoticeFileChooser = await proofOfServiceNoticeFileChooserPromise;
  proofOfServiceNoticeFileChooser.setFiles('data/temp.txt');

  // File upload
  const proposalMapFileChooserPromise = inboxLoggedIn.waitForEvent('filechooser');
  await inboxLoggedIn.getByRole('button', { name: 'Choose file to Upload', exact: true }).nth(1).click();
  const proposalMapFileChooser = await proposalMapFileChooserPromise;
  proposalMapFileChooser.setFiles('data/temp.txt');

  await inboxLoggedIn.getByText('Upload Attachments').click();

  // Step 7: Optional attachments
  // File upload first file
  const optionalFile1ChooserPromise = inboxLoggedIn.waitForEvent('filechooser');
  await inboxLoggedIn.getByRole('button', { name: 'Choose file to Upload', exact: true }).click();
  const optionalFile1Chooser = await optionalFile1ChooserPromise;
  optionalFile1Chooser.setFiles('data/temp.txt');
  await inboxLoggedIn.getByPlaceholder('Select a type').nth(0).click();
  await inboxLoggedIn.getByText('Professional Report').click();
  await inboxLoggedIn.getByPlaceholder('Type description').nth(0).fill('Desc');

  // File upload second file
  const optionalFile2ChooserPromise = inboxLoggedIn.waitForEvent('filechooser');
  await inboxLoggedIn.getByRole('button', { name: 'Choose file to Upload', exact: true }).click();
  const optionalFile2Chooser = await optionalFile2ChooserPromise;
  optionalFile2Chooser.setFiles('data/temp.txt');
  await inboxLoggedIn.getByPlaceholder('Select a type').nth(1).click();
  await inboxLoggedIn.getByText('Site Photo').click();
  await inboxLoggedIn.getByPlaceholder('Type description').nth(1).fill('Desc');
});
