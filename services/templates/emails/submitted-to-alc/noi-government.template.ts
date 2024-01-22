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
          Agricultural Land Commission <b>{{ childType }}</b> NOI ID: <b>{{ fileNumber }} ({{ applicantName }})</b> has been successfully submitted to the Agricultural Land Commission. A read-only copy of the Notice of Intent (NOI) has been submitted to the <b>{{ governmentName }}</b> for informational purposes. Should the {{ governmentName}} wish to comment on the NOI, please submit comments directly to the ALC. 
        </mj-text>
        <mj-text font-size='16px'>
          Please log into the ALC Portal to view the NOI.
        </mj-text>
        ${notificationOnly}
      </mj-column>
    </mj-section>

   ${portalButton}

   ${footer}
  </mj-body>
</mjml>
`;

export const generateSUBMNoiGovernmentHtml = (
  data: StatusUpdateEmail,
): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
