// globals..
var url = null;

// snoocore
var reddit = null;

// container for appending the reddit listings
var container = null;

// how many listings to fetch per request
var maxListings = 4;

// id of last fetched listing
var lastListing = null;

// clear container
function clearNode(node)
{
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function gfycatNode(data)
{
  var requestUrl = "http://gfycat.com/cajax/get/" + data.url.replace(/http.*\//, "");
  jsonRequest(requestUrl).then(function(json) {
    var node = document.createElement("div");
    node.innerHTML = json;
    var node = document.createElement("iframe");
    node.setAttribute("frameborder", "0");
    node.setAttribute("scrolling", "no");
    node.setAttribute("width", json.gfyItem.width + "px");
    node.setAttribute("height", json.gfyItem.height + "px");
    node.setAttribute("src", data.url);
    document.getElementById(data.name).appendChild(node);
  }).catch(function(error) {
    var node = document.createElement("div");
    node.innerHTML = "Gfycat error:\n" + error;
    document.getElementById(data.name).appendChild(node);
  });
}

function mediaNode(data)
{
  if (data.media == null) {

    if (data.link_flair_text == "gifv") {

      if (data.domain == "imgur.com") {
        var node = document.createElement("img");
        node.setAttribute("src", data.url.replace("imgur", "i.imgur") + ".gif");
        document.getElementById(data.name).appendChild(node);

      } else if (data.domain == "gfycat.com") {
        gfycatNode(data);
      }

    } else {
      var node = document.createElement("img");
      node.setAttribute("src", data.url);
      document.getElementById(data.name).appendChild(node);
    }

  } else {
    var node = document.createElement("div");
    // now, that's what I call a hack!
    node.innerHTML = data.media.oembed.html.replace('src=\"//cdn', 'src=\"https://cdn');
    node.innerHTML = node.textContent;
    document.getElementById(data.name).appendChild(node);
  }
}

function listingNode(data)
{
  var row = document.createElement("div");
  var link = document.createElement("a");
  var media = document.createElement("div");

  link.setAttribute("href", "http://www.reddit.com" + data.permalink);
  link.innerHTML = data.title;
  link.className = "center";
  media.setAttribute("id", data.name);
  row.appendChild(link);
  row.appendChild(media);

  container.appendChild(row);

  mediaNode(data);
}

function loadNextListing()
{
  window.onscroll = null;

  var promise = null;

  if (lastListing == null) {
    promise = reddit(url).get({ limit: maxListings });
  } else {
    promise = reddit(url).get({ limit: maxListings, after: lastListing });
  }

  promise.then(function(result)
  {
    result.data.children.forEach(function(child) {
      if (! child.data.stickied) {
        listingNode(child.data);
        lastListing = child.data.name;
      }
    });

    window.onscroll = loadMore;

  }).catch(function(error)
  {
    div = document.createElement("div");
    div.innerHTML = "ERROR: " + error;
    container.appendChild(div);
  });
}

function loadMore()
{
  var barrier      = 1.5;
      scrollTop    = document.documentElement.scrollTop;
      scrollTopMax = document.documentElement.scrollTopMax;

  if (scrollTopMax / scrollTop < barrier) {
    loadNextListing();
  }
}

function main()
{
  // initialize global variables
  url = '/r/woahdude/hot'
  container = document.getElementById("container");
  reddit = new window.Snoocore({ userAgent: 'LazyBrowser@0.0.1 by jrk-' });

  loadNextListing();
  window.onscroll = loadMore;
}

function jsonRequest(url, handler)
{
  return new Promise(function(fulfill, reject) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);

    req.onload = function() {
      if (req.readyState == 4 && req.status == 200) {
        fulfill(JSON.parse(req.responseText));
      } else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = function() {
      reject(Error("network error"));
    };

    req.send();
  });
}
