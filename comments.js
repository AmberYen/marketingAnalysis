import { exec } from 'child_process';
import Promise from 'bluebird';

export async function comments() {
  return new Promise((resolve) => {
    exec(`curl -i -X GET \ "https://graph.facebook.com/v3.1/556055591230516_1085716804931056?fields=comments&access_token=EAADjbBIIL4wBAHWP0ihXyvsjV5uWKZBfEKyv3VhVvV03zeZBe1rryPvou7ZAzdhgKI4a7GqGmsrH5dhRJd1tPpAEnMdnuMfYKCAd70ikFxwJPdVNHk26n9fGU1OfCRZBo1SwdESZBxrGuEVyi9U4tHP1VwCbkt4X8Ge45QMehZBejAAh0tLBjEacMivUGoeBAZD"`, (err, stdout) => {
      if (err) {
        console.log('err', err);
        resolve([]);

        return;
      }

      console.log('JSON.parse(stdout)', stdout);

      const {
        result: {
          list,
        },
      } = JSON.parse(stdout);

      resolve(list);
    });
  });
}

comments();

