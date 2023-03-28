import { test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:4201/");
  await page.goto("http://localhost:4201/login");
  await page.getByRole("button", { name: "Login with BCeID" }).click();
  await page.locator("#user").click();
  await page.locator("#user").fill("MekhtiHuseinov");
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill("#replace#");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue to inbox" }).click();
  await page.getByRole("button", { name: "+ Create New" }).click();
  await page
    .getByRole("dialog", { name: "Create New" })
    .getByText("Application")
    .click();
  await page.getByRole("button", { name: "Next" }).click();
  await page
    .getByText(
      "Transportation, Utility, or Recreational Trail Uses within the ALR"
    )
    .click();
  await page.getByRole("button", { name: "create" }).click();
  await page
    .locator("section")
    .filter({
      hasText:
        "Application Edit Application 1. Identify Parcel(s) Under Application 2. Other Pa",
    })
    .getByRole("button", { name: "Edit Application" })
    .click();
  await page.getByRole("button", { name: "Fee Simple" }).click();
  await page.getByPlaceholder("Enter legal description").click();
  await page.getByPlaceholder("Enter legal description").fill("1");
  await page
    .locator(
      "div:nth-child(3) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix"
    )
    .click();
  await page.getByPlaceholder("Enter parcel size").fill("1");
  await page.getByPlaceholder("Enter PID").click();
  await page.getByPlaceholder("Enter PID").fill("111-111-111");
  await page.getByRole("button", { name: "Open calendar" }).click();
  await page
    .locator("td:nth-child(3) > .mat-calendar-body-cell")
    .first()
    .click();
  await page.getByRole("button", { name: "March 23, 2023" }).click();
  await page.getByRole("button", { name: "Yes" }).click();
  await page.setInputFiles(
    "input.file-input",
    "/Users/mekhti/Desktop/Screen Shot 2022-07-13 at 11.53.19 AM.png"
  );
  await page
    .locator(
      ".container > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix"
    )
    .click();
  await page
    .getByRole("option", { name: "No owner matching search Add new owner" })
    .getByRole("button", { name: "Add new owner" })
    .click();
  await page
    .locator(
      ".ng-untouched > .form-row > div:nth-child(2) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix"
    )
    .click();
  await page.getByPlaceholder("Enter First Name").fill("1");
  await page.getByPlaceholder("Enter Last Name").click();
  await page.getByPlaceholder("Enter Last Name").fill("1");
  await page
    .locator(
      ".mat-mdc-dialog-content > form > .form-row > div:nth-child(4) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix"
    )
    .click();
  await page.getByPlaceholder("(555) 555-5555").fill("(111) 111-11111");
  await page.getByPlaceholder("Enter Email").click();
  await page.getByPlaceholder("Enter Email").fill("11@11");
  await page.getByRole("button", { name: "Add" }).click();
  await page
    .getByLabel(
      "I confirm that the owner information provided above matches the current Certificate of Title. Mismatched information can cause significant delays to processing time."
    )
    .check();
  await page.getByRole("button", { name: "Next Step" }).click();
  await page.locator("#mat-button-toggle-11-button").click();
  await page.getByText("Primary Contact").click();
  await page
    .locator(
      "#appBody > app-create-application > app-custom-stepper > section > div:nth-child(4) > app-primary-contact > section:nth-child(2) > div.contacts > button"
    )
    .first()
    .click();
  await page.getByText("4").first().click();
  await page.getByPlaceholder("Type government").click();
  await page.getByPlaceholder("Type government").fill("peace");
  await page.getByText("Peace River Regional District").click();
  await page.getByText("5").first().click();
  await page
    .getByLabel(
      "Quantify and describe in detail all agriculture that currently takes place on the parcel(s)."
    )
    .click();
  await page
    .getByLabel(
      "Quantify and describe in detail all agriculture that currently takes place on the parcel(s)."
    )
    .fill("1");
  await page
    .locator(
      "div:nth-child(2) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix"
    )
    .first()
    .click();
  await page
    .getByLabel(
      "Quantify and describe in detail all agricultural improvements made to the parcel(s)."
    )
    .fill("2");
  await page
    .getByLabel(
      "Quantify and describe all non-agricultural uses that currently take place on the parcel(s)."
    )
    .click();
  await page
    .getByLabel(
      "Quantify and describe all non-agricultural uses that currently take place on the parcel(s)."
    )
    .fill("3");
  await page
    .locator(
      ".land-use-type > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix"
    )
    .first()
    .click();
  await page.getByRole("option", { name: "Other" }).click();
  await page
    .locator("#mat-select-value-5")
    .getByText("Main Land Use Type")
    .click();
  await page.getByText("Industrial").first().click();
  await page.locator("#mat-select-value-7").click();
  await page.getByText("Civic / Institutional").first().click();
  await page.locator("#mat-select-value-9").click();
  await page
    .getByRole("option", { name: "Agricultural / Farm" })
    .first()
    .click();
  await page.locator("#northLandUseTypeDescription").click();
  await page.locator("#northLandUseTypeDescription").fill("4");
  await page.locator("#eastLandUseTypeDescription").click();
  await page.locator("#eastLandUseTypeDescription").fill("5");
  await page
    .locator(
      "div:nth-child(3) > .land-use-type-wrapper > .full-width-input > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix"
    )
    .click();
  await page.locator("#southLandUseTypeDescription").click();
  await page.locator("#southLandUseTypeDescription").fill("5");
  await page
    .locator(
      "div:nth-child(4) > .land-use-type-wrapper > .full-width-input > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix"
    )
    .click();
  await page.locator("#westLandUseTypeDescription").fill("5");
  await page.getByRole("button", { name: "Next Step" }).click();
  await page.getByLabel("What is the purpose of the proposal?").click();
  await page.getByLabel("What is the purpose of the proposal?").fill("6");
  await page
    .getByLabel(
      "Specify any agricultural activities such as livestock operations, greenhouses or horticultural activities in proximity to the proposal."
    )
    .click();
  await page
    .getByLabel(
      "Specify any agricultural activities such as livestock operations, greenhouses or horticultural activities in proximity to the proposal."
    )
    .fill("6");
  await page
    .getByLabel(
      "What steps will you take to reduce potential negative impacts on surrounding agricultural lands?"
    )
    .click();
  await page
    .getByLabel(
      "What steps will you take to reduce potential negative impacts on surrounding agricultural lands?"
    )
    .fill("6");
  await page.getByRole("textbox", { name: "Type comment" }).click();
  await page.getByRole("textbox", { name: "Type comment" }).fill("6");
  await page.getByPlaceholder("Type total area").click();
  await page.getByPlaceholder("Type total area").fill("6");
  await page
    .getByLabel(
      "I confirm that all affected property owners with land in the ALR have been notified."
    )
    .check();
  await page.setInputFiles(
    "#proof-of-serving > input",
    "/Users/mekhti/Desktop/Screen Shot 2022-07-13 at 11.53.19 AM.png"
  );

  await page.setInputFiles(
    "#proposal-map > input",
    "/Users/mekhti/Desktop/Screen Shot 2022-07-13 at 11.53.19 AM.png"
  );
  await page.getByRole("button", { name: "Next Step" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Review & Submit$/ })
    .click();
  await page.getByRole("button", { name: "Save and Exit" }).click();
});
