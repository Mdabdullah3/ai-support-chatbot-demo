// Loom & Co. demo store data.
// One file, shared by the landing page and the chat function, so prices
// and stock never drift apart. All of this is sample demo data.

const STORE = {
  name: "Loom & Co.",
  tagline: "Everyday goods, made to last.",
  currency: "USD",
  freeShippingThreshold: 75,
  standardShippingCost: 6,
  expressShippingCost: 14,

  products: [
    {
      id: "tee",
      name: "Essential Cotton Tee",
      price: 28,
      stock: 14,
      category: "Apparel",
      material: "100% organic cotton",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["White", "Black", "Sage"],
      description:
        "A soft everyday tee with a clean cut. Pre-shrunk and breathable, made to keep its shape after washing.",
      keywords: ["tee", "t-shirt", "tshirt", "shirt", "cotton tee"]
    },
    {
      id: "wallet",
      name: "Leather Wallet",
      price: 49,
      stock: 0,
      category: "Accessories",
      material: "Full-grain leather",
      sizes: ["One size"],
      colors: ["Tan", "Black"],
      description:
        "A slim bifold wallet with 6 card slots and a full-length note pocket. It ages well and fits front or back pockets.",
      keywords: ["wallet", "leather wallet", "purse"]
    },
    {
      id: "mug-set",
      name: "Ceramic Mug Set",
      price: 36,
      stock: 9,
      category: "Home",
      material: "Stoneware ceramic, set of 2, 350 ml each",
      sizes: ["One size"],
      colors: ["Cream", "Slate"],
      description:
        "Two sturdy stoneware mugs with a matte glaze. Dishwasher and microwave safe.",
      keywords: ["mug", "mugs", "mug set", "cup", "cups"]
    },
    {
      id: "candle",
      name: "Scented Candle",
      price: 24,
      stock: 21,
      category: "Home",
      material: "Soy wax in a reusable glass jar",
      sizes: ["One size"],
      colors: ["Cedar and Amber"],
      description:
        "A hand-poured soy candle with a 45-hour burn, no paraffin or phthalates. The jar is microwave safe with a chip-resistant rim, it stacks, and you can reuse it when the candle is done.",
      keywords: ["candle", "scented candle"]
    },
    {
      id: "tote",
      name: "Canvas Tote Bag",
      price: 32,
      stock: 12,
      category: "Accessories",
      material: "16 oz cotton canvas",
      sizes: ["One size"],
      colors: ["Natural", "Olive"],
      description:
        "A roomy everyday tote with an inside pocket and reinforced handles. It fits a 13 inch laptop.",
      keywords: ["tote", "tote bag", "bag", "canvas bag"]
    },
    {
      id: "blanket",
      name: "Wool Throw Blanket",
      price: 68,
      stock: 5,
      category: "Home",
      material: "70% wool, 30% recycled cotton, 130 x 180 cm",
      sizes: ["One size"],
      colors: ["Oat", "Charcoal"],
      description:
        "A warm woven throw for the sofa or bed. Soft, breathable, and machine washable on a gentle cycle.",
      keywords: ["blanket", "throw", "wool blanket"]
    }
  ],

  orders: [
    {
      id: "1001",
      placed: "22 Nov 2026",
      status: "Shipped",
      items: [
        { name: "Essential Cotton Tee", detail: "M, White", qty: 1 },
        { name: "Ceramic Mug Set", detail: "Cream", qty: 1 }
      ],
      carrier: "FastPost",
      tracking: "FP882100456",
      expectedDelivery: "28 Nov 2026",
      note: "Your order left our warehouse and is on its way."
    },
    {
      id: "1002",
      placed: "18 Nov 2026",
      status: "Delivered",
      items: [{ name: "Canvas Tote Bag", detail: "Natural", qty: 1 }],
      carrier: "FastPost",
      tracking: "FP882100311",
      expectedDelivery: "21 Nov 2026",
      note: "Delivered on 21 Nov 2026. We hope you love it."
    },
    {
      id: "1003",
      placed: "25 Nov 2026",
      status: "Processing",
      items: [{ name: "Wool Throw Blanket", detail: "Oat", qty: 1 }],
      carrier: "FastPost",
      tracking: "Not assigned yet",
      expectedDelivery: "Ships in 1 to 2 business days",
      note: "We are packing your order now."
    }
  ],

  policies: {
    shipping:
      "Orders ship within 1 to 2 business days. Standard shipping is $6 and free over $75. Express shipping is $14 and takes 1 to 2 business days. We ship to the US, Canada, UK, EU and Australia. International shipping is $18.",
    returns:
      "30-day returns. Items must be unused and in their original packaging. Refunds go back to the original payment method within 5 business days after we receive the return.",
    payments:
      "We accept Visa, Mastercard, American Express, PayPal, Shop Pay and Apple Pay."
  },

  discountCodes: [
    { code: "WELCOME10", description: "10% off your first order." },
    { code: "LOOM15", description: "15% off orders over $100." }
  ],

  faqs: [
    {
      q: "How long does delivery take?",
      a: "Standard delivery takes 3 to 5 business days. Express delivery takes 1 to 2 business days."
    },
    {
      q: "Can I change or cancel my order?",
      a: "Yes, within 12 hours of placing it. Ask Luna here in the chat and she will pass it to a human, or email hello@loomandco.example."
    },
    {
      q: "Do you ship internationally?",
      a: "Yes. We ship to the US, Canada, UK, EU and Australia. International shipping is $18."
    },
    {
      q: "What is your return policy?",
      a: "You have 30 days to return an unused item in its original packaging. Refunds go back to your original payment method within 5 business days after we receive the return."
    }
  ]
};

// Plain-language fallback answers from the store data above.
// Used by the serverless function when the AI call fails, and by the page
// itself when it runs locally without a backend. Never invents anything.

function findProduct(text) {
  const lower = text.toLowerCase();
  return STORE.products.filter(function (p) {
    return p.keywords.some(function (k) {
      return lower.indexOf(k) !== -1;
    });
  });
}

function money(n) {
  return "$" + n;
}

function productLine(p) {
  const stock =
    p.stock === 0
      ? "sold out right now"
      : p.stock <= 5
        ? "only " + p.stock + " left in stock"
        : p.stock + " in stock";
  return (
    p.name +
    " is " +
    money(p.price) +
    ", " +
    stock +
    ". Material: " +
    p.material +
    ". Colors: " +
    p.colors.join(", ") +
    ". Sizes: " +
    p.sizes.join(", ") +
    ". " +
    p.description
  );
}

function answerFromStore(text) {
  const lower = (text || "").toLowerCase().trim();
  if (!lower) {
    return "Hi, I am Luna. Ask me about a product, an order, shipping, returns or discounts.";
  }

  // Order tracking.
  const orderMatch = lower.match(/order\s*#?\s*(\d{3,4})/);
  if (orderMatch || lower.indexOf("where is my order") !== -1 || lower.indexOf("track") !== -1) {
    if (orderMatch) {
      const order = STORE.orders.find(function (o) {
        return o.id === orderMatch[1];
      });
      if (order) {
        const items = order.items
          .map(function (i) {
            return i.qty + " x " + i.name + " (" + i.detail + ")";
          })
          .join(", ");
        return (
          "Order " +
          order.id +
          " is " +
          order.status +
          ". Placed " +
          order.placed +
          ". Items: " +
          items +
          ". Carrier: " +
          order.carrier +
          ", tracking " +
          order.tracking +
          ". Expected delivery: " +
          order.expectedDelivery +
          ". " +
          order.note
        );
      }
      return (
        "I could not find order " +
        orderMatch[1] +
        " in our demo orders. Try 1001, 1002 or 1003, or check the order number on your confirmation email."
      );
    }
    return "Sure, what is your order number? For example, try order 1001.";
  }

  // Discount codes.
  if (lower.indexOf("discount") !== -1 || lower.indexOf("coupon") !== -1 || lower.indexOf("promo") !== -1 || lower.indexOf("code") !== -1) {
    return STORE.discountCodes
      .map(function (d) {
        return d.code + ": " + d.description;
      })
      .join(" ");
  }

  // Returns and refunds.
  if (lower.indexOf("return") !== -1 || lower.indexOf("refund") !== -1 || lower.indexOf("exchange") !== -1) {
    return STORE.policies.returns;
  }

  // Shipping and delivery.
  if (lower.indexOf("ship") !== -1 || lower.indexOf("delivery") !== -1 || lower.indexOf("deliver") !== -1) {
    return STORE.policies.shipping;
  }

  // Payments.
  if (lower.indexOf("pay") !== -1 || lower.indexOf("payment") !== -1 || lower.indexOf("card") !== -1) {
    return STORE.policies.payments;
  }

  // Comparison: two products named, or "which is better".
  const found = findProduct(lower);
  if (
    found.length >= 2 &&
    (lower.indexOf(" vs ") !== -1 ||
      lower.indexOf("versus") !== -1 ||
      lower.indexOf("compare") !== -1 ||
      lower.indexOf("better") !== -1 ||
      lower.indexOf("which") !== -1)
  ) {
    const a = found[0];
    const b = found[1];
    const pick = a.stock === 0 ? b : b.stock === 0 ? a : a.price <= b.price ? a : b;
    const reason =
      pick.stock === 0
        ? "the other one is sold out"
        : pick === a && a.price <= b.price
          ? "it costs less and covers the same everyday use"
          : pick === b && b.price <= a.price
            ? "it costs less and covers the same everyday use"
            : "it fits everyday use best for the price";
    return (
      "Here is a quick comparison. " +
      productLine(a) +
      " " +
      productLine(b) +
      " My pick is the " +
      pick.name +
      ", because " +
      reason +
      "."
    );
  }

  // Gift recommendation.
  if (lower.indexOf("gift") !== -1 || lower.indexOf("recommend") !== -1) {
    const budgetMatch = lower.match(/under\s*\$?\s*(\d+)/);
    const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : 50;
    const options = STORE.products.filter(function (p) {
      return p.price <= budget && p.stock > 0;
    });
    if (!options.length) {
      return "I could not find a gift under $" + budget + " that is in stock. Try a higher budget and I will look again.";
    }
    const pick = options[0];
    const names = options
      .map(function (p) {
        return p.name + " (" + money(p.price) + ")";
      })
      .join(", ");
    return (
      "For a gift under $" +
      budget +
      ", these work well: " +
      names +
      ". My pick is the " +
      pick.name +
      " at " +
      money(pick.price) +
      ", because it is useful, well made and easy to like. " +
      pick.description
    );
  }

  // Single product details and stock.
  if (found.length >= 1) {
    return productLine(found[0]);
  }
  if (lower.indexOf("stock") !== -1 || lower.indexOf("available") !== -1 || lower.indexOf("in stock") !== -1) {
    return "Which product do you mean? We have the Essential Cotton Tee, Leather Wallet, Ceramic Mug Set, Scented Candle, Canvas Tote Bag and Wool Throw Blanket.";
  }

  // Human handoff.
  if (lower.indexOf("human") !== -1 || lower.indexOf("agent") !== -1 || lower.indexOf("person") !== -1) {
    return "Of course. Click Talk to a human instead below the chat and leave your email. The team will get back to you.";
  }

  // Greeting and general help.
  if (lower.indexOf("hi") === 0 || lower.indexOf("hello") !== -1 || lower.indexOf("hey") !== -1) {
    return "Hi, I am Luna from Loom & Co. I can help with product details and stock, comparisons, gift ideas, order tracking, shipping, returns and discount codes. What do you need?";
  }

  return "I can help with product details and stock, comparing products, gift ideas, order tracking, shipping, returns, payments and discount codes. Could you tell me a little more about what you need?";
}

// Works in the browser and in Node, no build step.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { STORE: STORE, answerFromStore: answerFromStore };
}
if (typeof window !== "undefined") {
  window.STORE = STORE;
  window.answerFromStore = answerFromStore;
}
