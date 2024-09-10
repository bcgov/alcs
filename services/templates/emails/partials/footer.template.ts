import { v4 } from 'uuid';

export const footer = `
    <!--[if mso]>
        </td>
      </tr>
    </table>
    <![endif]-->
    
    <table style="background-color: #FBE0D1" role="presentation">
      <tr>
        <td align="left" style="width: 400px; padding: 10px 25px; font-size: 13px; line-height: 24px;">
          <a href="https://www.alc.gov.bc.ca/"> Provincial Agricultural Land Commission (gov.bc.ca) </a>
        </td>
        <td align="right" style="width: 400px; padding: 10px 25px; font-size: 13px; line-height: 24px;">
          Contact: <a href='tel:604-660-7000'> 604-660-7000 </a></div>
        </td>
      </tr>
    </table>
    
    <span style="display: none">${v4()}</span>
  </div>
</body>
</html>
`;
