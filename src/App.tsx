import React, { useState, useEffect } from 'react';
import './App.css';

const testCustomer = {
  auth0ID: 'juhniewagu1i21',
  name: 'Ilya Khinevichtest',
  email: 'example@gmail.com',
};

const ProductDisplay = () => (
  <section>
    <div className='product'>
      <Logo />
      <div className='description'>
        <h3>Coach</h3>
        <h5>$10.00 / month</h5>
      </div>
    </div>
    <form action='/create-checkout-session' method='POST'>
      <input
        type='hidden'
        name='price_id'
        value='price_1MLkotGzprcAzfW2pJzrqjyw'
      />
      <input
        type='hidden'
        name='userStr'
        value={JSON.stringify(testCustomer)}
      />
      <button id='checkout-and-portal-button' type='submit'>
        Checkout
      </button>
    </form>
  </section>
);

interface SuccessProps {
  sessionId: string;
}

const SuccessDisplay: React.FC<SuccessProps> = ({ sessionId }) => {
  return (
    <section>
      <div className='product Box-root'>
        <Logo />
        <div className='description Box-root'>
          <h3>Subscription to starter plan successful!</h3>
        </div>
      </div>
      <form action='/add-subsription' method='POST'>
        <input
          type='hidden'
          id='session-id'
          name='session_id'
          value={sessionId}
        />
        <button id='checkout-and-portal-button' type='submit'>
          Add subscription
        </button>
      </form>
    </section>
  );
};

interface MessageProps {
  message: string;
}

const Message: React.FC<MessageProps> = ({ message }) => (
  <section>
    <p>{message}</p>
  </section>
);

export default function App() {
  let [message, setMessage] = useState('');
  let [success, setSuccess] = useState(false);
  let [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    const temp = query.get('session_id');

    console.log(query);

    if (query.get('success') && temp) {
      setSuccess(true);
      setSessionId(temp);
    }

    if (query.get('canceled')) {
      setSuccess(false);
      setMessage(
        "Order canceled -- continue to shop around and checkout when you're ready."
      );
    }
  }, [sessionId]);

  if (!success && message === '') {
    console.log('ProductDisplay');
    return <ProductDisplay />;
  } else if (success && sessionId !== '') {
    console.log('SuccessDisplay');
    return <SuccessDisplay sessionId={sessionId} />;
  } else {
    console.log('Message');
    return <Message message={message} />;
  }
}

const Logo = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width='14px'
    height='16px'
    viewBox='0 0 14 16'
    version='1.1'
  >
    <defs />
    <g id='Flow' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
      <g
        id='0-Default'
        transform='translate(-121.000000, -40.000000)'
        fill='#E184DF'
      >
        <path
          d='M127,50 L126,50 C123.238576,50 121,47.7614237 121,45 C121,42.2385763 123.238576,40 126,40 L135,40 L135,56 L133,56 L133,42 L129,42 L129,56 L127,56 L127,50 Z M127,48 L127,42 L126,42 C124.343146,42 123,43.3431458 123,45 C123,46.6568542 124.343146,48 126,48 L127,48 Z'
          id='Pilcrow'
        />
      </g>
    </g>
  </svg>
);
