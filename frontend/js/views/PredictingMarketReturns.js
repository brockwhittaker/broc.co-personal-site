import React from "react";
import ReactDOM from "react-dom";

import MarketCanvasArt from "../components/MarketCanvasArt.js";

import BlackScholesURL from "/assets/black-scholes-model.svg";
import NormalVsSPXReturnsURL from "/assets/normal-vs-spx-returns.svg";
import SPYChainBettingOddsURL from "/assets/spy-chain-betting-odds.png";
import SkewDiagramURL from "/assets/skew-diagram.svg";

import chart from '../chart.js';

import blog from '../../css/blog.css';

const drawCallsAndPutsExpectations = (options, type) => {
  const SPYOptionsChain = options
    [type]
    .sort(
      (a, b) => +a.strike_price > +b.strike_price ? -1 : 1
    )
    .filter(o => o.open_interest > 5);

  let data = [];
  for (let x = 0; x < SPYOptionsChain.length - 1; x++) {
    let a = SPYOptionsChain[x], b = SPYOptionsChain[x + 1];
    let delta = a.strike_price - b.strike_price;
    let premium_delta = a.adjusted_mark_price - b.adjusted_mark_price;
    let y = (Math.round(1000 * premium_delta / delta) / 1000);
    if (type === "calls") y += 1;
    data.push({ x: +a.strike_price, y: 1 - Math.abs(y - 0.5) * 2, strikes: [a, b] })
  }

  return data;
};

const max = arr => {
  let max = arr[0];
  for (let x = 0; x < arr.length; x++) {
    if (arr[x] > max) max = arr[x];
  }

  return max;
};

const getClosestExpiryToNewYear = expirations => {
  let closest = expirations[0];
  expirations.forEach(o => {
    if (Math.abs(new Date(o) - new Date(2021, 1, 1)) < Math.abs(new Date(closest) - new Date(2021, 1, 1)) && new Date(o).getFullYear() !== 2021) {
      closest = o;
    }
  });

  return closest;
}

export default class PredictingMarketReturns extends React.Component {
  constructor () {
    super();

    this.state = {
      expiration_dates: null,
      expiration: null,
      table_slice: null,
      ticker: "SPY",
      readerType: "Condensed",
    };

    document.title = "Predicting Returns | brooock.com"
  }

  componentDidMount () {
    fetch(`/api/${this.state.ticker}/`).then(r => r.json()).then(({ expiration_dates }) => {
      let defaultExpiration = getClosestExpiryToNewYear(expiration_dates);
      this.setState({
        expiration_dates,
        expiration: getClosestExpiryToNewYear(expiration_dates),
      });

      this.calculateForExpiry(defaultExpiration);
    });

    setTimeout(() => {
      new MarketCanvasArt(this.canvas).draw();
    }, 100);
  }

  calculateForExpiry (exp) {
    this.setState({ expiration: exp });
    fetch(`/api/${this.state.ticker}/options/${exp}/`).then(r => r.json()).then(data => {

      let calls = drawCallsAndPutsExpectations(data, "calls"),
          puts = drawCallsAndPutsExpectations(data, "puts");


      let calls_max = max(calls.map(o => o.y));
      let calls_max_index = calls.findIndex(o => o.y === calls_max);
      let table_slice = calls.map(o => o.strikes);

      for (let x = 0; x < table_slice.length; x++) {
        let [a, b] = table_slice[x];

        let delta = a.strike_price - b.strike_price;
        let premium_delta = a.adjusted_mark_price - b.adjusted_mark_price;
        let y = (Math.round(1000 * premium_delta / delta) / 1000);


        table_slice[x][0].d = y;
      }


      this.setState({ table_slice });

      chart({ container: this.chart, series: [{
        name: `Odds (Above, Below Price) on ${exp}`,
        data: calls,
        color: 'transparent'
      }], title: `${this.state.ticker} Price Predictions on ${exp}`, subtitle: `Market outcomes expressed as betting odds, calculated through live options premiums retrieved from Robinhood.`, xAxisMin: calls[calls.length - 1].x, xAxisDividingIndex: +calls[calls_max_index].strikes[0].strike_price });
/*
      chart({ container: this.chart2, series: [{
        name: `Odds (Above, Below Price) on ${exp}`,
        data: puts,
        color: 'transparent'
      }], title: `SPY Price on ${exp}`, xAxisMin: puts[puts.length - 1].x });
*/
    });
  }

  toggleReaderType () {
    let readerType = this.state.readerType === "Expanded" ? "Condensed" : "Expanded";
    this.setState({ readerType });
  }

  render () {
    return (
      <div className={"blog " + (this.state.readerType === "Expanded" ? "blog--expanded" : "blog--expert")}>
        <div className="header">
          <h2><span className="blink" style={{ color: '#050526' }}>[LIVE]</span> Forecasting</h2>
          <h1>The price tomorrow? Just ask.</h1>
          <canvas ref={canvas => this.canvas = canvas} />
        </div>
        <article>
          <div className="description">This is a living project, showing at any given time what speculators in the options market expect the price of an equity to be at a future date, displayed as betting odds on the over/under of a price.</div>
          <div id="readAs">
            <span>Reading in&nbsp;</span>
            <label onClick={() => this.toggleReaderType()}>{ this.state.readerType } mode</label>
          </div>
          <h2>Hidden in Plain Sight</h2>
          <section>
            <p>Investors use a wide variety of techniques to try to figure what the market thinks a stock will be worth in a day, a week, or even next year. From sentiment analysis, to polling investors, to <a href="https://www.notion.so/The-price-tomorrow-Just-ask-178f98580294460db2a85c0545cf3911#e5ba90187a954740819c6b69bc4ecabb" target="_blank">tracking the number of Robinhood traders holding a stock</a>, there's boundless ingenuity in creating prediction points for investor interest. Almost all investors overlook one of the simplest ways to find where a stock is expected to be in the future: <b>just look at what people are paying.</b></p>
            <p>Well, it's not as simple as looking at the stock price or an order book, but it is as simple as looking at its <a href="https://finance.yahoo.com/quote/SPY/options?p=SPY&date=1609372800" target="_blank">options chain</a>.</p>
          </section>
          <div className="expanded-mode-info" onClick={() => this.toggleReaderType()}>
            <p>If you want a primer on call options and the history of derivatives pricing, expand the article here. ↓</p>
          </div>
          <h2 className="expanded">A Brief Primer on Call Options</h2>
          <section className="expanded">
            <p>First let's take a step back and give a brief intro on what options are, and for the sake of this write up I'll explain how call options work. If you want a more comprehensive guide, check out <a href="https://www.investopedia.com/trading/beginners-guide-to-call-buying/" target="_blank">Investopedia's guide to Buying Calls</a>.</p>
            <p>Call Options are as they sound, an <i>option</i> to buy a stock at a fixed price in the future, regardless of what the price changes to. For example, a call option on Apple with a strike of $300 that expires on 12/31/2020 gives you the right to buy 100 shares of Apple stock for $300 a share regardless of the price — even if Apple is at $400! It also gives you the <i>option</i>, not the obligation, so if Apple drops to $200, you don't have to purchase the shares at $300.</p>
            <p>Sounds like too good of a deal, right? It is, that's why the concept of a premium exists. No seller wants to give you the option to buy stock for a lower price only if it goes up, so they're going to charge you a fee (premium) to do this. Since Apple is at $360/share at the time of writing this, we could imagine someone may sell an option to buy stock on <a href="https://finance.yahoo.com/quote/AAPL210115C00300000?p=AAPL210115C00300000" target="_blank">12/31/2020 at $300 a share for say... $77</a>. How does the market land on a value of $77 for the option?</p>
          </section>
          <h2 className="expanded">A Speed Run through Black-Scholes</h2>
          <section className="expanded">
            <p>In 1973 Fischer Black and Myron Scholes created a mathematical model to price options that breaks down (shown below) that says an option's value can be calculated based on how long it is until an option expires <i>(T – t)</i>, the current stock price <i>(S)</i>, the strike price of the option <i>(K)</i>, the risk-free rate <i>(r = 3-Mo US Treasury Bill)</i>, and the volatility of the stock <i>(σ = 1-year standard deviation)</i>.</p>
            <p>These factors can all be intuited in a pretty straightforward way. Option prices should <i>increase</i> when the duration of the option increases because stock prices can move more. Options with lower strike prices <i>are worth more</i> than ones with higher strike prices, because you get the chance to buy a stock at a lower price. If the risk-free rate is higher, options should <i>trade more expensively</i>, because why write options if you could otherwise make more money holding bonds? And lastly, options should be <i>more expensive</i> if a stock is more volatile since it will likely move much higher (or lower) than a less volatile stock. All the inverse statements to the above are true as well.</p>

            <div className="center">
              <div className="figure inline-block">
                <div className="figure--text"><b>Fig 1.</b> Black-Scholes Model for Pricing Options</div>
                <img src={BlackScholesURL} />
              </div>
            </div>
            <p>This is a very complex function, and also very incorrect. While the above correlations are absolutely correct, a core part of the Black-Scholes model assumes stocks move in a normally distributed fashion (e.g. outcomes fall on a bell curve). While this was assumed to be true in the 1970s and 1980s, it was proven to be very untrue during the <a href="https://en.wikipedia.org/wiki/Black_Monday_(1987)" target="_blank">Black Monday Crash in 1987</a>, due to the existence of <a href="https://en.wikipedia.org/wiki/Black_swan_theory" target="_blank">Black Swan events</a> — tail risk is higher than expected due to the higher than expected likelihood of extreme events (such as a global pandemic, perhaps?).</p>
            <div className="center">
              <div className="figure figure--full-width inline-block">
                <div className="figure--text"><b>Fig 2.</b> S&P Returns vs. Black-Scholes Assumed Returns</div>
                <img src={NormalVsSPXReturnsURL} />
              </div>
            </div>
            <p>If the Black-Scholes model were an accurate portrayal of the world, we could figure out what the likelihood of any event is by looking at a <a href="https://en.wikipedia.org/wiki/Standard_normal_table" target="_blank">Z-Table</a>. For example if Apple were at $300/share with 15% volatility, we could know in a year's time that there's a 15.8% chance it would be lower than $255/share. But again, the Black-Scholes model is incorrect. Sad.</p>
            <p>Fortunately most sophisticated traders know this, and they are adjusting options prices based off real world historical and future potential movements. They're paying a premium for "unexpected outcomes".</p>
            <p>So how do we see what traders think the probability of a stock ending at a given price is? Take the difference in price between two calls.</p>
          </section>
          <h2>Comparing Two Options</h2>
          <section>
            <p>If you look at the options chain for any stock you'll notice you can purchase options at many price points. For SPY (Standard & Poor 500 tracking ETF) options expiring July 31st, you can purchase options with strikes at a $1 interval.</p>
            <p>Let's compare at the atomic level the difference between two (almost) identical options to discover something interesting.</p>
            <div className="center">
              <div className="figure figure--chart inline-block">
                <div className="figure--text"><b>Fig 3.</b> SPY Options Chain (07/31)</div>
                <table>
                  <thead>
                    <tr>
                      <th className="strike">Strike</th>
                      <th>Premium</th>
                      <th>Diff. in Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="highlighted">
                      <td className="strike">$325</td>
                      <td className="bold">$2.22</td>
                      <td className="bold">-$0.28</td>
                    </tr>
                    <tr className="highlighted">
                      <td className="strike">$324</td>
                      <td className="bold">$2.50</td>
                      <td className="bold">-$0.31</td>
                    </tr>
                    <tr>
                      <td className="strike">$323</td>
                      <td className="bold">$2.81</td>
                      <td className="bold">-$0.34</td>
                    </tr>
                    <tr>
                      <td className="strike">$322</td>
                      <td className="bold">$3.15</td>
                      <td className="bold">-$0.37</td>
                    </tr>
                    <tr>
                      <td className="strike">$321</td>
                      <td className="bold">$3.52</td>
                      <td className="bold">-$0.40</td>
                    </tr>
                    <tr>
                      <td className="strike">$320</td>
                      <td className="bold">$3.92</td>
                      <td className="bold">—</td>
                    </tr>
                  </tbody>
                </table>
                <div className="figure--text">*At the time of viewing this, SPY was trading at $312.65.</div>
              </div>
            </div>
            <p>These two options are similar, but have slightly different payouts. Let's examine how they payout in a few different outcomes upon expiration.</p>
            <div className="center">
              <div className="figure figure--chart inline-block">
                <div className="figure--text"><b>Fig 4.</b> Payoffs at Expiration (07/31)</div>
                <table>
                  <thead>
                    <tr>
                      <th className="strike">SPY Price</th>
                      <th>$324 Call</th>
                      <th>$325 Call</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="strike">$323</td>
                      <td>$0</td>
                      <td>$0</td>
                    </tr>
                    <tr>
                      <td className="strike">$324</td>
                      <td>$0</td>
                      <td>$0</td>
                    </tr>
                    <tr className="highlighted">
                      <td className="strike">$325</td>
                      <td>$1</td>
                      <td>$0</td>
                    </tr>
                    <tr className="highlighted">
                      <td className="strike">$326</td>
                      <td>$2</td>
                      <td>$1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p>The $324 call returns a payout sooner and will return a dollar more than the $325 call option at any level above $325 per share. We can see from the table <i>(Fig. 3)</i> that the $324 call is implied to be worth <i>$0.28 more</i> than the $325 call.</p>
            <p><b>This means that the market thinks there is roughly a 28% chance that the market will settle above $325.</b></p>
            <p>We can demonstrate this below, imagine we buy a $324 call and sell a $325 call. Feel free to reference the table above to confirm the calculations below. They're simply calculated as the payout of the $324 call minus the payout of the $325 call.</p>
            <div className="center">
              <div className="figure figure--chart inline-block">
                <div className="figure--text"><b>Fig 5.</b> Payoffs at Expiration (07/31)</div>
                <table>
                  <thead>
                    <tr>
                      <th className="strike">SPY Price</th>
                      <th>$324 Call (1) + $325 Call (-1)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="strike">$323</td>
                      <td>$0</td>
                    </tr>
                    <tr>
                      <td className="strike">$324</td>
                      <td>$0</td>
                    </tr>
                    <tr className="highlighted">
                      <td className="strike">$325</td>
                      <td>$1</td>
                    </tr>
                    <tr className="highlighted">
                      <td className="strike">$326</td>
                      <td>$1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p>We have reduced the outcome to effectively<sup>1</sup> a binary outcome, and since the market values that binary outcome of either making $0 or $1 at $0.28, we can assume that the market thinks there is a 28% chance of making $1 – <b>therefore the market implies a 28% chance that SPY closes above $325.</b></p>
            <p>If we want to find the price that SPY is expected on average to land at on 07/31, we would want to find the two options where the change in premium is approximately <i>-$0.50</i> to the next strike.</p>
            <div className="center">
              <div className="figure figure--chart inline-block">
                <div className="figure--text"><b>Fig 6.</b> SPY Options Chain (07/31)</div>
                <table>
                  <thead>
                    <tr>
                      <th className="strike">Strike</th>
                      <th>Premium</th>
                      <th>Diff. in Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="strike">$319</td>
                      <td className="bold">$4.36</td>
                      <td className="bold">-$0.46</td>
                    </tr>
                    <tr>
                      <td className="strike">$318</td>
                      <td className="bold">$4.82</td>
                      <td className="bold">-$0.48</td>
                    </tr>
                    <tr className="highlighted">
                      <td className="strike">$317</td>
                      <td className="bold">$5.30</td>
                      <td className="bold">-$0.50</td>
                    </tr>
                    <tr>
                      <td className="strike">$316</td>
                      <td className="bold">$5.80</td>
                      <td className="bold">-$0.54</td>
                    </tr>
                    <tr>
                      <td className="strike">$315</td>
                      <td className="bold">$6.34</td>
                      <td className="bold">-$0.57</td>
                    </tr>
                    <tr>
                      <td className="strike">$314</td>
                      <td className="bold">$6.91</td>
                      <td className="bold">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p>We can see that the market is assessing the marginal dollar of profit potential at $317 at $0.50 — meaning that it's the average price the market predicts SPY will be at on 07/31. Given that SPY is currently at $312.65, the market expects the price of SPY to increase in July by 1.39%.</p>
            <p>If we express these percentages as betting odds, the odds of SPY being higher:lower than $317 on 07/31 are <i>1:1</i>, and the odds of it being higher than $325 are <i>1:2.57</i>.</p>
            <p>If we calculate these odds for every single pair of adjacent strikes on an option chain, we can get a betting-odds curve for SPY, showing what the market thinks the likelihood of any price threshold is.</p>
            <div className="center">
              <div className="figure figure--full-width inline-block">
                <div className="figure--text"><b>Fig 7.</b> Betting odds on SPY price across all strikes (07/31)</div>
                <img src={SPYChainBettingOddsURL} />
                <div className="figure--text"><b>Note:</b> The odds right of the line are the odds of SPY closing <i>above</i> the x-axis price, and the odds left of the line are the odds of SPY closing <i>below</i> the x-axis price.</div>
              </div>
            </div>
          </section>
          <h2>What can we learn from this data?</h2>
          <section>
            <p>With an entire options chain worth of probability data we can extract quite a few useful pieces of information:</p>
            <blockquote>Find the expected future price of a stock on a given date.</blockquote>
            <p className="quote-description">By finding the midpoint where premiums decrease at half the rate at which strikes increase, you can find the average price the market believes a stock will be at on that expiration.</p>
            <blockquote>Find the probability of a stock being above or below any price on a given date.</blockquote>
            <p className="quote-description">It is important from a portfolio insurance perspective to have a grasp on how likely catastrophic events may be, or even what the chance of your option increasing/decreasing to a certain level is.</p>
            <blockquote>Find whether the market is factoring in a high likelihood of massive upside, or massive downside.</blockquote>
            <div className="quote-description expanded-mode-info" onClick={() => this.toggleReaderType()}>
              <p>If you want to read more about skewness, expand the article here. ↓</p>
            </div>
            <p className="quote-description">The shape of the curve can either be positively or negatively skewed, indicating that investors in an equity are either anticipating a larger-than-usual chance of massive upswing or downswing, respectively.</p>
            <div className="expanded expanded--container">
              <p className="quote-description">Aside from distributions having a variance (standard deviation), kurtosis (tail-risk), and drift (average), they can also be skewed negatively or positively.</p>
              <div className="center quote-description">
                <div className="figure figure--full-width inline-block">
                  <div className="figure--text"><b>Fig 8.</b> Positive and Negative Skews</div>
                  <img src={SkewDiagramURL} />
                </div>
              </div>
              <p className="quote-description">If you reference the SPY options chain above, you'll notice it more closely resembles a negative skew than a positive one, with a fatter tail on the left side. This shows that the market is anticipating a higher probability of SPY potentially declining a large amount, than it is anticipating SPY increasing a large amount.</p>
              <p className="quote-description">In the context of the current world, that intuitively makes sense – in the midst of a global pandemic, it's unclear what the longer term effects on the economy will be, or even how long the pandemic will last. Many investors realize that and are paying more for options with downside protection.</p>
              <p className="quote-description">In cases where there is a positive skew, the market thinks there's a chance of a dramatic price increase in the future, perhaps due to the possibility of breakout success of a product. This skew is generally more common with high growth companies such as Beyond Meat, Shopify, or Tesla.</p>
              <p>Now that you have a basis for finding the future expected price, probability table, and skewness, check out the interactive project below on stocks you own!</p>
            </div>
          </section>
          <div className="inline-note"><sup>1</sup> This makes a simple assumption that SPY trades in dollar increments, for simplicity of illustrating the math. The EV is slightly different as the binary payoff model can yield payouts between $0-$1 between SPY closing ranges of $324-$325.</div>
        </article>
        <div className="interactive-app">
          <ul className="expiration-dates">
            <b>Options Expiries</b>
            { this.state.expiration_dates && this.state.expiration_dates.map(o => <li className={this.state.expiration === o ? "selected" : ""} onClick={() => this.calculateForExpiry(o)}>{ o }</li>) }
          </ul>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th className="strike">Strike</th>
                  <th>Premium</th>
                  <th>Δ Premium / Δ Price</th>
                </tr>
              </thead>
              <tbody>
                { this.state.table_slice && this.state.table_slice.map(([o]) => (
                  <tr>
                    <td className="strike">{ (+o.strike_price).toFixed(2) }</td>
                    <td>${ (+o.adjusted_mark_price).toFixed(2) }</td>
                    <td>{ o.d.toFixed(2) }</td>
                  </tr>
                )) }
              </tbody>
            </table>
          </div>
          <div className="chart" ref={node => this.chart = node} />
        </div>
        {/*<div className="date-picker">
          <div className="arrow arrow--left">&lt;</div>
          <div className="date">{ this.state.expiration || "01.01.2020" }</div>
          <div className="arrow arrow--right">&gt;</div>
        </div>*/}
      </div>
    );
  }
}
