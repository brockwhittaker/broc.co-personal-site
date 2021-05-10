const transformers = {
  metadata: (text) => {
    let metadataEndTag = /^--metadata--/igm.test(text)
    if (!metadataEndTag) {
      return {
        title: undefined,
        publishedAt: undefined,
      };
    }

    let textSplitByNewlines = text.split(/\n/)
    let metadataEndIndex = textSplitByNewlines.findIndex(o => /--metadata--/.test(o))

    const APPROVED_FIELDS = ["title", "publishedAt"]

    let metadata = {}
    textSplitByNewlines.slice(0, metadataEndIndex).map(o => {
      let indexOfDelimeter = o.indexOf(":")

      if (indexOfDelimeter === -1) throw "Error: Each metadata field should be in format 'key: value'."
      let key = o.substr(0, indexOfDelimeter).trim()
      let value = o.substr(indexOfDelimeter + 1).trim()

      return { key, value }
    }).map(o => {
      if (APPROVED_FIELDS.indexOf(o.key) > -1) metadata[o.key] = o.value
    })

    return { metadata, text: textSplitByNewlines.slice(metadataEndIndex + 1).join("\n") }
  },
  hx: (text) => {
    return text.replace(/^((#+)(.+))/gm, (_, __, $1, $2) => {
      let hx = $1.length,
          content = $2.trim()
      return `<h${hx}>${content}</h${hx}>`
    })
  },
  bold: text => {
    return text.replace(/\*\*(.*?)\*\*/gm, `<b>$1</b>`)
  },
  italic: text => {
    return text.replace(/\*(.*?)\*/gm, `<i>$1</i>`)
  },
  link: text => {
    return text.replace(/\[(.+)\]\((.+)\)/gm, `<a href="$2" target="_blank">$1</a>`)
  },
  sanitizeNewLines: text => {
    return text.split(/\n/).map(o => o.trim()).join("\n")
  },
  paragraphs: text => {
    let textSplitByNewlines = text.split(/\n/)
    for (let x in textSplitByNewlines) {
      if (textSplitByNewlines[x] === "") {
        textSplitByNewlines[x - 1] = `<p>${textSplitByNewlines[x - 1]}</p>`
        x--
      }
    }
    textSplitByNewlines[textSplitByNewlines.length - 1] = `<p>${textSplitByNewlines[textSplitByNewlines.length - 1]}</p>`
    return textSplitByNewlines.join("\n")
  }
}

export default class Markdown {
  constructor (markdown) {
    let { text, metadata } = transformers.metadata(markdown)
    this.text = text;
    this.metadata = metadata;
  }

  run (text) {
    this.text = transformers.hx(this.text)
    this.text = transformers.bold(this.text)
    this.text = transformers.italic(this.text)
    this.text = transformers.link(this.text)
    this.text = transformers.sanitizeNewLines(this.text)
    this.text = transformers.paragraphs(this.text)

    return this
  }
}