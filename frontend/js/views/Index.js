import React from 'react';

import SVGFont from '../SVGFont.js';

import svg from "../../css/fonts/soehne-fett.svg";

import hedcutURL from "../../images/hedcut-tiny.png";

import figmaURL from "../../images/figma-logo.svg";
import bigSparrowURL from "../../images/big-sparrow.png";
import porticoPayURL from "../../images/portico-pay.png";
import zulipURL from "../../images/zulip.png";

import labelInStealthURL from "../../images/label--in-stealth.png";
import labelSparrowURL from "../../images/label--sparrow.png";
import labelPorticoPayURL from "../../images/label--portico-pay.png";
import labelZulipURL from "../../images/label--zulip.png";
import labelFigmaURL from "../../images/label--figma.png";

import labelStochasticMarketModellingURL from "../../images/label--stochastic-market-modeling.png";
import kurtosisExplanationURL from "../../images/kurtosis-explanation.png";
import iVStatisticalArbitrageURL from "../../images/iv-statistical-arbitrage.png";
import labelOrganicFontDisplayURL from "../../images/label--organic-font-display.png";
import labelMetaURL from "../../images/label--meta.png";
import labelBitarraysInJSURL from "../../images/label--bitarrays-in-js.png";
import bitarrayURL from "../../images/bit-array.png";
import metaURL from "../../images/meta.png";

export default class Index extends React.Component {
  componentDidMount () {
    document.body.classList.add("no-transition");
    document.body.classList.add("hide");

    setTimeout(function () {
      document.body.classList.remove("no-transition");
      document.body.classList.remove("hide");
    }, 200);

    fetch(svg).then(svg => svg.text()).then(svg => {
      const font = new SVGFont(svg);
      font.margin = -0.08;
      font.height = 40;
      document.querySelectorAll(".sign > div").forEach(div => font.render(div))
    });
  }

  render () {
    return (
      <div id="profile">
        <div id="bio" className="section">
          <img id="hedcut" src={hedcutURL} />
          <div className="inline-block bio-text">
            <h2>Bio</h2>
            <p>👋 I'm Brock Whittaker and I'm a product engineer &amp; designer working at Figma and living in San Francisco.</p>
            <p>I was the founding engineer at two startups and built tech used by dozens of companies ranging from multi-variate testing and elastic price segmentation, to building software and processes with HIPAA compliance for many of the largest tech companies.</p>
            <p>I now work on the <a href="https://figma.com/community" target="_blank">Community</a> product at Figma, helping Figma users share plugins, files, and collaborate together.</p>
            <p className="contact">Contact me at <a href="mailto:whittakerbrock@gmail.com">whittakerbrock@gmail.com</a>.</p>
          </div>
        </div>
        <div id="work" className="section">
          <h2>Recent Experience</h2>
          <div className="work-section">
            <div className="work-logo" style={{ backgroundImage: `url(${figmaURL})`, backgroundSize: `90% 90%`, filter: `saturate(0) contrast(1.3)`}}></div>
            <div className="work-description">
              <h3><img className="h-55" src={labelFigmaURL} /><a className="site-link">Figma Site</a></h3>
              <p>An engineer working on building a Community product for Figma to help designers collaborate, as well as making design more accessible to all.</p>
            </div>
          </div>
          <div className="work-section">
            <div className="work-logo" style={{ backgroundImage: `url(${bigSparrowURL})` }}></div>
            <div className="work-description">
              <h3><img className="h-55" src={labelSparrowURL} /><a className="site-link" target="_blank" href="https://trysparrow.com/">Sparrow Site</a></h3>
              <p>Built tech from the ground up, including all data intake, processing, automation steps such as auto-PDF generation, and HIPAA-level compliance for sensitive medical records.</p>
            </div>
          </div>
          <div className="work-section">
            <div className="work-logo" style={{ backgroundImage: `url(${porticoPayURL})`, backgroundSize: `90% 90%` }}></div>
            <div className="work-description">
              <h3><img className="h-75" src={labelPorticoPayURL} /><a className="site-link" target="_blank" href="https://porticopay.com/">Portico Pay Site</a></h3>
              <p>Built a platform for multi-variate testing, price differentiation, and one-click micropayments across the web for publishers like <i>The San Francisco Chronicle</i>.</p>
            </div>
          </div>
          <div className="work-section">
            <div className="work-logo" style={{ backgroundImage: `url(${zulipURL})`, backgroundSize: `90%` }}></div>
            <div className="work-description">
              <h3><img className="h-75 h-75--zulip" src={labelZulipURL} /><a className="site-link" target="_blank" href="https://zulipchat.com/">Zulip Chat Site</a></h3>
              <p>A software engineer working on scaling front-end components to work for organizations with thousands of users.</p>
            </div>
          </div>
        </div>
        <div id="experiments" className="section">
          <h2>Experiments</h2>
          <div className="work-section">
            <div className="work-description">
              <h3><img className="h-75" src={labelStochasticMarketModellingURL} /></h3>
              <p>I've been interested in the markets for longer than I&rsquo;ve been interested in programming; in fact it was the desire to better model equities that forced me to write my first line of code in PHP six years ago.</p>
              <p>One thing that eluded me for a while is the narrative around <i>Implied Volatility</i> – a phenonemon that only presented itself after the black swan crash of 1987 where the markets went down double digit percentages.</p>
              <p>The effect appears to be created by options buyers in the market that are willing to pay more for options far out-of-the-money and far in-the-money, however the concept of flat volatility space is dependent on the concept that market returns are normally distributed – which as of the crash in 1987 we know they are not.</p>
              <p>If we know markets are abnormal, and we can more closely model returns than with a normal distribution, we should in theory be able to model those returns to find the effective Black-Scholes values, and find an implied volatility curve for a given option.</p>
              <p className="indent"><b>The what:</b> I created a better model for equity returns and applied it to create implied volatility curves for equities to find option mispricings on Robinhood.</p>
              <p className="indent"><b>The result:</b> A much better guide for quickly selecting options strategies that gives me a market neutral advantage on options that are over/underpriced by the market.</p>

            </div>
            <a href="https://investing.690fund.com/" target="_blank" id="stochasticMarketDemo" className="work-demo work-demo--flex">
              <div>
                <img src={kurtosisExplanationURL} />
                <img src={iVStatisticalArbitrageURL} />
                <div className="explanation">Click here to read a more in-depth overview.</div>
              </div>
            </a>
          </div>
          <div className="work-section">
            <div className="work-description">
              <h3><img className="h-75" src={labelOrganicFontDisplayURL} /></h3>
              <p>Computers are excellent at perfection — they excel at doing exactly what they're told. With standard font support on computers, we've become constrained by the perfection of our computers&rsquo; typesetting ability. Before the NYC Subway signs were digitized and developed using Helvetica, they were made by hand with a mélange of fonts like <a href="https://klim.co.nz/blog/new-details-about-origins-akzidenz-grotesk/" target="_blank">Akzidenz Grotesk</a> and set with far less precision than any modern program. This demo has been created using a descendent of <i>Akzidenz Grotesk</i> to best resemble the feel of the 1970's NYC subway signs.</p>
              <p className="indent"><b>The what:</b> I created a way to deconstruct fonts as their constituent SVG characters, where I re-set them using any built in kerning information (or not!) and a collection of important esoterics like <i>horiz-adv-x</i> and <i>cap-height</i>.</p>
              <p className="indent"><b>The result:</b> A subtly more &ldquo;human&rdquo; font display. Similar to the result of an unskilled typographer setting letters on a poster. This can also be used to open the door to SVG-level animations – but on text. <i>Inspect element</i> on the graphic demo to see how it's created.
              </p>
            </div>
            <div id="fontDemo" className="work-demo work-demo--flex">
              <div>
              <div className="sign">
                <div>59 St-Lexington Av Station</div>
              </div>
              <div className="sign">
                <div className="s-letter">N</div>
                <div className="s-letter s-letter--q">Q</div>
                <div className="s-letter">R</div>
                <div className="s-letter">W</div>
                <div className="s-letter s-letter--grey">S</div>
                <div>Port Authority</div>
                <div>42 Street Station</div>
              </div>
              <div className="sign">
                <div>Uptown & Queens</div>
              </div>
              <div className="explanation">Above is a live demo of the routine in action.</div>
              </div>
            </div>
          </div>
          <div className="work-section">
            <div className="work-description">
              <h3><img className="h-55" src={labelMetaURL} /></h3>
              <p>Think Pocket meets Medium, with a social flair. Done as a commission, this project was an exercise in making no assumptions. The core issue of saving and retrieving highlights across the web starts with JavaScript <i>Range</i> selections, and it only gets worse. Don't count on the text remaining constant, the document remaining constant, the path remaining constant, the content existing at page load, or not being dynamically destroyed and recreated. Don't count on the CSS cooperating, the page JavaScript not overriding shortcuts or actions. Don't count on anything.</p>
              <p className="indent"><b>The what:</b> I created a Chrome extension that allows you to highlight interesting tid bits across the web and save notes that your friends can see (if you make public). Next time you send a <i>Journal</i> article to a friend, send it with annotations!</p>
              <p className="indent"><b>The result:</b> A better Pocket, and a much deeper personal respect for how wild the web can be.
              </p>
            </div>
            <a href="https://trymeta.app/" target="_blank" id="metaDemo" className="work-demo work-demo--flex">
              <div>
                <img src={metaURL} />
                <div className="explanation">Click here to see the Meta extension demo..</div>
              </div>
            </a>
          </div>
          <div className="work-section">
            <div className="work-description">
              <h3><img className="h-60" src={labelBitarraysInJSURL} /></h3>
              <p>While programming a markov chain backtesting strategy I was holding millions of booleans. This was in the 2010s, so while the optimization was not worth making as I wasn't running this on my grandpa's <i>Commodore 64</i>, I was curious about the speed tradeoff and memory savings you could save by converting an array of booleans to a bit-flag array.</p>
              <p className="indent"><b>The what:</b> I created  a bit-flag array using 32-bit fixed arrays in javascript.</p>
              <p className="indent"><b>The result:</b> A structure that was 98.7% smaller than an array of booleans, and 30% faster than a dynamically allocated array.</p>
            </div>
            <a href="https://github.com/brockwhittaker/BitArray.js" target="_blank" id="bitArrayDemo" className="work-demo work-demo--flex">
              <div>
                <img src={bitarrayURL} />
                <div className="explanation">Click here to see the github repo.</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    )
  }
}
