import { MJMLParseResults } from 'mjml-core';
import { StatusUpdateEmail } from '../../../apps/alcs/src/providers/email/status-email.service';
import { EmailTemplateService } from '../../../libs/common/src/email-template-service/email-template.service';
import { header, footer, notificationOnly, portalButton } from '../partials';
import { appFees } from './applicant.template';

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
          Agricultural Land Commission <b>{{ childType }}</b> Application ID: <b>{{ fileNumber }} ({{ applicantName }})</b> has been successfully submitted to the <b>{{ governmentName }}</b>. The Applicant has been instructed to contact the {{ governmentName }} for payment instructions regarding the applicable application fee.
        </mj-text>
        <mj-table>
          <tr style="text-align: left; font-size: 16px; border: 1px solid black;">
            <th style="padding-left: 8px; border-right: 1px solid black;">Application Type</th>
            <th style="padding-left: 8px">{{ governmentName }} Portion of Fee</th>
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
          Please log into the ALC Portal to view the application.
        </mj-text>
        ${notificationOnly}
      </mj-column>
    </mj-section>

   ${portalButton}

   ${footer}
  </mj-body>
</mjml>
`;

export const generateSUBGGovernmentHtml = (
  data: StatusUpdateEmail,
): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
