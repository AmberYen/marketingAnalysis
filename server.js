const Koa = require('koa');
const path = require('path');
const KoaRouter = require('koa-router');
const bodyParser = require('koa-bodyparser');
const request = require('request-promise');
const serve = require('koa-static');
const drawCanvas = require('./canvas.js');

const app = new Koa();
const router = new KoaRouter();

const accessToken = 'EAADAnQf9Wh8BAPofBFJCKxZCZB9BBM9tMiQP8ChLbISUHgjLQseFnDkIfW229iESLcAqNRyZCd4GBmQ6bSD1F7ZBGZAEbYOXRvHm8EhT73VLjgUEZAvDthEY4QskZAZA1aIVjWCmSb04hzQ19Mi4IAx6rpvB8YSuUAjpM1w0LI0kjAZDZD';

app.use(bodyParser());

router.get('/webhooks', (ctx) => {
  console.log('webhooks', ctx.request.query);
  ctx.body = ctx.request.query['hub.challenge'];
});

router.post('/webhooks',async (ctx) => {
  console.log('post webhooks', JSON.stringify(ctx.request.body));
  if (ctx.request.body.entry[0].changes) {
    const commentId = ctx.request.body.entry[0].changes[0].value.comment_id;
    const message = ctx.request.body.entry[0].changes[0].value.message;
    const options = {
      uri: `https://graph.facebook.com/v3.2/${commentId}/private_replies?access_token=${accessToken}`,
      method: 'POST',
      body: {
        message: `你是不是說：${message}`,
      },
      json: true,
    }
    const result = await request(options);
  }
  if (ctx.request.body.entry[0].messaging) {
    const file = await drawCanvas(ctx.request.body.entry[0].messaging[0].message.text);
    const options = {
      uri: `https://graph.facebook.com/v3.2/616072855490343/messages?access_token=${accessToken}`,
      method: 'POST',
      body: {
        recipient: {
          id: ctx.request.body.entry[0].messaging[0].sender.id,
        },
        message: {
          attachment:{
            type: 'image',
            payload:{
              url: `https://e990adc2.ngrok.io/${file}.png`,
              is_reusable: true
            }
          }
        }
      },
      json: true,
    }
    const result = await request(options);
    console.log('file', file);
    console.log('result', result);
  }

  ctx.body = 'post webhooks';
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(serve(path.join(__dirname, 'images')));

app.listen(3000);
