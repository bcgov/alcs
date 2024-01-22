import { MJMLParseResults } from 'mjml-core';
import { EmailTemplateService } from '../../../libs/common/src/email-template-service/email-template.service';
import { footer } from '../partials';
import * as config from 'config';

type SrwNoticeTemplateData = {
  contactName: string;
  status: string;
  dateSubmitted: string;
  fileNumber: string;
  submittersFileNumber: string;
  fileName: string;
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
  <mj-body width='600px'>
  <mj-section background-color="white" padding="40px 0px 0px 0px">
    <mj-group>
      <mj-column width="66%">
        <mj-text font-size="21px"><b>Notification ID #SRW{{fileNumber}}</b></mj-text>
        <mj-text font-size="15px">Primary Contact: <b>{{contactName}}</b></mj-text>
        <mj-text font-size="15px">Status: <b>{{status}}</b></mj-text>
        <mj-text font-size="15px">{{dateSubmitted}}</mj-text>
        <mj-text font-size="15px">Submitter’s File Number: {{submittersFileNumber}}</mj-text>
      </mj-column>
      <mj-column width="34%">
        <mj-image
          align="right"
          width="86px"
          height="56px"
          src="${config.get<string>(
            'PORTAL.FRONTEND_ROOT',
          )}/assets/email/alc_logo.png"
        ></mj-image>
      </mj-column>
    </mj-group>
  </mj-section>

    <mj-section background-color='white' padding='24px 0px 48px 0px'>
      <mj-column width='600px' css-class='line-height'>
        <mj-text font-size='16px'>
          The ALC's attached PDF response is proof that the notification of statutory right of way has been provided for a s. 218 Statutory Right of Way of the <i>Land Title Act</i> as required by s.18.1(2) of the <i>Agricultural Land Commission Act</i>.
        </mj-text>
        <mj-text font-size='16px'>
          The ALC's attached PDF response must be appended as an additional document to the LTSA SRW application package.
        </mj-text>
        <mj-text font-size='16px'>
          <strong>Disclaimer for Transferee(s):</strong>
        </mj-text>
        <mj-text font-size='16px'>
          <strong>This letter is not an approval to use, construct, or remove soil or place fill (including gravel) within the SRW, nor does it compel the ALC to approve construction in the SRW.</strong> An application or notice of intent must be submitted to the ALC before starting any construction, fill placement, or soil removal within the SRW. Please consult the ALC for direction.
        </mj-text>
        <mj-text font-size='16px'>
          Please refer to ALC Notification ID SRW{{fileNumber}} in all future correspondence with this office. If you are acting on behalf of the transferee, it is your responsibility to advise your client(s) of this, and any future, correspondence.
        </mj-text>
        <mj-text font-size='16px'>
          Further correspondence with respect to this notification should be directed to <a href='mailto:ALC.LUPRT@gov.bc.ca'>ALC.LUPRT@gov.bc.ca</a>.
        </mj-text>
        <mj-text font-size='16px'>
          PROVINCIAL AGRICULTURAL LAND COMMISSION
        </mj-text>
        <mj-text font-size='16px'>
          Attachment: {{fileName}}
        </mj-text>
      </mj-column>
    </mj-section>

   ${footer}
  </mj-body>
</mjml>
`;

export const generateSRWTemplate = (
  data: SrwNoticeTemplateData,
): MJMLParseResults => {
  return new EmailTemplateService().generateEmailBase(template, data);
};
