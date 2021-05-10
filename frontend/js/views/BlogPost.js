import React from 'react';

import Markdown from '../utils/Markdown';

import {
  useParams
} from "react-router-dom";

export default class Index extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      blog: null,
      metadata: {}
    }
  }
  componentDidMount () {
    let { blog: blogSlug } = this.props.match.params;
    if (/\.md$/.test(blogSlug)) blogSlug = blogSlug.replace(/.md$/, "")
    fetch(`/api/posts/${blogSlug}.md`).then(r => r.text()).then(markdown => {
      const { text, metadata } = new Markdown(markdown).run()
      console.log(metadata.publishedAt)
      this.setState({ blog: text, metadata })
    })
  }
  render () {
    const { metadata, blog } = this.state
    return (
      <div id="blog">
        <div className="center-content">
          <h1>{ metadata.title }</h1>
          <div className="metadata-section">
            <div className="metadata-section--published-at">{ new Date(+metadata.publishedAt).toDateString() }</div>
            <div className="metadata-section--views">{ metadata.views }</div>
          </div>
          <article dangerouslySetInnerHTML={{__html: this.state.blog}}>
          </article>
        </div>
      </div>
    )
  }
}
