import * as config from 'config';
import { MJMLParseResults } from 'mjml-core';
import { EmailTemplateService } from '../../libs/common/src/email-template-service/email-template.service';

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
    <mj-section background-color="white" padding="40px 0px 0px 0px">
      <mj-column width="400px">
        <mj-text font-size="21px"><b>Application ID #{{fileNumber}}</b></mj-text>
        <mj-text font-size="15px">Applicant: <b>{{applicantName}}</b></mj-text>
        <mj-text font-size="15px">Status: <b>{{status}}</b></mj-text>
      </mj-column>
      <mj-column width="200px">
        <mj-image align="right" width="86px" height="56px" src="${config.get<string>(
          'PORTAL.FRONTEND_ROOT',
        )}/assets/email/alc_logo.png"></mj-image>
      </mj-column>
    </mj-section>

    <mj-section background-color="white" padding="48px 0px 48px 0px">
      <mj-column width="600px" css-class='line-height'>
        <mj-text font-size='16px'>
          This email is to advise that the above noted <b>{{applicationType}}</b> application has been received by the {{governmentName}} for review.
        </mj-text>
        <mj-text font-size='16px'>
          If you have not already done so, please contact {{governmentName}} to determine the preferred form of payment as the application may not be processed until payment is received.
        </mj-text>
        <mj-text font-size='16px'>
          If you are an agent acting on behalf of the landowner(s), it is your responsibility to advise your client(s) of this, and any future, correspondence.
        </mj-text>
        <mj-text font-size='16px'>
          Login to the Agricultural Land Commission Application Portal for further updates on your application as it progresses through the application process.
        </mj-text>
        <mj-text font-size='16px'>
          This is an ALC Application Portal notification only. Please do not reply to this email.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="white" padding="0px 0px 72px 0px">
      <mj-column width="600px" css-class='line-height'>
        <mj-button
          width="272px"
          height="43px" 
          font-size="16px"
          css-class='align-left'
          background-color="#065A2F"
          color='white'
          href="https://alcs-dev-portal.apps.silver.devops.gov.bc.ca">
            GO TO APPLICATION PORTAL
          </mj-button>
      </mj-column>
    </mj-section>

    <mj-section background-color="#FBE0D1" padding="0px">
      <mj-column width="400px" css-class='line-height'>
        <mj-text><a href="https://www.alc.gov.bc.ca/" target="_blank"> Provincial Agricultural Land Commission (gov.bc.ca) </a></mj-text>
      </mj-column>
      <mj-column width="200px" css-class='line-height'>
      <mj-text> Contact: <a href='tel:604-660-7000'> 604-660-7000 </a></mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

export const generateStatusHtml = (
  data: StatusUpdateEMail,
): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
