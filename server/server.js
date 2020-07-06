const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000;
const fs = require('fs-promise');
const path = require("path");

const credentials = {
    username: 'whittakerbrock@gmail.com',
    password: 'B.j.W.2013'
};

const Robinhood = require('./robinhood')(credentials);

const { Sequelize } = require('sequelize');
// Option 2: Passing parameters separately (other dialects)
const sequelize = new Sequelize('brooock', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

const cache = {

};

const chalk = require('chalk');

const pluckFromObject = (keys) => {
  return (object) => {
    let obj = {};
    for (let x = 0; x < keys.length; x++) {
      obj[keys[x]] = object[keys[x]];
    }

    return obj;
  }
}
(async () => {
  app.use(bodyParser.json());
  app.use(require('cookie-parser')());

  app.get("/api/:ticker/", async (req, res) => {
    const { ticker } = req.params;

    if (cache[ticker] && new Date().getTime() < cache[ticker].expires) {
      res.status(200).json(cache[ticker].payload);
      return;
    }

    let options = await Robinhood.options_dates(ticker);
    let quote = await Robinhood.quote_data(ticker);

    let payload = { ...options.expiration_dates, ...quote };

    cache[ticker] = { payload, expires: new Date().getTime() + (1000 * 60 * 60) };

    res.status(200).json(payload);
  });

  app.get("/api/:ticker/options/:date/", async (req, res) => {
    const { ticker, date } = req.params;
    const key = `${ticker}-${date}`;

    if (cache[key] && new Date().getTime() < cache[ticker].expires) {
      res.status(200).json(cache[key].payload);
    }

    let options_dates = await Robinhood.options_dates(ticker);
    const { tradable_chain_id } = options_dates;

    const calls = await Robinhood.options_available(tradable_chain_id, date, 'call');
    const puts = await Robinhood.options_available(tradable_chain_id, date, 'put');

    const OBJECT_KEYS = ["adjusted_mark_price", "strike_price", "open_interest"];
    let payload = { calls: calls.map(pluckFromObject(OBJECT_KEYS)), puts: puts.map(pluckFromObject(OBJECT_KEYS)) };
    console.log(payload);
    cache[key] = { payload, expires: new Date().getTime() + (1000 * 60 * 60) };

    res.status(200).json(payload);
  });

  app.get("/api/:ticker/options/history/:instrument_ids/", async (req, res) => {
    let link = id => `https://api.robinhood.com/options/instruments/${id}/`
    let history = await Robinhood.option_history(req.params.instrument_ids.split(/,/g).map(link));

    res.status(200).json(history);
  });

  app.use("/dist/", express.static("../dist"));

  app.get('/', (req, res) => res.sendFile(path.join(__dirname, "../dist/index.html")));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });


  app.use((req, res, next) => {
    console.log(chalk.red(req.method) + " " + chalk.blue(req.originalUrl));
    console.log(utils.indent(`cookie: ` + chalk.blue(req.cookies[`meta/user/private_key`] || req.query[`meta/user/private_key`]), 2));
    console.log(utils.indent(`body: ` + utils.prettyPrintObject(req.body), 2));
    next();
  });

  app.get('/', (req, res) => res.sendFile(path.join(__dirname, "../dist/index.html")));
  app.get('/*', (req, res) => res.sendFile(path.join(__dirname, "../dist/index.html")));

  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
})();
