import { MJMLParseResults } from 'mjml-core';
import {
  DocumentEmailData,
  StatusUpdateEmail,
} from '../../../apps/alcs/src/providers/email/status-email.service';
import { EmailTemplateService } from '../../../libs/common/src/email-template-service/email-template.service';
import { header, footer, notificationOnly, portalButton } from '../partials';

type DecisionReleasedStatusEmail = StatusUpdateEmail & {
  documents: DocumentEmailData[];
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
          This email is to advise that the Reasons for Decision for the above noted application has been released.
        </mj-text>
        <mj-text font-size='16px'>
          You can access the decision document by clicking the link(s) below:
        </mj-text>
        <mj-text font-size='16px'>
          <ul style="list-style-position: inside; padding: 0; margin: 0;">
           {{#each documents}}
            <li><a href={{url}}>{{name}}</a></li>
           {{/each}}
          </ul>
        </mj-text>
        <mj-text font-size='16px'>
          The decision can also be accessed via the ALC Portal and Public Search tool.
        </mj-text>
        <mj-text font-size='16px'>
          Further correspondence with respect to this application should be directed to the ALC Land Use Planner for your region, found on the ALC website <a href="https://www.alc.gov.bc.ca/contact#land-use-planner" target="_blank">Contact Us</a> page. 
        </mj-text>
        <mj-text font-size='16px'>
          If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise them of this, and any future, correspondence.
        </mj-text>
        ${notificationOnly}
      </mj-column>
    </mj-section>

   ${portalButton}

   ${footer}
  </mj-body>
</mjml>
`;

export const generateALCDApplicationHtml = (
  data: DecisionReleasedStatusEmail,
): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
