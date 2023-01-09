import express from 'express';
import Stripe from 'stripe';
const stripe = new Stripe.Stripe(
  'sk_test_51MLaNqGzprcAzfW2fXtYDQUkFtPCA2JK0Fxr726SboG0E9NXsRy99k0r6XhV0OPUQhAIRavaE5yl4dnMbpsaaRbH00t8jBLdDx',
  {
    apiVersion: '2020-08-27',
    typescript: true,
  }
); // Авторизация в сервисе
const app = express();

export {};

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
// app.use(express.json()); Отключен, т.к. изменяет структуру полученных данных. Можно отключить только для вебхуков

const YOUR_DOMAIN = 'http://localhost:3000';

app.post('/create-checkout-session', async (req, res) => {
  const { userStr, price_id } = req.body;
  const user = JSON.parse(userStr);

  const searchedCustomer = await stripe.customers.search({
    query: `metadata['auth0ID']:'${user.auth0ID}'`,
  });

  // Если Customer найден, но используется найденный, в ином случае создается новый
  const customer =
    searchedCustomer.data[0] ||
    (await stripe.customers.create({
      name: user.name, // Указывается только для сохранения в базе
      email: user.email, // Пользователь не сможет ее поменять на Checkout странице
      metadata: {
        auth0ID: user.auth0ID, // Данные указываются исключительно для нас
      },
    }));

  // Создание CheckoutSession
  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    customer: customer.id,
    line_items: [
      {
        price: price_id,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${YOUR_DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`, // CHECKOUT_SESSION_ID автоматически заменится на id сессии
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });

  session.url && res.redirect(303, session.url);
});

app.post('/add-subsription', async (req, res) => {
  const { session_id } = req.body;

  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  const subscription = await stripe.subscriptions.retrieve(
    checkoutSession.subscription!.toString()
  );

  const product = await stripe.products.retrieve(
    subscription.items.data[0]!.price!.product!.toString()
  );

  console.log(product);

  // Логика добавления подписки пользователю
});

app.post('/create-portal-session', async (req, res) => {
  const { session_id } = req.body;
  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  if (!checkoutSession.customer) return;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer.toString(),
    return_url: YOUR_DOMAIN,
  });

  res.redirect(303, portalSession.url);
});

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (request, response) => {
    let event: Stripe.Event;

    const endpointSecret =
      'whsec_fd3bb46db518477af0f6832b59b5735904a1b6c021f8965fe8f246a2e4af6aad';

    const signature = request.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature!,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err);
      return response.sendStatus(400);
    }

    let subscription: Stripe.Subscription;
    let status;

    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // handleSubscriptionTrialEnding(subscription);
        break;
      case 'customer.subscription.deleted':
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case 'customer.subscription.created':
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // handleSubscriptionCreated(subscription);
        break;
      case 'customer.subscription.updated':
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // handleSubscriptionUpdated(subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Возвращает 200 код для подтверждения получения события
    response.send();
  }
);

app.listen(4242, () => console.log('Running on port 4242'));
