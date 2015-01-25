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

function appendListing(result)
{
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
  link.className = "center";
  row.appendChild(link);

  // right.className = "col-xs-8";
  // img.className = "img-responsive";
  // img.setAttribute("src", data.url);
  // right.appendChild(img);
  // row.appendChild(right);

  img.className = "center";
  img.setAttribute("src", data.url);
  row.appendChild(img);

  container.innerHTML = "";
  container.appendChild(row);
}

function updateListing(next)
{
  clear(container);
  container.innerHTML = "Loading ...";

  if (next) {
    var promise = null;

    if (history.isEmpty()) {
      promise = reddit(url).get({ limit: 1 });
    } else {
      var name = history.peek().data.children[0].data.name;
      promise = reddit(url).get({ limit: 1, after: name });
    }

    promise.then(function(result)
    {
      appendListing(result);
      return result;
    }).then(function(result)
    {
      history.push(result);
      return result;
    }).then(function(result)
    {
      updatePrev();
    }).catch(function(error)
    {
      div = document.createElement("div");
      div.innerHTML = "ERROR: " + error;
      container.appendChild(div);
    });

  } else {
    history.pop();
    appendListing(history.peek());
    updatePrev();
  }
}

function updatePrev()
{
  var prev_li = document.getElementById("prev-li");
  var prev_a = document.getElementById("prev-a");

  if (history.size() == 1) {
    prev_li.className = "previous disabled";
    prev_a.setAttribute("onClick", "");
  } else {
    prev_li.className = "previous";
    prev_a.setAttribute("onClick", "updateListing(false);");
  }
}

function main()
{
  // initialize global variables
  url = '/r/aww/hot'
  history = new Stack();
  container = document.getElementById("container");
  reddit = new window.Snoocore({ userAgent: 'LazyBrowser@0.0.1 by jrk-' });
  updateListing(true);
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
