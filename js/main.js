import SVGFont from './SVGFont.js';


import svg from "../css/fonts/soehne-fett.svg";

fetch(svg).then(svg => svg.text()).then(svg => {
  const font = new SVGFont(svg);
  font.margin = -0.08;
  font.height = 40;
  document.querySelectorAll(".sign > div").forEach(div => font.render(div))
});
