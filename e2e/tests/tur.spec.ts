import { test } from '@playwright/test';
import { PortalLoginPage } from './pages/portal/portal-login-page';
import { ApplicationType, InboxPage } from './pages/portal/inbox-page';
import { PortalStepsNavigation } from './pages/portal/portal-steps-navigation';
import { OwnerType, ParcelType, ParcelsPage } from './pages/portal/parcels-page';
import { OtherParcelsPage } from './pages/portal/other-parcels-page';
import { PrimaryContactPage, PrimaryContactType } from './pages/portal/primary-contact-page';
import { GovernmentPage } from './pages/portal/government-page';
import { Direction, LandUsePage, LandUseType } from './pages/portal/land-use-page';
import { TURProposalPage } from './pages/portal/tur-proposal-page';
import { OptionalAttachmentType, OptionalAttachmentsPage } from './pages/portal/optional-attachments-page';
import { ReviewAndSubmitPage } from './pages/portal/review-and-submit-page/review-and-submit-page';
import { SubmissionSuccessPage } from './pages/portal/submission-success-page';
import { ALCSLoginPage } from './pages/alcs/alcs-login-page';
import { ALCSHomePage } from './pages/alcs/home-page';
import { ALCSDetailsNavigation } from './pages/alcs/details-navigation';
import { ALCSApplicantInfoPage } from './pages/alcs/applicant-info-page/applicant-info-page';

test.describe.serial('Portal TUR submission and ALCS applicant info flow', () => {
  const parcels = [
    {
      type: ParcelType.FeeSimple,
      legalDescription: 'Legal description 1',
      mapArea: '1',
      pid: '111-111-111',
      year: '2014',
      month: 'Apr',
      day: '21',
      isFarm: true,
      civicAddress: '123 Street Rd',
      certificateOfTitlePath: 'data/temp.txt',
      isConfirmed: true,
      owners: [
        {
          type: OwnerType.Individual,
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '(111) 111-1111',
          email: '1@1',
        },
        {
          type: OwnerType.Organization,
          organization: 'Company X',
          corporateSummaryPath: 'data/temp.txt',
          firstName: 'Jane',
          lastName: 'Doe',
          phoneNumber: '(222) 222-2222',
          email: '2@2',
        },
      ],
    },
  ];
  const otherParcelsDescription = 'Other parcels description';
  const hasOtherParcels = true;
  const primaryContactType = PrimaryContactType.ThirdParty;
  const thirdPartPrimaryContact = {
    firstName: 'Person',
    lastName: 'Human',
    phoneNumber: '(555) 555-5555',
    email: '1@1',
  };
  const authorizationLetterPaths = ['data/temp.txt', 'data/temp2.txt'];
  const government = 'Peace River Regional District';
  const landUse = {
    currentAgriculture: 'Current agriculture',
    improvements: 'Improvements',
    otherUses: 'Other uses',
    neighbouringLandUse: new Map([
      [
        Direction.North,
        {
          type: LandUseType.Agricultural,
          activity: 'Doing agriculture',
        },
      ],
      [
        Direction.East,
        {
          type: LandUseType.Civic,
          activity: 'Doing agriculture',
        },
      ],
      [
        Direction.South,
        {
          type: LandUseType.Commercial,
          activity: 'Doing agriculture',
        },
      ],
      [
        Direction.West,
        {
          type: LandUseType.Industrial,
          activity: 'Doing agriculture',
        },
      ],
    ]),
  };
  const turProposal = {
    purpose: 'To do stuff',
    activities: 'Doing stuff',
    stepsToReduceImpact: 'Steps 1, 2, and 3',
    alternativeLand: 'This land over here',
    totalArea: '1',
    isConfirmed: true,
    proofOfServingNoticePath: 'data/temp.txt',
    proposalMapPath: 'data/temp2.txt',
  };
  const optionalAttachments = [
    {
      path: 'data/temp.txt',
      type: OptionalAttachmentType.SitePhoto,
      description: 'Some site photo',
    },
    {
      path: 'data/temp2.txt',
      type: OptionalAttachmentType.ProfessionalReport,
      description: 'Some professional report',
    },
  ];

  let submittedFileId: string;

  test('should have working UI, data should populate review, and submission should succeed', async ({ page }) => {
    const portalLoginPage = new PortalLoginPage(page, process.env.PORTAL_BASE_URL);
    await portalLoginPage.goto();
    await portalLoginPage.logIn(process.env.BCEID_BASIC_USERNAME, process.env.BCEID_BASIC_PASSWORD);

    const inboxPage = new InboxPage(page);
    await inboxPage.createApplication(ApplicationType.TUR);

    const portalStepsNavigation = new PortalStepsNavigation(page);

    const parcelsPage = new ParcelsPage(page);
    await parcelsPage.fill(parcels);

    await portalStepsNavigation.gotoOtherParcelsPage();

    const otherParcelsPage = new OtherParcelsPage(page);
    await otherParcelsPage.setHasOtherParcels(hasOtherParcels);
    await otherParcelsPage.fillDescription(otherParcelsDescription);

    await portalStepsNavigation.gotoPrimaryContactPage();

    const primaryContactPage = new PrimaryContactPage(page);
    await primaryContactPage.setPrimaryContactType(primaryContactType);
    await primaryContactPage.fillThirdPartyContact(thirdPartPrimaryContact);
    await primaryContactPage.uploadAuthorizationLetters(authorizationLetterPaths);

    await portalStepsNavigation.gotoGovernmentPage();

    const governmentPage = new GovernmentPage(page);
    await governmentPage.fill(government);

    await portalStepsNavigation.gotoLandUsePage();

    const landUsePage = new LandUsePage(page);
    await landUsePage.fill(landUse);

    await portalStepsNavigation.gotoProposalPage();

    const turProposalPage = new TURProposalPage(page);
    await turProposalPage.fill(turProposal);

    await portalStepsNavigation.gotoOptionalAttachmentsPage();

    const optionalAttachmentsPage = new OptionalAttachmentsPage(page);
    await optionalAttachmentsPage.addAttachments(optionalAttachments);

    await portalStepsNavigation.gotoReviewAndSubmitPage();

    const reviewAndSubmitPage = new ReviewAndSubmitPage(page);
    await reviewAndSubmitPage.parcelsSection.expectParcels(parcels);
    await reviewAndSubmitPage.otherOwnedParcelsSection.expectHasOtherParcels(hasOtherParcels);
    await reviewAndSubmitPage.otherOwnedParcelsSection.expectDescription(otherParcelsDescription);
    await reviewAndSubmitPage.primaryContactSection.expectThirdPartyContact(thirdPartPrimaryContact);
    await reviewAndSubmitPage.primaryContactSection.expectAuthorizationLetters(authorizationLetterPaths);
    await reviewAndSubmitPage.governmentSection.expectGovernment(government);
    await reviewAndSubmitPage.landUseSection.expectLandUse(landUse);
    await reviewAndSubmitPage.turProposalSection.expectProposal(turProposal);
    await reviewAndSubmitPage.optionalDocumentsSection.expectAttachments(optionalAttachments);
    await reviewAndSubmitPage.submit();

    const submissionSuccessPage = new SubmissionSuccessPage(page);
    submittedFileId = await submissionSuccessPage.fileId();
  });

  test('submission data should appear in ALCS applicant info', async ({ page }) => {
    const alcsLoginPage = new ALCSLoginPage(page, process.env.ALCS_BASE_URL);
    await alcsLoginPage.goto();
    await alcsLoginPage.login(process.env.IDIR_USERNAME, process.env.IDIR_PASSWORD);

    const alcsHomePage = new ALCSHomePage(page);
    await alcsHomePage.search(submittedFileId);

    const alcsDetailsNavigation = new ALCSDetailsNavigation(page);
    await alcsDetailsNavigation.gotoApplicantInfoPage();

    const alcsApplicantInfoPage = new ALCSApplicantInfoPage(page);
    await alcsApplicantInfoPage.parcelsSection.expectParcels(parcels);
    await alcsApplicantInfoPage.otherOwnedParcelsSection.expectHasOtherParcels(hasOtherParcels);
    await alcsApplicantInfoPage.otherOwnedParcelsSection.expectDescription(otherParcelsDescription);
    await alcsApplicantInfoPage.primaryContactSection.expectThirdPartyContact(thirdPartPrimaryContact);
    await alcsApplicantInfoPage.primaryContactSection.expectAuthorizationLetters(authorizationLetterPaths);
    await alcsApplicantInfoPage.landUseSection.expectLandUse(landUse);
    await alcsApplicantInfoPage.turProposalSection.expectProposal(turProposal);
    await alcsApplicantInfoPage.optionalDocumentsSection.expectAttachments(optionalAttachments);
  });
});
