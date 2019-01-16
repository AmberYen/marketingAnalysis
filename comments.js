import { exec } from 'child_process';
import Promise from 'bluebird';
import fs from 'fs';
import moment from 'moment';
import _ from 'lodash';

function checkVoteStatus(message_tags) {
  if (message_tags !== undefined) {
    const page = message_tags.filter(tag => tag.type === 'page');
    const user = message_tags.filter(tag => tag.type === 'user');

    if (page.length >= 1 && user.length >= 2) return true;
    return false;
  }

  return false;
}

export async function comments() {
  return new Promise((resolve) => {
    const result = [];
    let count = 0;
    const sendRequest = (after) => {
      exec(`curl -k -X GET \ "https://graph.facebook.com/v3.1/1396075377331078_2193457230926218/comments?fields=message%2Cmessage_tags%2Cfrom%2Cid%2Ccomments.limit(1000)%7Bmessage%2Cmessage_tags%2Cfrom%2Cid%7D&after=${after}&access_token=EAADjbBIIL4wBAMEZCsqnydXHwPY56ckLl8q5bGUNZCMreruZC25Ygo8JYdQF72PxSxPlfe2TVcvVCZCAx3k6fHYXXFtSYDPUgO2FARpwmice8Hx5OaAMK6Vxf8rF062qqWBYedrCxNl52cqWuOvZAQ6mJp4gdROhdtLqrIgBN8m6qZB5zOnQe08tZA2ISBdpK331uZACVTWrlQZDZD"`, (err, stdout) => {
        if (err) {
          console.log('err', err);
          resolve([]);

          return;
        }

        const {
          data,
          paging,
        } = JSON.parse(stdout);

        result.push(...data);
        count++;

        if (paging && paging.cursors && paging.cursors.after) {
          console.log('paging.cursors.after', paging.cursors.after);
          return sendRequest(paging.cursors.after);
        }

        return resolve(result);
      });
    }

    sendRequest('MTMZD');
  });
}

(async function() {
  const results = await comments();

  const secondLayerComments = _.flatten(results.filter(result => result.comments !== undefined).map(result => result.comments.data));

  //const data = results.concat(secondLayerComments);
  //console.log('data', data);
  // const HOMEData = data.filter(d => d.from && d.from.id === '556055591230516');
  // console.log(HOMEData.length);
  const data = results.concat(secondLayerComments).map(result => ([
    `"${result.message}"`,
    `"${result.from && result.from.name}"`,
    result.from && result.from.id,
    moment(result.created_time).format('YYYY-MM-DD HH:mm:ss'),
  ]).join(',')).join('\n').replace(/^/, '留言內容,留言者資訊,留言者ID,留言時間\n');
  //
  // fixed MS Excel BOM Bug
  const msExcelBuffer = Buffer.concat([
    Buffer.from('\xEF\xBB\xBF', 'binary'),
    Buffer.from(data),
  ]);
  //
  fs.writeFile('4_comments.csv', msExcelBuffer, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('It\'s saved!');
    }
  });

  console.log('result', results.concat(secondLayerComments).length);
}());
