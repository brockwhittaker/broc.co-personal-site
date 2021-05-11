import React from "react";
import ReactDOM from "react-dom";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Index from "./views/Index.js";
import PredictingMarketReturns from "./views/PredictingMarketReturns.js";
import HousePrices from "./views/HousePrices.js"

class App extends React.Component {
  constructor () {
    super();
  }

  render () {
    return (
      <Router>
        <Switch>
          <Route path="/" exact component={Index} />
          <Route path="/predicting-market-returns/" exact component={PredictingMarketReturns} />
          <Route path="/homes-are-cheaper-than-ever/" exact component={HousePrices} />
        </Switch>
      </Router>
    );
  }
}

const generatePathname = () => {
  const alpha = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;
  let str = ``;

  for (let x = 0; x < 5; x++) {
    str += alpha[~~(Math.random() * alpha.length)]
  }

  return str;
}

const pathname = (() => {
  const pathname = localStorage.getItem("brocklytics/t") || generatePathname();
  localStorage.setItem("brocklytics/t", pathname)
  return pathname;
})();

window.history.pushState(null, "", location.pathname + "?t=" + pathname);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
