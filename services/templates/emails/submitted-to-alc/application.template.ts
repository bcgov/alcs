import { build } from '..';
import { feesTable } from '../partials/fees-table.template';
import { notificationOnly } from '../partials/notification-only.template';
import { appFees } from '../submitted-to-lfng/applicant.template';

export const template = build(
  `<p>
      Agricultural Land Commission <b>{{ childType }}</b> Application ID: <b>{{ fileNumber }} ({{ applicantName }})</b> has been reviewed by the <b>{{ governmentName }}</b> and submitted to the Agricultural Land Commission for further review.
    </p>
    <p>
      APPLICATION FEES - Payable to the Minister of Finance c/o the ALC
    </p>
    ${feesTable('Application Type', 'ALC Portion of Fee', appFees)}
    <p>
      This fee can be paid:
      <ol style="list-style-position: inside; padding: 0; margin: 0;">
        <li style="margin: 0">Cheque: Made payable to the Minister of Finance c/o the ALC</li>
        <li style="margin: 0">Credit card: Over the phone or in-person</li>
      </ol>
    </p>
    <p>
      Please include your assigned Application ID with your payment.
    </p>
    <p>
      Mailing address:
      <br />
      Agricultural Land Commission
      <br />
      201-4940 Canada Way
      <br />
      Burnaby, BC, Canada
      <br />
      V5G 4K6
      <br />
    </p>
    <p>
      Paying via telephone:
      <br />
      Tel: <a href="tel:6046607000">604-660-7000</a>
      <br />
    </p>
    <p>
      If you are making a long-distance call to a provincial government agency, you can place your call through Enquiry BC free of charge:
      <br />
      In Victoria call: <a href="tel:2503876121">250-387-6121</a>
      <br />
      Elsewhere in BC call: <a href="tel:18006637867">1-800-663-7867</a>
      <br />
    </p>
    <p>
      The length of processing time for each application varies depending on the type of application, statutory requirements within the Agricultural Land Commission Act, information provided, necessity for site visit or applicant meetings, etc.
    </p>
    <p>
      Please be advised that the Status of the application in the ALC Portal will update and a notification email will be sent out as the application moves through each stage of the application review process. Should the ALC Land Use Planner require any additional information or clarification regarding the application, they will contact you. Further information about the application process can be obtained from the ALC website.
    </p>
    <p>
      If you are an agent acting on behalf of the applicant(s) / landowner(s), it is your responsibility to advise them of this, and any future, correspondence.
    </p>
    <p>
      Please log into the ALC Portal for further updates on the application as it progresses.
    </p>
    ${notificationOnly}`,
);
