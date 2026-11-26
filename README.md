# Loom & Co. - AI Support Chatbot Demo

Hi, this is our little demo store. Loom & Co. sells everyday goods, and Luna, our support chatbot, answers shoppers right on the page. She knows the products, the stock, the orders, the shipping rules and the discount codes, so she can help with most questions without a human stepping in. When she cannot help, she hands over to a human instead.

We built it to show what a small store can do with an AI assistant, using a free model and free hosting. Nothing here is fancy on purpose. It is plain HTML, CSS and JavaScript, so you can open it in your editor and change anything.

## What is inside

- A traditional storefront: announcement bar, navbar, hero, product grid with filters and search, order tracking, policies, FAQ and footer.
- A working bag: add to bag, quantity controls, subtotal and a free shipping progress bar.
- The Ask Luna chat widget in the bottom right corner. It answers product questions, checks stock, compares products and recommends a gift. It also tracks orders, explains shipping and returns, and shares discount codes.
- A serverless chat backend in `api/chat.js`. It talks to the free model `nvidia/nemotron-3.5-super-vl:free` through the Kilo AI Gateway. If the AI call fails or times out, the chatbot answers from the built-in store data instead and says so honestly. It never fakes an AI answer.

All the store data lives in one file, `store.js`. The page and the chat backend both read from it, so prices and stock can never drift apart.

## The store data is sample data

Every product, price, stock level, order and policy here is made up for the demo. Nothing is for sale and no real payment is taken. If you use this for your own store, replace the data in `store.js` with your real products and policies.

## Run it locally

You need Node 18 or newer. That is the only requirement.

```bash
npx serve .
```

Then open http://localhost:3000 in your browser.

Or use any static server you like. The chat works locally too. Without a backend it answers from the store data in `store.js`, and it says so under the answer.

To try the real AI locally, first install the Vercel CLI and link the project, then add your key to a `.env` file. Copy `.env.example` to `.env` and put your key there. Never commit the real key.

```bash
cp .env.example .env
vercel dev
```

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, import the repo. No build command is needed and there is no build step.
3. Set the environment variable `KILO_API_KEY` in the Vercel project settings, under Environment Variables. Use your key from the Kilo dashboard, API Keys page.
4. Deploy. The page goes live and `/api/chat` works as the chatbot backend.

The key stays in Vercel only. It never goes in the code and never goes in the repo. If you ever need to change it, change it in Vercel and redeploy.

## How the chat backend works

`api/chat.js` takes the chat messages, adds a system prompt with the store data, and calls the Kilo AI Gateway. It tries once, and if that fails it tries one more time, inside a 25 second total budget. If both tries fail, or if no key is set, it answers from the store data and marks the reply as store data. The free model can be slow at times, so the chat shows a typing note and asks the shopper to wait a moment.

## Files

- `index.html` - the storefront and the chat widget markup.
- `styles.css` - all the styling.
- `app.js` - products, filters, bag, order tracking and chat on the page.
- `store.js` - the shared store data and the fallback answers.
- `api/chat.js` - the Vercel serverless function for the AI chat.
- `.env.example` - a placeholder for the API key, with no real value.
- `.gitignore` - keeps `.env`, `node_modules` and Vercel files out of git.

## A note on the free model

The model is free and it works well for a demo, but it is a shared free tier. Sometimes it answers slowly or not at all. That is why the chatbot always has the store data fallback. For a real store with real customers, a paid model with steady speed is worth it.
