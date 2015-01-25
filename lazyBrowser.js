// globals..
var url = null;

// snoocore
var reddit = null;

// history stack
var history = null;

// container for appending the reddit listings
var container = null;

function listing(next)
{
  var promise = null;

  if (next) {
    if (history.isEmpty()) {
      promise = reddit(url).get({ limit: 1 });
    } else {
      promise = reddit(url).get({ limit: 1, after: history.peek() });
    }

  } else {
    url = "http://www.reddit.com/by_id/" + history.pop() + ".json";
    promise = reddit.raw(url).get();
  }

  promise.then(function(result) {
    // clear container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

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

    if (next) {
      history.push(data.name);
    }

  }).catch(function(error) {
    div = document.createElement("div");
    div.innerHTML = "ERROR: " + error;
    container.appendChild(div)
  });
}

// function updateNav(start, id)
// {
//   document.getElementById("next").setAttribute("href", "?dir=next&id=" + id);
//
//   if (start) {
//     document.getElementById("prev-button").className="previous disabled";
//   } else {
//     document.getElementById("prev").setAttribute("href", "?dir=prev&id=" + id);
//   }
// }

// function getUrlVars()
// {
//   var vars = {};
//   var parts =
//     window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
//       function(m,key,value) {
//         vars[key] = value;
//       });
//   return vars;
// }

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
  this.isEmpty = isEmpty;
}

function push(element) {
  this.dataStore[this.top++] = element;
}

function pop() {
  return this.dataStore[--this.top];
}

function peek() {
  return this.dataStore[this.top-1];
}

function length() {
  return this.top;
}

function clear() {
  this.top = 0;
}

function isEmpty()
{
  return this.top == 0;
}
