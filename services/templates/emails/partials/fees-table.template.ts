export const feesTable = (typeHeading: string, feeHeading: string, feeData) =>
  `<table cellpadding="0" cellspacing="0" width="100%" border="0" style="color: #000000; font-family: Helvetica, Arial, sans-serif; font-size:13px; line-height: 22px; table-layout: auto; width: 100%; border: none; border-collapse: collapse;">
      <tr style="text-align: left; font-size: 16px; border: 1px solid black;">
        <th style="padding-left: 8px; border-right: 1px solid black;">${typeHeading}</th>
        <th style="padding-left: 8px">${feeHeading}</th>
      </tr>
      ${feeData
        .map(({ type, fee }) => {
          return `
          <tr style="font-size: 16px; border: 1px solid black;">
            <td style="padding-left: 8px; border-right: 1px solid black;">${type}</td>
            <td style="padding-left: 8px">$${fee}</td>
          </tr>
          `;
        })
        .join('')}
    </table>`;
