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
      exec(`curl -k -X GET \ "https://graph.facebook.com/v3.1/556055591230516_1085716804931056/comments?fields=message%2Cmessage_tags%2Cfrom%2Cid%2Ccomments.limit(1000)%7Bmessage%2Cmessage_tags%2Cfrom%2Cid%7D&after=${after}&access_token=EAADjbBIIL4wBAGpXwfyJSyMFExEhZCjoKAbWJOJqh07lmJE5d8qWUUEhZBh19LVZC7DLq0oBV3nj5nLZBDZBU1zSaHGDG84RD33HzCQfRUZAOOFJIFzt6njbsZCf43wr2woUlnxZA1WiVWzwfF5C9VjmxiXoir0GvZBR0haEIxmGs9nNuE9JLOlxizmVxJq4Y23MZD"`, (err, stdout) => {
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

    sendRequest('NDgwMgZDZD');
  });
}

(async function() {
  const results = await comments();

  const secondLayerComments = _.flatten(results.filter(result => result.comments !== undefined).map(result => result.comments.data));

  const data = results.concat(secondLayerComments).map(result => ([
    `"${result.message}"`,
    `"${result.from && result.from.name}"`,
    result.from && result.from.id,
    checkVoteStatus(result.message_tags) ? "Success" : "False",
    moment(result.created_time).format('YYYY-MM-DD HH:mm:ss'),
  ]).join(',')).join('\n').replace(/^/, '留言內容,留言者資訊,留言時間\n');

  // fixed MS Excel BOM Bug
  const msExcelBuffer = Buffer.concat([
    Buffer.from('\xEF\xBB\xBF', 'binary'),
    Buffer.from(data),
  ]);

  fs.writeFile('comments.csv', msExcelBuffer, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('It\'s saved!');
    }
  });

  console.log('result', results.concat(secondLayerComments).length);
}());
