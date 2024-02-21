import * as config from 'config';

export const portalButton = `
  <mj-section background-color="white" padding="0px 0px 72px 0px">
    <mj-column width="600px" css-class='line-height'>
      <mj-button
        width="272px"
        height="43px" 
        font-size="16px"
        css-class='align-left'
        background-color="#065A2F"
        color='white'
        href="${config.get('PORTAL.FRONTEND_ROOT')}">
          GO TO ALC PORTAL
        </mj-button>
    </mj-column>
  </mj-section>
  `;
