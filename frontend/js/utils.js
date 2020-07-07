const El = (text) => {
  var div = document.createElement('div');
  div.innerHTML = text.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
};

export { El }
