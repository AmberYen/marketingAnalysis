const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require("fs");

module.exports = (text) => {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas(400, 300);
    const ctx = canvas.getContext('2d');

    // Draw cat with lime helmet
    loadImage(path.join(__dirname, 'images/source.png')).then((image) => {
      ctx.drawImage(image, 0, 0, 400, 300);

      ctx.font = '30px Impact';
      const textInCanvas = ctx.measureText(text);
      const positionX = 230 - (textInCanvas.width / 2);
      console.log('positionX', textInCanvas.width);
      ctx.fillText(text, positionX, 170);

      const buf = canvas.toBuffer();
      const filename = Date.now();
      console.log('filename', Date.now());
      fs.writeFileSync(path.join(__dirname, `images/${filename}.png`), buf);
      resolve(filename);
    })
  });
};
