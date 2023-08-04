import { MJMLParseResults } from 'mjml-core';
import { EmailTemplateService } from '../../libs/common/src/email-template-service/email-template.service';
import { header, footer, notificationOnly, portalButton } from './partials';

export interface StatusUpdateEMail {
  fileNumber: string;
  applicantName: string;
  status: string;
  applicationType: string;
  governmentName: string;
}

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
          This email is to advise that the above noted <b>{{applicationType}}</b> application has been received by the {{governmentName}} for review.
        </mj-text>
        <mj-text font-size='16px'>
          If you have not already done so, please contact the {{governmentName}} to determine the preferred form of payment as the application may not be processed until payment is received.
        </mj-text>
        <mj-text font-size='16px'>
          If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise your client(s) of this, and any future, correspondence.
        </mj-text>
        <mj-text font-size='16px'>
          Login to the ALC Portal for further updates on your application as it progresses through the application process.
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
