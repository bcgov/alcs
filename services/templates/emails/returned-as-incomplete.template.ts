import { MJMLParseResults } from 'mjml-core';
import { EmailTemplateService } from '../../libs/common/src/email-template-service/email-template.service';
import { header, footer, notificationOnly, portalButton } from './partials';
import { StatusUpdateEmail } from '../../apps/alcs/src/providers/email/email.service';

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
          This email is to advise that the above noted <b>{{ applicationType }}</b> application is considered to be incomplete by the <b>{{ governmentName }}</b> and consequently it has been returned to the applicant.
        </mj-text>
        <mj-text font-size='16px'>
          Please login to the ALC Portal to view the comments left by the {{ governmentName }}. Please review, edit and re-submit the application.
        </mj-text>
        <mj-text font-size='16px'>
          NOTE: Re-submitted applications do not require an additional application fee.
        </mj-text>
        <mj-text font-size='16px'>
          If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise your client(s) of this, and any future, correspondence.
        </mj-text>
        ${notificationOnly}
      </mj-column>
    </mj-section>

   ${portalButton}

   ${footer}
  </mj-body>
</mjml>
`;

export const generateINCMHtml = (data: StatusUpdateEmail): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
