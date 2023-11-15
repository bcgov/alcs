import { MJMLParseResults } from 'mjml-core';
import { StatusUpdateEmail } from '../../../apps/alcs/src/providers/email/status-email.service';
import { EmailTemplateService } from '../../../libs/common/src/email-template-service/email-template.service';
import { header, footer, notificationOnly, portalButton } from '../partials';

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
          This email is to advise that the {{ governmentName }}'s review of the above noted {{ childType }} application requires further attention. The ALC has returned the application to the {{ governmentName }} for their action.
        </mj-text>
        <mj-text font-size='16px'>
          Please login to the ALC Portal to view the ALC's comments for the {{ governmentName }}.
        </mj-text>
        ${notificationOnly}
      </mj-column>
    </mj-section>

   ${portalButton}

   ${footer}
  </mj-body>
</mjml>
`;

export const generateINCGApplicationHtml = (
  data: StatusUpdateEmail,
): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
