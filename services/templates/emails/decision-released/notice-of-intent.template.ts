import { MJMLParseResults } from 'mjml-core';
import { StatusUpdateEmail } from '../../../apps/alcs/src/providers/email/status-email.service';
import { EmailTemplateService } from '../../../libs/common/src/email-template-service/email-template.service';
import { footer, header, notificationOnly, portalButton } from '../partials';

type DecisionReleasedStatusEmail = StatusUpdateEmail & {
  decisionDate: number;
};

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
        The decision for the above noted Notice of Intent (NOI) has been released on the the ALC Portal. 
        </mj-text>
        <mj-text font-size='16px'>
          The decision document can be found by clicking 'View' from the NOI Inbox table in the ALC Portal, and then navigating to the 'ALC Review and Decision' tab. The decision will also be available to the public.
        </mj-text>
        <mj-text font-size='16px'>
          Further correspondence with respect to this NOI should be directed to <a href="mailto:ALC.Soil@gov.bc.ca">ALC.Soil@gov.bc.ca</a>. 
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

export const generateALCDNoticeOfIntentHtml = (
  data: DecisionReleasedStatusEmail,
): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
