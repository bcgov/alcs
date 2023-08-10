import { MJMLParseResults } from 'mjml-core';
import { EmailTemplateService } from '../../../libs/common/src/email-template-service/email-template.service';
import { header, footer, notificationOnly, portalButton } from '../partials';
import {
  StatusUpdateEmail,
  appFees,
} from '../../../apps/alcs/src/providers/email/email.service';

const template = `<mjml>
  <mj-head>
    <mj-style>
      .line-height div {
        line-height: 24px !important;
      }

      .align-left {
        float: left !important;
      }
    </mj-style>
  </mj-head>
  <mj-body width="600px">
    ${header}

    <mj-section background-color="white" padding="48px 0px 48px 0px">
      <mj-column width="600px" css-class='line-height'>
        <mj-text font-size='16px'>
          Agricultural Land Commission <b>{{ applicationType }}</b> Application ID: <b>{{ fileNumber }} ({{ applicantName }})</b> has been reviewed by <b>{{ governmentName }}</b> and submitted to the Agricultural Land Commission for further review.
        </mj-text>
        <mj-text font-size='16px'>
          APPLICATION FEES - Payable to the Minister of Finance c/o the ALC
        </mj-text>
        <mj-table>
          <tr style="text-align: left; font-size: 16px; border: 1px solid black;">
            <th style="padding-left: 8px; border-right: 1px solid black;">Application Type</th>
            <th style="padding-left: 8px">ALC Portion of Fee</th>
          </tr>
          ${appFees
            .map((a) => {
              return `
              <tr style="font-size: 16px; border: 1px solid black;">
                <td style="padding-left: 8px; border-right: 1px solid black;">${a.type}</td>
                <td style="padding-left: 8px">$${a.fee}</td>
              </tr>
              `;
            })
            .join('')}
        </mj-table>
        <mj-text font-size='16px'>
          This fee can be paid:
          <ol style="list-style-position: inside; padding: 0; margin: 0;">
            <li>Cheque: Made payable to the Minister of Finance c/o the ALC</li>
            <li>Credit card: Over the phone or in-person</li>
          </ol>
        </mj-text>
        <mj-text font-size='16px'>
          Please include your assigned Application ID with your payment.
        </mj-text>
        <mj-text font-size='16px'>
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            <li>Mailing address:</li>
            <li>Agricultural Land Commission</li>
            <li>201-4940 Canada Way</li>
            <li>Burnaby, BC, Canada</li>
            <li>V5G 4K6</li>
          </ul>
        </mj-text>
        <mj-text font-size='16px'>
          <ul style="list-style-type: none; padding: 0; margin: 0">
            <li>Paying via telephone:</li>
            <li>Tel: <a href="tel:6046607000">604-660-7000</a></li>
          </ul>
        </mj-text>
        <mj-text font-size='16px'>
        <ul style="list-style-type: none; padding: 0; margin: 0;">
        <li>If you are making a long-distance call to a provincial government agency, you can place your call through Enquiry BC free of charge:</li>
        <li>In Victoria call: <a href="tel:2503876121">250-387-6121</a></li>
        <li>Elsewhere in BC call: <a href="tel:18006637867">1-800-663-7867</a></li>
        </ul>
        </mj-text>
        <mj-text font-size='16px'>
          The length of processing time for each application varies depending on the type of application, statutory requirements within the Agricultural Land Commission Act, information provided, necessity for site visit or applicant meetings, etc.
        </mj-text>
        <mj-text font-size='16px'>
          Please be advised that the Status of the application in the ALC Portal will update and a notification email will be sent out as the application moves through each stage of the application review process. Should the ALC Land Use Planner require any additional information or clarification regarding the application, they will contact you. Further information about the application process can be obtained from the ALC website.
        </mj-text>
        <mj-text font-size='16px'>
          If you are an agent acting on behalf of the applicant(s) / landowner(s), it is your responsibility to advise them of this, and any future, correspondence.
        </mj-text>
        <mj-text font-size='16px'>
          Please log into the ALC Portal for further updates on the application as it progresses.
        </mj-text>
        ${notificationOnly}
      </mj-column>
    </mj-section>

   ${portalButton}

   ${footer}
  </mj-body>
</mjml>
`;

export const generateSUBMApplicantHtml = (
  data: StatusUpdateEmail,
): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
