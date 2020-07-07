import kurtosisSimulator from '../utils/kurtosisSimulator.js';

const generateRandomCoordinate = () => {
  let rad = Math.random() * Math.PI * 2;
  return [Math.sin(rad), Math.cos(rad)];
};

const max = arr => {
  let max = arr[0];
  for (let x = 1; x < arr.length; x++) {
    if (max < arr[x]) max = arr[x];
  }

  return max;
};

let dist = kurtosisSimulator({ sampleSize: 100000 }).kurtosis();
let norm = kurtosisSimulator({ }).normal();


export default class MarketCanvasArt {
  constructor (canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');


    this.canvas.height = window.innerHeight * 2;
    this.canvas.width = window.innerWidth * 2;

    this.canvas.style.width = "100vw";
    this.canvas.style.height = "100vh";

    if (window.innerWidth < 500) {
      this.leftCenter = {
        x: this.canvas.width / 3 - 50,
        y: this.canvas.height * 0.55,
      };

      this.rightCenter = {
        x: (this.canvas.width / 3) * 2 + 50,
        y: this.canvas.height * 0.55,
      };
    } else {
      this.leftCenter = {
        x: this.canvas.width / 3,
        y: this.canvas.height * 0.55,
      };

      this.rightCenter = {
        x: (this.canvas.width / 3) * 2,
        y: this.canvas.height * 0.55,
      };
    }
  }

  background () {
    const { context } = this;

    context.strokeStyle = '#05052608';

    for (let x = 0; x < this.canvas.width; x += 50) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, this.canvas.height);
      context.stroke();
    }

    for (let y = -this.canvas.height; y < this.canvas.height; y += 50) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(this.canvas.width, this.canvas.width / 2 + y);
      context.stroke();
    }

    for (let y = -this.canvas.height; y < this.canvas.height * 2; y += 50) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(this.canvas.width, y - this.canvas.width / 2);
      context.stroke();
    }
  }

  drawLineAndExplainerForMaxDot (x, y, max) {
    const { context } = this;

    context.beginPath();
    context.moveTo(x, y - 20);
    context.lineTo(x, y - 50);
    context.stroke();

    context.beginPath();
    context.moveTo(x, y - 50);
    context.lineTo(x + 30, y - 50 - 15);
    context.stroke();

    context.textAlign = "left";
    context.textBaseline = "middle";
    if (window.innerWidth < 500) {
      context.fillText("+" + ((max * 100).toFixed(2) + "%").toUpperCase().split("").join(String.fromCharCode(8202) + String.fromCharCode(8202)), x + 30 + 10, y - 50 - 15);
      context.fillText("Increase".toUpperCase().split("").join(String.fromCharCode(8202) + String.fromCharCode(8202)), x + 30 + 10, y - 50 + 10);
    } else {
      context.fillText(('Max daily increase: +' + (max * 100).toFixed(2) + "%").toUpperCase().split("").join(String.fromCharCode(8202) + String.fromCharCode(8202)), x + 30 + 10, y - 50 - 15);
    }

  }

  drawMaxDot () {
    const { context } = this;

    let norMax = max(norm);
    let valMax = max(dist);

    let x = 0, y = -1;

    context.fillStyle = '#05052660';

    context.beginPath();
    context.arc(this.leftCenter.x, this.leftCenter.y + y * (valMax - 1) * 5000, 2, 0, Math.PI * 2);
    context.fill();
    context.closePath();

    context.beginPath();
    context.arc(this.leftCenter.x, this.leftCenter.y + y * (valMax - 1) * 5000, 20, 0, Math.PI * 2);
    context.strokeStyle = "#05052640";
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    this.drawLineAndExplainerForMaxDot(this.leftCenter.x, this.leftCenter.y + y * (valMax - 1) * 5000, valMax - 1);

    setTimeout(() => {
      context.fillStyle = '#05052660';

      context.beginPath();
      context.arc(this.rightCenter.x, this.rightCenter.y + y * norMax * 5000, 2, 0, Math.PI * 2);
      context.fill();

      context.beginPath();
      context.arc(this.rightCenter.x, this.rightCenter.y + y * norMax * 5000, 20, 0, Math.PI * 2);
      context.strokeStyle = "#0505260";
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

      this.drawLineAndExplainerForMaxDot(this.rightCenter.x, this.rightCenter.y + y * norMax * 5000, norMax);
    }, 1000);

  }

  draw (r) {

    this.background();
    const { context } = this;

    let counter = 0;

    context.font = '24px Soehne';
    context.textAlign = 'center';
    context.fillStyle = '#05052680';

    if (window.innerWidth < 500) {
      context.fillText('S&P 500'.toUpperCase().split("").join(String.fromCharCode(8202) + String.fromCharCode(8202)), this.leftCenter.x, this.leftCenter.y + 400)
      context.fillText('Normal Dist'.toUpperCase().split("").join(String.fromCharCode(8202) + String.fromCharCode(8202)), this.rightCenter.x, this.rightCenter.y + 400);
    } else {
      context.fillText('S&P 500 Returns (Simulated)'.toUpperCase().split("").join(String.fromCharCode(8202) + String.fromCharCode(8202)), this.leftCenter.x, this.leftCenter.y + 400)
      context.fillText('Normal Distribution Returns'.toUpperCase().split("").join(String.fromCharCode(8202) + String.fromCharCode(8202)), this.rightCenter.x, this.rightCenter.y + 400);
    }

    setTimeout(() => {
      this.drawMaxDot();
    }, 1000);

    context.fillStyle = '#05052640';

    setInterval(() => {
      for (let c = 0; c < 5; c++) {
        let [x, y] = generateRandomCoordinate();

        let nor = norm[counter];
        let val = dist[counter++];

        let MULTIPLIER = window.innerWidth < 500 ? 3000 : 5000;

        context.beginPath();
        context.arc(this.leftCenter.x + x * (val - 1) * MULTIPLIER, this.leftCenter.y + y * (val - 1) * MULTIPLIER, 2, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.arc(this.rightCenter.x + x * nor * MULTIPLIER, this.rightCenter.y + y * nor * MULTIPLIER, 2, 0, Math.PI * 2);
        context.fill();
      }
    }, 0);

  }
}
