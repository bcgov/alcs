import { build } from '..';
import { notificationOnly } from '../partials/notification-only.template';

export const template = build(
  `<p>
    This email is to acknowledge that the Agricultural Land Commission (ALC) is in receipt of the above noted <b>{{ childType }}</b> application. Please refer to the ALC Application ID in all future correspondence with this office. A copy of this application has been forwarded to the <b>{{ governmentName }}</b> for information purposes.
  </p>
  <p>
    APPLICATION FEES - Payable to the Minister of Finance c/o the ALC
  </p>
  <table>
    <tr style="text-align: left; font-size: 16px; border: 1px solid black;">
      <th style="padding-left: 8px; border-right: 1px solid black;">Application Type</th>
      <th style="padding-left: 8px">Application Fee</th>
    </tr>
    <tr style="font-size: 16px; border: 1px solid black;">
      <td style="padding-left: 8px; border-right: 1px solid black;">Transportation, Utility, and Recreational Trail Uses</td>
      <td style="padding-left: 8px">$1500</td>
    </tr>
  </table>
  <p>
    This fee can be paid:
    <ol style="list-style-position: inside; padding: 0; margin: 0;">
      <li style="margin: 0">Cheque: Made payable to the Minister of Finance c/o the ALC</li>
      <li style="margin: 0">Credit card: Over the phone or in-person</li>
    </ol>
  </p>
  <p>
    Please include your assigned Application ID with your payment.
  </p>
  <p>
    Mailing address:
    <br />
    Agricultural Land Commission
    <br />
    201-4940 Canada Way
    <br />
    Burnaby, BC, Canada
    <br />
    V5G 4K6
    <br />
  </p>
  <p>
    Paying via telephone:
    <br />
    Tel: <a href="tel:6046607000">604-660-7000</a>
    <br />
  </p>
  <p>
    If you are making a long-distance call to a provincial government agency, you can place your call through Enquiry BC free of charge:
    <br />
    In Victoria call: <a href="tel:2503876121">250-387-6121</a>
    <br />
    Elsewhere in BC call: <a href="tel:18006637867">1-800-663-7867</a>
    <br />
  </p>
  <p>
    If you are an agent acting on behalf of the applicant(s) / landowner(s), it is your responsibility to advise them of this, and any future, correspondence.
  </p>
  <p>
    Please log into the ALC Portal for further updates on the application as it progresses.
  </p>
  ${notificationOnly}`,
);
