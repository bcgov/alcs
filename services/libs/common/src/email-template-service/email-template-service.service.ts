import { Injectable } from '@nestjs/common';
import { compile } from 'handlebars';
import * as mjml2html from 'mjml';
import { MJMLParseResults, MJMLParsingOptions } from 'mjml-core';
import alcsLogoBase64 from './alcs-logo.base64';

const templateTest = `<mjml>
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
      <mj-image align="right" width="86px" height="56px" src="data:image/jpeg;base64, ${alcsLogoBase64}"</mj-image>
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
        <mj-button width="272px" height="43px" font-size="16px" css-class='align-left' background-color="#065A2F" href="#">GO TO ALCS PORTAL</mj-button>
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

@Injectable()
export class EmailTemplateServiceService {
  generateEmail(
    templateMjml: string,
    options: MJMLParsingOptions,
  ): MJMLParseResults {
    // const htmlOutput = mjml2html(template, options);

    // prepare template
    const compiledTemplate = compile(templateTest);
    // insert data
    const mjml = compiledTemplate({
      fileNumber: '100093',
      applicantName: 'Mekhti Huseinov',
      status: 'Submitted to L/FNG',
    });

    // render mjml -> html
    const htmlOutput = mjml2html(mjml, options);

    console.log(htmlOutput.html);

    return htmlOutput;
  }
}
