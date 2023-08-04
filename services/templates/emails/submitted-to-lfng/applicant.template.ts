import { MJMLParseResults } from 'mjml-core';
import { EmailTemplateService } from '../../../libs/common/src/email-template-service/email-template.service';
import { header, footer, notificationOnly, portalButton } from '../partials';

export interface StatusUpdateEMail {
  fileNumber: string;
  applicantName: string;
  status: string;
  applicationType: string;
  governmentName: string;
}

const appFees = [
  { type: 'Exclusion', fee: 750 },
  { type: 'Subdivision', fee: 750 },
  { type: 'Non-Farm Use', fee: 750 },
  { type: 'Non-Adhering Residential Use', fee: 450 },
  { type: 'Soil or Fill Use', fee: 750 },
  { type: 'Inclusion', fee: 0 },
];

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
          This email is to acknowledge that you have submitted the above noted  <b>{{ applicationType }}</b> application to the {{ governmentName }}.
        </mj-text>
        <mj-table>
          <tr style="text-align: left; font-size: 16px">
            <th>Application Type</th>
            <th style="padding-left: 16px">{{ governmentName }} Portion of Fee</th>
          </tr>
          ${appFees
            .map((a) => {
              return `
              <tr style="font-size: 16px">
                <td>${a.type}</td>
                <td style="padding-left: 16px">$${a.fee}</td>
              </tr>
              `;
            })
            .join('')}

        </mj-table>
        <mj-text font-size='16px'>
        Contact the {{ governmentName }} for its payment options. Please include your assigned Application ID with your payment. 
        </mj-text>
        <mj-text font-size='16px'>
          NOTE: There is no additional fee for re-submission if the {{ governmentName }} returns your application.
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

export const generateStatusHtml = (
  data: StatusUpdateEMail,
): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
