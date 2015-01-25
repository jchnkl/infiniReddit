// globals..
var url = null;

// snoocore
var reddit = null;

// history stack
var history = null;

// container for appending the reddit listings
var container = null;

// clear container
function clear(node)
{
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function listing(next)
{
  clear(container);

  container.innerHTML = "Loading ...";

  var promise = null;

  if (next) {
    if (history.isEmpty()) {
      promise = reddit(url).get({ limit: 1 });
    } else {
      promise = reddit(url).get({ limit: 1, after: history.peek() });
    }

  } else {
    history.pop();
    var by_id = "http://www.reddit.com/by_id/" + history.peek() + ".json";
    promise = reddit.raw(by_id).get();
  }

  promise.then(function(result) {

    var data = result.data.children[0].data;
    var thumbnail = document.createElement("img");
    var img = document.createElement("img");
    var row = document.createElement("div");
    var left = document.createElement("div");
    var right = document.createElement("div");
    var link = document.createElement("a");

    // row.className = "row";
    // left.className = "col-xs-4";
    // thumbnail.setAttribute("src", data.thumbnail);

    link.setAttribute("href", "http://www.reddit.com" + data.permalink);
    link.innerHTML = data.title;
    left.className = "center";
    left.appendChild(thumbnail);
    left.appendChild(link);
    row.appendChild(left);

    // right.className = "col-xs-8";
    // img.className = "img-responsive";
    // img.setAttribute("src", data.url);
    // right.appendChild(img);
    // row.appendChild(right);

    img.className = "center";
    img.setAttribute("src", data.url);
    right.appendChild(img);
    row.appendChild(right);

    container.appendChild(row);

    var prev = document.getElementById("prev");
    container.innerHTML = "";

    if (history.isEmpty()) {
      prev.className = "previous disabled"
    } else {
      prev.className = "previous";
    }

    if (next) {
      history.push(data.name);
    }

  }).catch(function(error) {
    div = document.createElement("div");
    div.innerHTML = "ERROR: " + error;
    container.appendChild(div)
  });
}

function main() {
  // initialize global variables
  url = '/r/aww/hot'
  history = new Stack();
  container = document.getElementById("container");
  reddit = new window.Snoocore({ userAgent: 'LazyBrowser@0.0.1 by jrk-' });
  listing(true);
}

// yay for a sane STL..
function Stack() {
  this.dataStore = [];
  this.top = 0;
  this.push = push;
  this.pop = pop;
  this.peek = peek;
  this.size = size;
  this.isEmpty = isEmpty;
}

function push(element) {
  this.dataStore[this.top] = element;
  ++this.top;
}

function pop() {
  if (this.top > 0) {
    --this.top;
    var tmp = this.dataStore[this.top];
    this.dataStore.pop();
    return tmp;
  } else {
    return null;
  }
}

function peek() {
  if (this.top > 0) {
    return this.dataStore[this.top - 1];
  } else {
    return null;
  }
}

function size() {
  return this.top;
}

function clear() {
  this.dataStore = [];
  this.top = 0;
}

function isEmpty()
{
  return this.top == 0;
}
