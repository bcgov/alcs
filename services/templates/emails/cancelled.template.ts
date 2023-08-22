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
          This email is to advise that the above noted <b>{{ childType }}</b> application has been cancelled and will not be considered further.
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

export const generateCANCHtml = (data: StatusUpdateEmail): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
