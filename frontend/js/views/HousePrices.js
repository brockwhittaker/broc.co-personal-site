import React from "react";
import ReactDOM from "react-dom";

import chart from '../line-chart.js';

import { finance } from '../utils/finance.js'

import HousePricesByQuarter from '../data/house-prices-by-quarter.json';
import InflationRateByYear from '../data/inflation-rate-by-year.json';
import RealMedianIncomeByYear from '../data/real-median-income-by-year.json'
import MortgageRatesByMonth from '../data/mortgage-rates-by-month.json'

import SeattleHillsImg from '../../assets/seattle-hills.jpg'
import SameHouseMetric from '../../assets/same-house-metric.png'

let compoundedPricesByYear = [], acc = 1;
for (let x = 0; x < InflationRateByYear.length; x++) {
  compoundedPricesByYear[x] = [InflationRateByYear[x][0], acc]
  acc = acc * (1 + parseFloat(InflationRateByYear[x][1]) / 100)
}

const AverageHomePriceToMedianIncomeRatio = HousePricesByQuarter.filter(o => /01-01/.test(o)).slice(0, -1).map((o, i) => {
  const normalizedHomePrice = o[1] / compoundedPricesByYear[i][1]
  const normalizedAgainstMedianIncome = normalizedHomePrice / RealMedianIncomeByYear[i][1]
  return [o[0], normalizedAgainstMedianIncome * (HousePricesByQuarter.slice(-1)[0][1] / HousePricesByQuarter[0][1])]
});


console.log({ compoundedPricesByYear})
console.log(finance.mortgagePayment(100000, 0.04, 30))
const AverageMortgageOverTime = (() => {
  return HousePricesByQuarter.filter(o => /01-01/.test(o)).slice(0, -1).map((o, i) => {
    const normalizedHomePrice = o[1] / compoundedPricesByYear[i][1] * (compoundedPricesByYear.slice(-1)[0][1] / compoundedPricesByYear[0][1])
    return [o[0], finance.mortgagePayment(normalizedHomePrice, MortgageRatesByMonth.find(p => p[0] === o[0])[1] / 100, 30)]
  });
})();


export default class PredictingMarketReturns extends React.Component {
  constructor () {
    super();

    this.state = {
      expiration_dates: null,
      expiration: null,
      table_slice: null,
      ticker: null,
      readerType: "Condensed",
      loading: 0,
    };

    document.title = "Homes are cheaper than ever. | broc.co"
  }

  componentDidMount () {

  }

  componentDidMount () {
    console.log({ HousePricesByQuarter })
    chart({
      container: document.querySelector("#case-shiller-chart"),
      series: [{
        name: `Average Sales Price of Houses Sold`,
        data: HousePricesByQuarter.map(o => ({ x: new Date(...o[0].split("-")), y: o[1] })),
        color: 'transparent'
      }], subtitle: `Federal Reserve of St. Louis`, source: `https://fred.stlouisfed.org/series/ASPUS`, yAxisText: `Non-inflation adjusted Price ($)`,
    });

    chart({
      container: document.querySelector("#house-price-to-median-income"),
      series: [{
        name: `House Price to Median Income ratio (in 2020 dollars)`,
        data: AverageHomePriceToMedianIncomeRatio.map(o => ({ x: new Date(...o[0].split("-")), y: Math.round(o[1] * 100) / 100 })),
        color: 'transparent'
      }], subtitle: `Federal Reserve of St. Louis`, source: `https://fred.stlouisfed.org/series/MEHOINUSA672N`, yAxisText: `Price to income ratio`,
    });

    chart({
      container: document.querySelector("#mortgage-rates-by-year"),
      series: [{
        name: `30-year mortgage rate`,
        data: MortgageRatesByMonth.map(o => ({ x: new Date(...o[0].split("-")), y: o[1] })),
        color: 'transparent'
      }], subtitle: `Federal Reserve of St. Louis`, source: `https://fred.stlouisfed.org/series/MEHOINUSA672N`, yAxisText: `30-year mortgage rate`,
    });

    chart({
      container: document.querySelector("#mortgage-by-year"),
      series: [{
        name: `Same-house mortgage cost (2020 dollars)`,
        data: AverageMortgageOverTime.map(o => ({ x: new Date(...o[0].split("-")), y: Math.round(o[1]) })),
        color: 'transparent'
      }], subtitle: `Federal Reserve of St. Louis`, source: `https://fred.stlouisfed.org/series/MEHOINUSA672N`, yAxisText: `Mortgage payment`,
    });
  }

  render () {


    return (
      <div className={"blog housing-blog " + (this.state.readerType === "Expanded" ? "blog--expanded" : "blog--expert")}>
        <div className="header" style={{backgroundImage: `url(${SeattleHillsImg})`}}>
          <h3><a href="/">by Brock.</a></h3>
          <div className="header-wrapper">
            <h2>Interactive data series</h2>
            <h1>&nbsp;Homes are cheaper than ever.&nbsp;<br />&nbsp;It’s just harder than ever to notice.&nbsp;</h1>
          </div>
        </div>
        <article>
          <h2>Challenging a generational narrative.</h2>
          <section>
            <p>You clicked this link knowing in your mind that this isn’t true. House prices are high, the proof envelops us. Reporters and everyday Americans alike can recite statistics and recount personal experiences detailing how inaccessible real estate is to homebuyers today. Living in the Bay Area, it’s a day ending in “–day” when you hear a story about a middle class family&rsquo;s house purchased in the ‘80s now being worth a cool two million dollars.</p>
            <p>The data and the stories support the worldview that home prices are more expensive than ever — and in the purest sense that’s absolutely true. In practice it’s completely false. This is because <strong>people don’t typically buy houses, they get mortgages.</strong> This is where it gets complicated.</p>
            <p>Starting from the top, the vertigo-inducing chart that exists only to squash the hopes of millenial home-buyers, <a href="https://fred.stlouisfed.org/series/CSUSHPINSA" target="_blank">The Case-Shiller Home Price Index</a>, tells a story of exponentially increasing home prices that now sit even far above the overbought values that led to the <a href="https://en.wikipedia.org/wiki/Financial_crisis_of_2007%E2%80%932008" target="_blank">2008 Financial Collapse</a>. How can it be possible that in the midst of a global pandemic we are seeing record prices for houses?</p>
          </section>
          <div className="center">
            <div className="figure figure--article-width inline-block">
              <div className="figure--text"><b>Fig 1.</b> Average US house price (1980–2020)</div>
              <div id="case-shiller-chart"></div>
            </div>
          </div>
          <section>
            <h2>Accounting for the basics – inflation and earning power.</h2>
            <p>The chart becomes a lot more reasonable when adjusting for inflation and adjusting for increases in income. Below we show the price of a house as a factor of <i>median income</i> from 1980–2020, however there’s still a notable increase in housing prices over the past forty years. This is where the analysis usually stops, and most people go home thinking that they’ll never be able to afford the quality of home their parents grew up in.</p>
          </section>
          <div className="center">
            <div className="figure figure--article-width inline-block">
              <div className="figure--text"><b>Fig 2.</b> Average house price to median income ratio; inflation adjusted (1980–2020)</div>
              <div id="house-price-to-median-income"></div>
            </div>
          </div>
          <section>
            <h2>But people don’t “buy” houses.</h2>
            <p>One thing that has remained similar over the past forty years is how people finance homes. Americans have a long tradition of using mortgages to pay for homes — putting around 10–20% down and borrowing the rest from the bank.</p>
            <p>Mortgage payments are also the number that most directly affects the month-to-month finances of over 130 million households in the United States. When calculating a mortgage, the most important inputs are the price of the house itself and the length of the mortgage (usually 15 or 30 years). The third however is key to explaining why houses are so affordable: interest rates.</p>
          </section>
          <div className="center">
            <div className="figure figure--article-width inline-block">
              <div className="figure--text"><b>Fig 3.</b> 30-year mortgage rates (1980–2020)</div>
              <div id="mortgage-rates-by-year"></div>
            </div>
          </div>
          <section>
            <p>The cost of financing the same mortgage has fallen an astonishing 72.5% from its all time high in the winter of &lsquo;81, during a wave of stagflation in the United States, marked by a decade-long period of high interest rates and high unemployment. Capital has become so cheap in fact that this single-handedly has driven home affordability to new all time highs.</p>
            <p>To demonstrate this, below we look at a new metric here that I'll call the <span style={{ whiteSpace: "nowrap"}}><i>&ldquo;same-house real mortgage cost&rdquo;</i></span>. The price of the average home has balooned to 5.59x the cost of your average home in 1980, however in the same period interest rates on typical 30-year mortgages have fallen from 13.69% to around 3%. When looking at the mortgage in 2020 (inflation adjusted) terms, we see that this house has actually dropped in price by 39% over the life of the mortgage!</p>
          </section>
          <div className="center">
            <div className="figure inline-block">
              <div className="figure--text"><b>Fig 3.</b> Same-house real morgage cost (1980, 2020)</div>
              <img src={SameHouseMetric} />
            </div>
          </div>
          <section>
            <h2>The cost of a mortgage over the past 40 years: down. A lot.</h2>
            <p>Multiplying our adjusted home prices to the dramatically cheaper cost of financing, shows the real picture: home prices are actually more affordable than ever. There have been upward and downward swings in price, and run-ups like the one leading to the 2008 Financial Crisis are still evident, yet prices are still well below levels experienced in the early 1980s by homebuyers financing through a mortgage.</p>
            <p>This shows that smart money in the 1980s was paying off loans as fast as possible, but smart money in 2020 tries borrow as much money as possible since capital has never been so cheap.</p>
          </section>
          <div className="center">
            <div className="figure figure--article-width inline-block">
              <div className="figure--text"><b>Fig 3.</b> Cost of 30-year mortgage on &ldquo;same&rdquo; US house; in 2020 dollars (1980–2020)</div>
              <div id="mortgage-by-year"></div>
            </div>
          </div>
          <section>
            <h2>Except that’s still not all. Homes are also substantially larger today than in 1980.</h2>
            <p>America leads the world in home sizes. Like a goldfish, American houses have continued to grow to fit their tank. As the suburbs have continued to expand, homes in the United States <a href="https://www.theatlantic.com/family/archive/2019/09/american-houses-big/597811/" target="_blank">have swelled past 2,200 square feet in size</a>, almost double the size of the average home in Germany and France, both countries with similar purchasing power.</p>
            <p>That means that your average house built today is around 56% larger than built in 1980, and your average house sold today is around 40% larger.</p>
            <p>With all this in mind, it appears not only that houses aren’t more expensive than forty years ago, but they are actually dramatically cheaper.</p>
          </section>
          <hr />
          <section>
            <h2>Some follow-up thoughts.</h2>
            <p>Despite whether many people think the housing market today is frothy, or too expensive, the feeling that the market is inaccessible is a valid feeling. I don't believe people have made up a villain, but I do believe the misattribution of the high cost of a home is due to other lurking variables in the way in which we spend money in 2020 that has changed since 1980. My hunch: the <a href="https://www.investopedia.com/student-loan-debt-2019-statistics-and-outlook-4772007" target="_blank">$37,584 in student loans</a> that the average college attendee has upon leaving campus has replaced the average graduate&rsquo;s first-home downpayment.</p>
          </section>
        </article>
      </div>
    )
  }
}