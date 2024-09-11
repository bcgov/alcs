import { build } from '..';

export const template = build(
  `<p>
    The ALC's attached PDF response is proof that the notification of statutory right of way has been provided for a s. 218 Statutory Right of Way of the <i>Land Title Act</i> as required by s.18.1(2) of the <i>Agricultural Land Commission Act</i>.
  </p>
  <p>
    The ALC's attached PDF response must be appended as an additional document to the LTSA SRW application package.
  </p>
  <p>
    <strong>Disclaimer for Transferee(s):</strong>
  </p>
  <p>
    <strong>This letter is not an approval to use, construct, or remove soil or place fill (including gravel) within the SRW, nor does it compel the ALC to approve construction in the SRW.</strong> An application or notice of intent must be submitted to the ALC before starting any construction, fill placement, or soil removal within the SRW. Please consult the ALC for direction.
  </p>
  <p>
    Please refer to ALC Notification ID SRW{{ fileNumber }} in all future correspondence with this office. If you are acting on behalf of the transferee, it is your responsibility to advise your client(s) of this, and any future, correspondence.
  </p>
  <p>
    Further correspondence with respect to this notification should be directed to <a href='mailto:ALC.LUPRT@gov.bc.ca'>ALC.LUPRT@gov.bc.ca</a>.
  </p>
  <p>
    PROVINCIAL AGRICULTURAL LAND COMMISSION
  </p>
  <p>
    Attachment: {{fileName}}
  </p>`,
  false,
);
