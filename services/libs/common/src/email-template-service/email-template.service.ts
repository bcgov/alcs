import { Injectable } from '@nestjs/common';
import { compile } from 'handlebars';
import * as mjml2html from 'mjml';
import { MJMLParseResults, MJMLParsingOptions } from 'mjml-core';

@Injectable()
export class EmailTemplateService {
  generateEmailBase(
    templateMjml: string,
    data?: any,
    options?: MJMLParsingOptions,
  ): MJMLParseResults {
    // prepare template
    const compiledTemplate = compile(templateMjml);

    // insert data
    const mjml = compiledTemplate(data);

    // render mjml -> html
    const htmlOutput = mjml2html(mjml, options);

    return htmlOutput;
  }
}
