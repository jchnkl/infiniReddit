// globals..
var url = null;

// snoocore
var reddit = null;

// container for appending the reddit listings
var container = null;

// how many listings to fetch per request
var maxListings = 6;

// id of last fetched listing
var lastListing = null;

// show NSFW by default
showNSFW = false;

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
    appendMediaNode(data.name, node);
  }).catch(function(error) {
    var node = document.createElement("div");
    node.innerHTML = "Gfycat error:\n" + error;
    appendMediaNode(data.name, node);
  });
}

function appendMediaNode(name, node)
{
  var target = document.getElementById(name);
  target.innerHTML = "";
  target.appendChild(node);
}

function mediaNode(data)
{
  if (data.media == null) {

    if (data.link_flair_text == "gifv") {

      if (data.domain == "imgur.com") {
        var node = document.createElement("img");
        node.setAttribute("src", data.url.replace("imgur", "i.imgur") + ".gif");
        appendMediaNode(data.name, node);

      } else if (data.domain == "gfycat.com") {
        gfycatNode(data);
      }

    } else {
      var node = document.createElement("img");
      node.setAttribute("src", data.url);
      appendMediaNode(data.name, node);
    }

  } else {
    var node = document.createElement("div");
    // now, that's what I call a hack!
    node.innerHTML = data.media.oembed.html.replace('src=\"//cdn', 'src=\"https://cdn');
    node.innerHTML = node.textContent;
    appendMediaNode(data.name, node);
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
  row.appendChild(link);

  media.setAttribute("id", data.name);
  media.innerHTML = "Loading ..";

  if (data.over_18) {
    media.className = "nsfw";

    if (showNSFW) {
      media.style.display = "block";
    } else {
      media.style.display = "none";
    }

    var nsfw = document.createElement("a");
    nsfw.id = data.name + "_nsfw_switch";
    nsfw.setAttribute("href", "javascript:;");
    nsfw.setAttribute("onClick", "toggleNsfw(\"" + data.name + "\");");
    nsfw.style.color = "#ff0000";
    nsfw.innerHTML = "Show NSFW";
    nsfw.className = "center";
    row.appendChild(nsfw);
  }

  row.appendChild(media);

  container.appendChild(row);

  var hr = document.createElement("hr");
  hr.setAttribute("width", "90%")
  container.appendChild(hr);

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

// yuk
function toggleNsfw(id)
{
  var nsfw = document.getElementById(id);
  var link = document.getElementById(id + "_nsfw_switch");

  if (nsfw.style.display == "block") {
    nsfw.style.display = "none";
    link.innerHTML = "Show NSFW";

  } else {
    nsfw.style.display = "block";
    link.innerHTML = "Hide NSFW";
  }
}

// yukyuk
function toggleAllNsfw()
{
  var linkText = "";
  var display = "";
  var link = document.getElementById("global_nsfw_switch");

  if (showNSFW) {
    showNSFW = false;
    linkText = "Show NSFW";
    display = "none";
    link.innerHTML = "Show <b>all</b> NSFW content"
  } else {
    showNSFW = true;
    linkText = "Hide NSFW";
    display = "block";
    link.innerHTML = "Hide <b>all</b> NSFW content"
  }

  var nsfw = document.getElementsByClassName("nsfw");
  for (var i = 0; i < nsfw.length; ++i) {
    nsfw[i].style.display = display;
    var link = document.getElementById(nsfw[i].id + "_nsfw_switch");
    link.innerHTML = linkText;
  }
}

function getSort()
{
  var obj = document.getElementById("SubSelect");
  return obj.options[obj.selectedIndex].text;
}

function chooseSub()
{
  if (document.SubForm.Sub.value == "") {
    url = "/" + getSort();
  } else {
    url = "/r/" + document.SubForm.Sub.value + "/" + getSort();
  }

  lastListing = null;
  clearNode(container);
  loadNextListing();
}

function main()
{
  // initialize global variables
  var sub = getUrlVars()["Sub"];
  if (sub == null) {
    url = "/" + getSort();
  } else {
    url = "/r/" + sub + "/" + getSort();
  }
  container = document.getElementById("container");
  reddit = new window.Snoocore({ userAgent: 'InfiniReddit@0.0.1 by jrk-' });

  loadNextListing();
  window.onscroll = loadMore;
}

function getUrlVars()
{
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
      function(m,key,value) {
        vars[key] = value;
      });
  return vars;
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
