import * as config from 'config';
import { MJMLParseResults } from 'mjml-core';
import { EmailTemplateService } from '../../libs/common/src/email-template-service/email-template.service';
export interface TestEmail {
  fileNumber: string;
  applicantName: string;
  status: string;
}

const testsTemplate = `<mjml>
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
        )}/assets/alc_logo.png"</mj-image>
        </mj-column>
      </mj-section>
  
      <mj-section background-color="white" padding="48px 0px 48px 0px">
        <mj-column width="600px" css-class='line-height'>
          <mj-text font-size='16px'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum enim eget magna efficitur, eu semper augue semper. Aliquam erat volutpat. Cras id dui lectus. Vestibulum sed finibus lectus, sit amet suscipit nibh. Proin nec commodo purus.
            Sed eget nulla elit. Nulla aliquet mollis faucibus.</mj-text>
        </mj-column>
      </mj-section>
  
      <mj-section background-color="white" padding="0px 0px 72px 0px">
        <mj-column width="600px" css-class='line-height'>
          <mj-button width="272px" height="43px" font-size="16px" css-class='align-left' background-color="#065A2F" color='white' href="https://alcs-dev-portal.apps.silver.devops.gov.bc.ca">GO TO ALCS PORTAL</mj-button>
        </mj-column>
      </mj-section>
  
      <mj-section background-color="#FBE0D1" padding="0px">
        <mj-column width="400px" css-class='line-height'>
        <mj-text><a href="https://www.alc.gov.bc.ca/" target="_blank"> Provincial Agricultural Land Commission (gov.bc.ca) </a></mj-text>
  
        </mj-column>
        <mj-column width="200px" css-class='line-height'>
        <mj-text> Contact: <a href='' > 604-660-7000 </a> </mj-text>
        </mj-column>
      </mj-section>
  
    </mj-body>
  </mjml>`;

export const generateTemplate = (data: TestEmail): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(testsTemplate, data);
};
