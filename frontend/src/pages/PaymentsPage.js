import React, { useMemo, useState } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import './paymentsPage.css';

const quickAmounts = [500, 1000, 2000, 5000];

const initialTransactions = [
  { id: 1, type: 'Credit', title: 'Money added from UPI', date: '17 May 2026', amount: 2500, status: 'Success' },
  { id: 2, type: 'Debit', title: 'Travel booking payment', date: '16 May 2026', amount: 1249, status: 'Success' },
  { id: 3, type: 'Debit', title: 'Shopping order', date: '15 May 2026', amount: 1899, status: 'Success' },
  { id: 4, type: 'Credit', title: 'Wallet cashback', date: '14 May 2026', amount: 82, status: 'Reward' },
];

const savedContacts = [
  { name: 'Aarav', phone: '9876543210' },
  { name: 'Meera', phone: '9123456780' },
  { name: 'Kiran', phone: '9988776655' },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const PaymentsPage = () => {
  const [balance, setBalance] = usePersistentState('oneindia.payments.balance', 18450);
  const [addAmount, setAddAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [recipientPhone, setRecipientPhone] = useState(savedContacts[0].phone);
  const [transferAmount, setTransferAmount] = useState(500);
  const [transactions, setTransactions] = usePersistentState('oneindia.payments.transactions', initialTransactions);
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('Wallet is ready for secure payments.');
  const [messageType, setMessageType] = useState('info');
  const [lastReceipt, setLastReceipt] = useState(null);

  const filteredTransactions = useMemo(() => {
    if (filter === 'All') return transactions;
    return transactions.filter((transaction) => transaction.type === filter || transaction.status === filter);
  }, [filter, transactions]);

  const monthlySpend = transactions
    .filter((transaction) => transaction.type === 'Debit')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const rewards = transactions
    .filter((transaction) => transaction.status === 'Reward')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const addMoney = () => {
    const amount = Number(addAmount);
    if (!amount || amount <= 0) {
      setMessage('Enter a valid amount to add money.');
      setMessageType('error');
      setLastReceipt(null);
      return;
    }

    const newBalance = balance + amount;
    setBalance(newBalance);
    setTransactions((currentTransactions) => [
      {
        id: Date.now(),
        type: 'Credit',
        title: `Money added via ${paymentMethod}`,
        date: 'Today',
        amount,
        status: 'Success',
      },
      ...currentTransactions,
    ]);
    setMessage(`${formatCurrency(amount)} added to your wallet.`);
    setMessageType('success');
    setLastReceipt({
      title: 'Money added successfully',
      amount,
      detail: `Paid via ${paymentMethod}`,
      balance: newBalance,
      type: 'Credit',
    });
  };

  const transferMoney = () => {
    const amount = Number(transferAmount);
    if (!recipientPhone || recipientPhone.length < 10) {
      setMessage('Enter a valid recipient phone number.');
      setMessageType('error');
      setLastReceipt(null);
      return;
    }
    if (!amount || amount <= 0) {
      setMessage('Enter a valid transfer amount.');
      setMessageType('error');
      setLastReceipt(null);
      return;
    }
    if (amount > balance) {
      setMessage('Insufficient wallet balance for this transfer.');
      setMessageType('error');
      setLastReceipt(null);
      return;
    }

    const newBalance = balance - amount;
    setBalance(newBalance);
    setTransactions((currentTransactions) => [
      {
        id: Date.now(),
        type: 'Debit',
        title: `Transfer to ${recipientPhone}`,
        date: 'Today',
        amount,
        status: 'Success',
      },
      ...currentTransactions,
    ]);
    setMessage(`${formatCurrency(amount)} transferred successfully.`);
    setMessageType('success');
    setLastReceipt({
      title: 'Transfer completed',
      amount,
      detail: `Sent to ${recipientPhone}`,
      balance: newBalance,
      type: 'Debit',
    });
  };

  return (
    <section className="payments-page">
      <div className="payments-hero">
        <div>
          <p className="payments-kicker">OneIndia Wallet</p>
          <h1>Manage money, pay faster and track every rupee.</h1>
          <p>
            View wallet balance, add money instantly, transfer to contacts and review your complete transaction history.
          </p>
        </div>
        <div className={`wallet-card-main ${messageType}`}>
          <span>Available balance</span>
          <strong>{formatCurrency(balance)}</strong>
          <p>{message}</p>
        </div>
      </div>

      {lastReceipt && (
        <div className={`payment-receipt ${lastReceipt.type === 'Credit' ? 'credit' : 'debit'}`} role="status">
          <div className="receipt-icon">{lastReceipt.type === 'Credit' ? '+' : '-'}</div>
          <div>
            <span>Payment status</span>
            <h2>{lastReceipt.title}</h2>
            <p>{lastReceipt.detail}</p>
          </div>
          <div className="receipt-amount">
            <strong>{formatCurrency(lastReceipt.amount)}</strong>
            <span>New balance: {formatCurrency(lastReceipt.balance)}</span>
          </div>
        </div>
      )}

      <div className="payments-summary-grid">
        <article>
          <span>Monthly spend</span>
          <strong>{formatCurrency(monthlySpend)}</strong>
          <p>Travel, shopping and services</p>
        </article>
        <article>
          <span>Rewards earned</span>
          <strong>{formatCurrency(rewards)}</strong>
          <p>Cashback credited to wallet</p>
        </article>
        <article>
          <span>KYC status</span>
          <strong>Verified</strong>
          <p>Higher limits and secure transfers enabled</p>
        </article>
            <article className="bnpl-status">
              <span>BNPL Credit</span>
              <strong>₹5,000 Available</strong>
              <p>Next billing: 01 June</p>
            </article>
      </div>

      <div className="payments-layout">
        <main className="wallet-actions-panel">
          <div className="payment-action-card">
            <div className="section-title-row">
              <div>
                <h2>Add money</h2>
                <p>Use UPI, card, net banking or wallet-linked bank account.</p>
              </div>
              <span>Instant credit</span>
            </div>

            <div className="quick-amounts">
              {quickAmounts.map((amount) => (
                <button
                  type="button"
                  key={amount}
                  className={Number(addAmount) === amount ? 'active' : ''}
                  onClick={() => setAddAmount(amount)}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>

            <div className="payment-form-grid">
              <label>
                Amount
                <input type="number" min="1" value={addAmount} onChange={(event) => setAddAmount(event.target.value)} />
              </label>
              <label>
                Payment method
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                  <option value="UPI">UPI</option>
                  <option value="Debit card">Debit card</option>
                  <option value="Credit card">Credit card</option>
                  <option value="Net banking">Net banking</option>
                </select>
              </label>
              <button type="button" onClick={addMoney}>Add money</button>
            </div>
          </div>

          <div className="payment-action-card">
            <div className="section-title-row">
              <div>
                <h2>Transfer money</h2>
                <p>Send money to any phone number using your wallet balance.</p>
              </div>
              <span>Secure OTP</span>
            </div>

            <div className="contact-strip">
              {savedContacts.map((contact) => (
                <button type="button" key={contact.phone} onClick={() => setRecipientPhone(contact.phone)}>
                  <strong>{contact.name.slice(0, 1)}</strong>
                  <span>{contact.name}</span>
                </button>
              ))}
            </div>

            <div className="payment-form-grid">
              <label>
                Recipient phone
                <input value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} />
              </label>
              <label>
                Amount
                <input
                  type="number"
                  min="1"
                  value={transferAmount}
                  onChange={(event) => setTransferAmount(event.target.value)}
                />
              </label>
              <button type="button" onClick={transferMoney}>Transfer</button>
            </div>
          </div>
        </main>

        <aside className="wallet-tools-panel">
          <h2>Wallet tools</h2>
          <div className="tool-list">
            <article>
              <strong>Scan and pay</strong>
              <p>Pay at stores using wallet QR.</p>
            </article>
            <article>
              <strong>Recharge and bills</strong>
              <p>Mobile, electricity, FASTag and DTH.</p>
            </article>
            <article>
              <strong>Auto-pay</strong>
              <p>Schedule recurring payments safely.</p>
            </article>
          </div>
        </aside>
      </div>

      <div className="transactions-panel">
        <div className="section-title-row">
          <div>
            <h2>Transaction history</h2>
            <p>Track credits, transfers, rewards and service payments.</p>
          </div>
          <div className="transaction-filters">
            {['All', 'Credit', 'Debit', 'Reward'].map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? 'active' : ''}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="transactions-list">
          {filteredTransactions.map((transaction) => (
            <article key={transaction.id} className="transaction-row">
              <div className={transaction.type === 'Credit' ? 'transaction-icon credit' : 'transaction-icon debit'}>
                {transaction.type === 'Credit' ? '+' : '-'}
              </div>
              <div>
                <strong>{transaction.title}</strong>
                <span>{transaction.date} - {transaction.status}</span>
              </div>
              <strong className={transaction.type === 'Credit' ? 'amount-credit' : 'amount-debit'}>
                {transaction.type === 'Credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PaymentsPage;
