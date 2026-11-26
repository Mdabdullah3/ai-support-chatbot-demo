// Loom & Co. demo store front end.
// Plain JavaScript, no build step. Store data comes from store.js.

(function () {
  var STORE = window.STORE;
  var answerFromStore = window.answerFromStore;

  var GRADIENTS = {
    tee: "linear-gradient(135deg, #7ba05b, #4a6b3a)",
    wallet: "linear-gradient(135deg, #c98a5e, #8a5a34)",
    "mug-set": "linear-gradient(135deg, #8fa8bf, #5b748c)",
    candle: "linear-gradient(135deg, #e0b25c, #b07f2e)",
    tote: "linear-gradient(135deg, #a8a58c, #7c7a64)",
    blanket: "linear-gradient(135deg, #9b8ec4, #6b5f94)"
  };

  function $(id) {
    return document.getElementById(id);
  }

  function money(n) {
    return "$" + n;
  }

  function stockBadge(p) {
    if (p.stock === 0) {
      return '<span class="badge badge-red">Sold out</span>';
    }
    if (p.stock <= 5) {
      return '<span class="badge badge-amber">Only ' + p.stock + ' left</span>';
    }
    return '<span class="badge badge-green">In stock</span>';
  }

  function initials(name) {
    return name
      .split(" ")
      .map(function (w) {
        return w[0];
      })
      .slice(0, 2)
      .join("");
  }

  // Products.
  var activeCategory = "All";
  var searchText = "";

  function renderProducts() {
    var grid = $("productGrid");
    var list = STORE.products.filter(function (p) {
      var okCat = activeCategory === "All" || p.category === activeCategory;
      var q = searchText.trim().toLowerCase();
      var okSearch =
        !q ||
        p.name.toLowerCase().indexOf(q) !== -1 ||
        p.description.toLowerCase().indexOf(q) !== -1 ||
        p.category.toLowerCase().indexOf(q) !== -1;
      return okCat && okSearch;
    });
    if (!list.length) {
      grid.innerHTML = '<p class="empty-note">No products match that search. Try another word.</p>';
      return;
    }
    grid.innerHTML = list
      .map(function (p) {
        return (
          '<article class="card">' +
          '<div class="card-img" style="background:' +
          GRADIENTS[p.id] +
          '">' +
          '<span class="stock-flag">' +
          stockBadge(p) +
          "</span>" +
          initials(p.name) +
          "</div>" +
          '<div class="card-body">' +
          "<h3>" +
          p.name +
          "</h3>" +
          '<div class="card-price">' +
          money(p.price) +
          "</div>" +
          '<p class="card-desc">' +
          p.description +
          "</p>" +
          '<p class="card-meta">Material: ' +
          p.material +
          "<br>Colors: " +
          p.colors.join(", ") +
          " - Sizes: " +
          p.sizes.join(", ") +
          "</p>" +
          '<div class="card-actions">' +
          '<button class="add-btn" data-add="' +
          p.id +
          '" type="button" ' +
          (p.stock === 0 ? "disabled" : "") +
          ">" +
          (p.stock === 0 ? "Sold out" : "Add to bag") +
          "</button>" +
          '<button class="ask-btn" data-ask="' +
          p.id +
          '" type="button">Ask Luna</button>' +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-category");
      renderProducts();
    });
  });

  function bindSearch(input, isNav) {
    input.addEventListener("input", function () {
      searchText = input.value;
      if (isNav) {
        $("shopSearch").value = input.value;
      } else {
        $("navSearch").value = input.value;
      }
      renderProducts();
    });
  }
  bindSearch($("shopSearch"), false);
  bindSearch($("navSearch"), true);

  $("productGrid").addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add]");
    var askBtn = e.target.closest("[data-ask]");
    if (addBtn) {
      addToCart(addBtn.getAttribute("data-add"), 1);
    }
    if (askBtn) {
      var p = STORE.products.find(function (x) {
        return x.id === askBtn.getAttribute("data-ask");
      });
      if (p) {
        openChat();
        sendUserMessage("Tell me about the " + p.name);
      }
    }
  });

  // Policies and FAQ.
  $("policyGrid").innerHTML =
    '<div class="policy"><h3>Shipping</h3><p>' +
    STORE.policies.shipping +
    "</p></div>" +
    '<div class="policy"><h3>Returns and refunds</h3><p>' +
    STORE.policies.returns +
    "</p></div>" +
    '<div class="policy"><h3>Payments</h3><p>' +
    STORE.policies.payments +
    "</p></div>";

  $("faqList").innerHTML = STORE.faqs
    .map(function (f, i) {
      return (
        '<div class="faq-item">' +
        '<button class="faq-q" type="button" data-faq="' +
        i +
        '">' +
        f.q +
        "<span>+</span></button>" +
        '<div class="faq-a">' +
        f.a +
        "</div></div>"
      );
    })
    .join("");

  $("faqList").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-faq]");
    if (!btn) return;
    btn.parentElement.classList.toggle("open");
  });

  // Order tracking on the page.
  function renderOrder(id) {
    var box = $("trackResult");
    var clean = (id || "").replace(/[^0-9]/g, "");
    var order = STORE.orders.find(function (o) {
      return o.id === clean;
    });
    if (!order) {
      box.innerHTML =
        "<h3>We could not find that order.</h3><p>Try 1001, 1002 or 1003, or check the number on your confirmation email.</p>";
      return;
    }
    var items = order.items
      .map(function (i) {
        return i.qty + " x " + i.name + " (" + i.detail + ")";
      })
      .join(", ");
    box.innerHTML =
      "<h3>Order " +
      order.id +
      " - " +
      order.status +
      "</h3>" +
      '<p class="status-line">' +
      order.note +
      "</p>" +
      "<p>Placed: " +
      order.placed +
      "</p>" +
      "<p>Items: " +
      items +
      "</p>" +
      "<p>Carrier: " +
      order.carrier +
      " - Tracking: " +
      order.tracking +
      "</p>" +
      "<p>Expected delivery: " +
      order.expectedDelivery +
      "</p>";
  }

  $("trackBtn").addEventListener("click", function () {
    renderOrder($("trackInput").value);
  });
  $("trackInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") renderOrder($("trackInput").value);
  });

  // Cart.
  var cart = {};
  try {
    cart = JSON.parse(localStorage.getItem("loom-cart") || "{}");
  } catch (err) {
    cart = {};
  }

  function saveCart() {
    try {
      localStorage.setItem("loom-cart", JSON.stringify(cart));
    } catch (err) {
      // Storage can be off in some browsers. The cart still works for the visit.
    }
  }

  function cartCount() {
    return Object.keys(cart).reduce(function (sum, id) {
      return sum + cart[id];
    }, 0);
  }

  function cartTotal() {
    return Object.keys(cart).reduce(function (sum, id) {
      var p = STORE.products.find(function (x) {
        return x.id === id;
      });
      return p ? sum + p.price * cart[id] : sum;
    }, 0);
  }

  function addToCart(id, qty) {
    var p = STORE.products.find(function (x) {
      return x.id === id;
    });
    if (!p || p.stock === 0) return;
    cart[id] = Math.min((cart[id] || 0) + qty, p.stock);
    saveCart();
    renderCart();
    openDrawer();
  }

  function renderCart() {
    $("bagCount").textContent = String(cartCount());
    var body = $("cartBody");
    var foot = $("cartFoot");
    var ids = Object.keys(cart).filter(function (id) {
      return cart[id] > 0;
    });
    if (!ids.length) {
      body.innerHTML = '<p class="cart-empty">Your bag is empty. Add something you like.</p>';
      foot.style.display = "none";
      return;
    }
    body.innerHTML = ids
      .map(function (id) {
        var p = STORE.products.find(function (x) {
          return x.id === id;
        });
        return (
          '<div class="cart-item">' +
          '<div class="cart-thumb" style="background:' +
          GRADIENTS[p.id] +
          '">' +
          initials(p.name) +
          "</div>" +
          "<div><h4>" +
          p.name +
          "</h4><p>" +
          money(p.price) +
          " each</p>" +
          '<span class="qty"><button data-dec="' +
          p.id +
          '" type="button">-</button>' +
          cart[id] +
          '<button data-inc="' +
          p.id +
          '" type="button">+</button></span>' +
          "</div>" +
          "<div><strong>" +
          money(p.price * cart[id]) +
          "</strong></div>" +
          "</div>"
        );
      })
      .join("");
    var total = cartTotal();
    var threshold = STORE.freeShippingThreshold;
    var remaining = Math.max(0, threshold - total);
    $("shipProgress").textContent =
      remaining > 0
        ? "Add " + money(remaining) + " more for free standard shipping."
        : "You have free standard shipping.";
    $("shipFill").style.width = Math.min(100, (total / threshold) * 100) + "%";
    $("subtotalVal").textContent = money(total);
    foot.style.display = "block";
  }

  $("cartBody").addEventListener("click", function (e) {
    var inc = e.target.closest("[data-inc]");
    var dec = e.target.closest("[data-dec]");
    if (inc) {
      var p1 = STORE.products.find(function (x) {
        return x.id === inc.getAttribute("data-inc");
      });
      cart[p1.id] = Math.min(cart[p1.id] + 1, p1.stock);
    }
    if (dec) {
      var id = dec.getAttribute("data-dec");
      cart[id] = cart[id] - 1;
      if (cart[id] <= 0) delete cart[id];
    }
    if (inc || dec) {
      saveCart();
      renderCart();
    }
  });

  function openDrawer() {
    $("cartDrawer").classList.add("open");
    $("drawerBackdrop").classList.add("open");
  }

  function closeDrawer() {
    $("cartDrawer").classList.remove("open");
    $("drawerBackdrop").classList.remove("open");
  }

  $("bagBtn").addEventListener("click", openDrawer);
  $("drawerClose").addEventListener("click", closeDrawer);
  $("drawerBackdrop").addEventListener("click", closeDrawer);
  $("checkoutBtn").addEventListener("click", function () {
    alert("Demo checkout. No payment is taken and no order is placed.");
  });

  renderCart();

  // Chat widget.
  var chatOpen = false;
  var chatHistory = [];
  var askedOnce = false;
  var chatBody = $("chatBody");
  var chips = $("chatChips");

  function openChat() {
    $("chatPanel").classList.add("open");
    chatOpen = true;
    if (!chatHistory.length) {
      addBotMessage(
        "Hi, I am Luna from Loom & Co. I can help with product details and stock, comparing products, gift ideas, order tracking, shipping, returns and discount codes. What do you need?"
      );
    }
    $("chatInput").focus();
  }

  function closeChat() {
    $("chatPanel").classList.remove("open");
    chatOpen = false;
    showChatMain();
  }

  function scrollChat() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addUserMessage(text) {
    var div = document.createElement("div");
    div.className = "msg msg-user";
    div.textContent = text;
    chatBody.appendChild(div);
    scrollChat();
  }

  function addBotMessage(text, source) {
    var div = document.createElement("div");
    div.className = "msg msg-bot";
    div.textContent = text;
    chatBody.appendChild(div);
    if (source === "store") {
      var label = document.createElement("div");
      label.className = "msg-source";
      label.textContent = "Answered from store data";
      chatBody.appendChild(label);
    }
    scrollChat();
  }

  function showTyping() {
    var div = document.createElement("div");
    div.className = "typing";
    div.id = "typingRow";
    div.innerHTML =
      '<span class="dots"><i></i><i></i><i></i></span><span>Luna is typing... please wait a moment for the reply.</span>';
    chatBody.appendChild(div);
    scrollChat();
    return div;
  }

  function hideChips() {
    chips.style.display = "none";
  }

  function askViaApi(text) {
    var typing = showTyping();
    var history = chatHistory.slice(-10);
    var done = false;

    function finish(reply, source) {
      if (done) return;
      done = true;
      if (typing.parentNode) typing.parentNode.removeChild(typing);
      addBotMessage(reply, source);
      chatHistory.push({ role: "assistant", content: reply });
    }

    var timer = setTimeout(function () {
      finish(answerFromStore(text), "store");
    }, 28000);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, messages: history })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("bad status " + res.status);
        return res.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        if (data && data.reply) {
          finish(data.reply, data.source === "ai" ? "ai" : "store");
        } else {
          finish(answerFromStore(text), "store");
        }
      })
      .catch(function () {
        clearTimeout(timer);
        finish(answerFromStore(text), "store");
      });
  }

  function sendUserMessage(text) {
    var clean = (text || "").trim();
    if (!clean) return;
    addUserMessage(clean);
    chatHistory.push({ role: "user", content: clean });
    if (!askedOnce) {
      askedOnce = true;
      hideChips();
    }
    askViaApi(clean);
  }

  $("chatFab").addEventListener("click", function () {
    if (chatOpen) {
      closeChat();
    } else {
      openChat();
    }
  });
  $("chatClose").addEventListener("click", closeChat);
  $("heroAskBtn").addEventListener("click", openChat);
  $("heroAskWallet").addEventListener("click", function () {
    openChat();
    sendUserMessage("Tell me about the Leather Wallet");
  });

  chips.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    sendUserMessage(chip.textContent.trim());
  });

  $("chatSend").addEventListener("click", function () {
    sendUserMessage($("chatInput").value);
    $("chatInput").value = "";
  });
  $("chatInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendUserMessage($("chatInput").value);
      $("chatInput").value = "";
    }
  });

  // Human handoff form.
  function showHandoff() {
    $("chatBody").style.display = "none";
    chips.style.display = "none";
    document.querySelector(".chat-human").style.display = "none";
    document.querySelector(".chat-input").style.display = "none";
    $("handoffForm").classList.add("open");
  }

  function showChatMain() {
    $("chatBody").style.display = "";
    if (!askedOnce) chips.style.display = "";
    document.querySelector(".chat-human").style.display = "";
    document.querySelector(".chat-input").style.display = "";
    $("handoffForm").classList.remove("open");
  }

  $("humanLink").addEventListener("click", showHandoff);
  $("footerHumanLink").addEventListener("click", function (e) {
    e.preventDefault();
    openChat();
    showHandoff();
  });
  $("handoffCancel").addEventListener("click", showChatMain);
  $("handoffSend").addEventListener("click", function () {
    var name = $("handoffName").value.trim();
    var email = $("handoffEmail").value.trim();
    var msg = $("handoffMsg").value.trim();
    if (!email || !msg) {
      alert("Please add your email and a short note so the team can help.");
      return;
    }
    var saved = [];
    try {
      saved = JSON.parse(localStorage.getItem("loom-handoffs") || "[]");
    } catch (err) {
      saved = [];
    }
    saved.push({ name: name, email: email, message: msg, at: new Date().toISOString() });
    try {
      localStorage.setItem("loom-handoffs", JSON.stringify(saved));
    } catch (err) {
      // Storage can be off. The confirmation below still shows.
    }
    $("handoffDone").style.display = "block";
    $("handoffName").value = "";
    $("handoffEmail").value = "";
    $("handoffMsg").value = "";
  });

  renderProducts();
})();
