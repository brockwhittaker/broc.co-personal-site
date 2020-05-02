const rgb = (r, g, b) => {
  return `rgb(${r}, ${g}, ${b})`;
};

class SVGFont {
  constructor (font) {
    let d = new Date();

    this.font = (() => {
      let element = document.createElement("div");
      element.innerHTML = font;
      return element.querySelector("svg");
    })();

    this.max_rect = {
      y: 0,
      height: 0
    };

    this.errors = [];

    const { glyphs, glyph_names } = this.getGlyphs(this.font.querySelectorAll("glyph"));
    this.glyphs = glyphs;
    this.glyph_names = glyph_names;

    const { kernings, kernings_groups } = this.getKernings(this.font.querySelectorAll("hkern"));
    this.kernings = kernings;
    this.kernings_groups = kernings_groups;
  }

  getGlyphs ($fontSVGGlyphs) {
    let glyphs = $fontSVGGlyphs;
    let g_obj = {};
    let g_names = {};

    glyphs.forEach(glyph => {
      let svg = document.createElementNS('http://www.w3.org/2000/svg',"svg");
      svg.setAttribute("transform", "scale(1, -1)");

      let path = document.createElementNS('http://www.w3.org/2000/svg',"path");
      path.setAttribute("d", glyph.getAttribute("d"));

      svg.appendChild(path);
      document.body.appendChild(svg);

      let rect = path.getBBox();
      if (rect.y < this.max_rect.y) this.max_rect.y = rect.y;
      if (rect.height > this.max_rect.height) this.max_rect.height = rect.height;

      document.body.removeChild(svg);

      let data = { svg, rect, glyphName: glyph.getAttribute("glyph-name") }
      g_obj[glyph.getAttribute("unicode")] = { svg, rect, glyphName: glyph.getAttribute("glyph-name"), width: +glyph.getAttribute("horiz-adv-x") };
      g_names[data.glyphName] = data;
    });

    return { glyphs: g_obj, glyph_names: g_names };
  }

  getKernings ($fontSVGGlyphs) {
    let kernings = $fontSVGGlyphs;
    let k_obj = {};
    let kg_obj = {};

    kernings.forEach(kerning => {
      if (kerning.getAttribute("u1")) {
        const u1 = kerning.getAttribute("u1"), u2 = kerning.getAttribute("u2");
        if (!k_obj[u1]) k_obj[u1] = {};
        k_obj[u1][u2] = kerning.getAttribute("k");
      } else if (kerning.getAttribute("g1")) {
        try {
          const g1 = kerning.getAttribute("g1").split(/,/g), g2 = kerning.getAttribute("g2").split(/,/g);
          g1.forEach(a => {
            g2.forEach(b => {
              if (!kg_obj[a]) kg_obj[a] = {};
              kg_obj[a][b] = kerning.getAttribute("k");
            });
          });
        } catch (e) {
          this.errors.push({ error: `Cannot parse kerning`, details: [kerning.getAttribute("g1"), kerning.getAttribute("g2")] });
        }
      }
    });

    return { kernings: k_obj, kernings_groups: kg_obj };
  }

  render (target) {
    let str = target.innerText;
    let container = document.createElement("div");
    let svgs = [];

    let height = this.height || 500;

    let space_width = (this.glyphs["m"].rect.width / this.max_rect.height) * (height / 5);

    for (let x = 0; x < str.length; x++) {
      if (this.glyphs[str[x]]) {
        let { svg, rect } = this.glyphs[str[x]];
        let kern = (() => {
          if (typeof str[x - 1] === "undefined") return;
          let value = this.kernings[str[x - 1]];
          if (value) value = value[str[x]];
          if (value) return value;

          value = this.kernings_groups[this.glyphs[str[x - 1]].glyphName];
          if (value) value = value[this.glyphs[str[x]].glyphName];
          if (value) return value;

          return 0;
        })();

        svg = svg.cloneNode(true);
        svg.setAttribute("character", str[x])

        let path = svg.querySelector("path");

        svgs.push(svg);
        let rel_height = rect.height / this.max_rect.height;
        svg.style.transform = "scale(1, -1) translate(0, " + ((rect.y / this.max_rect.height) * height) + "px)"

        // set the width of a space to 1/5 of an `em` character.
        if (str[x] === " ") svg.style.width = space_width + "px";
        svg.style.width = ((this.glyphs[str[x]].width) / this.max_rect.height) * height;
        svg.setAttribute("height", height * rel_height);
        svg.style.marginRight = (this.margin || -0.031) * height + "px";
        if (kern) {
          svg.style.marginLeft = ((-kern / this.max_rect.height) * height) + "px";
          console.log("kern '" + str[x - 1] + str[x] + "'", kern);
        }
        svg.setAttribute("viewBox", (rect.x - 25) + ' ' +
          (rect.y - 25) + ' ' +
          (rect.width + 50) + ' ' +
          (rect.height + 50));
      }
    }

    target.innerText = "";
    svgs.forEach(svg => {
      target.appendChild(svg)
    });

    this.letters = svgs;

    return this;
  }
}

export default SVGFont;
