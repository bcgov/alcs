import * as config from 'config';

export const portalButton = `
    <a href="${config.get('PORTAL.FRONTEND_ROOT')}" style="display:inline-block;width:222px;background:#065A2F;color:white;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;" target="_blank"> GO TO ALC PORTAL </a>
`;
