const STORAGE_KEY = 'olam-ai-business-assistant';

const catalogItems = [
  { id: 1, name: 'Smart Business Kit', category: 'electronics', price: 180000, stock: 12, emoji: '📱', description: 'Complete digital business starter toolset.' },
  { id: 2, name: 'Daily Essentials Box', category: 'groceries', price: 25000, stock: 42, emoji: '🛒', description: 'Popular household essentials for everyday transactions.' },
  { id: 3, name: 'Gold Growth Pack', category: 'promo', price: 95000, stock: 18, emoji: '✨', description: 'Bundled promotion package for growing brands.' },
  { id: 4, name: 'Power Monitor Pro', category: 'electronics', price: 42000, stock: 10, emoji: '🔌', description: 'Reliable energy monitoring tool for businesses.' },
  { id: 5, name: 'Rice & Supply Bundle', category: 'groceries', price: 35000, stock: 20, emoji: '🌾', description: 'Fast-moving grocery bundle for retail buyers.' },
  { id: 6, name: 'Launch Campaign Kit', category: 'promo', price: 120000, stock: 8, emoji: '📣', description: 'Marketing toolkit for product launch campaigns.' }
];

const defaultState = {
  sales: 0,
  expenses: 0,
  transactions: [],
  invoiceItems: [],
  lastReceipt: null,
  lastAd: null,
  lastPlan: null,
};

let appState = loadState();
let invoiceItems = [...appState.invoiceItems];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultState, ...(saved || {}) };
  } catch (error) {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function calculateTotals() {
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
  const vat = subtotal * 0.075;
  const total = subtotal + vat;
  return { subtotal, vat, total };
}

function renderFinancialMetrics() {
  const sales = appState.transactions
    .filter((entry) => entry.type === 'sale')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const expenses = appState.transactions
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const profit = sales - expenses;

  document.getElementById('totalSales').textContent = formatCurrency(sales);
  document.getElementById('totalExpenses').textContent = formatCurrency(expenses);
  document.getElementById('netProfit').textContent = formatCurrency(profit);
  document.getElementById('financeSales').textContent = formatCurrency(sales);
  document.getElementById('financeExpenses').textContent = formatCurrency(expenses);
  document.getElementById('financeProfit').textContent = formatCurrency(profit);

  appState.sales = sales;
  appState.expenses = expenses;
  saveState();
}

function renderTransactionTable() {
  const tbody = document.getElementById('transactionTableBody');

  if (!tbody) return;

  if (!appState.transactions.length) {
    tbody.innerHTML = '<tr><td colspan="3">No transactions yet.</td></tr>';
    return;
  }

  tbody.innerHTML = appState.transactions
    .slice()
    .reverse()
    .map((entry) => `
      <tr>
        <td>${entry.type === 'sale' ? 'Sale' : 'Expense'}</td>
        <td>${entry.title}</td>
        <td>${formatCurrency(entry.amount)}</td>
      </tr>
    `)
    .join('');
}

function renderInvoiceItems() {
  const invoiceItemsContainer = document.getElementById('invoiceItems');
  if (!invoiceItemsContainer) return;

  if (!invoiceItems.length) {
    invoiceItemsContainer.innerHTML = '<div class="invoice-item"><span>No items added yet.</span></div>';
    document.getElementById('subtotalAmount').textContent = formatCurrency(0);
    document.getElementById('vatAmount').textContent = formatCurrency(0);
    document.getElementById('totalAmount').textContent = formatCurrency(0);
    return;
  }

  invoiceItemsContainer.innerHTML = invoiceItems
    .map((item) => `
      <div class="invoice-item">
        <span>${item.name} × ${item.quantity}</span>
        <strong>${formatCurrency(item.total)}</strong>
      </div>
    `)
    .join('');

  const totals = calculateTotals();
  document.getElementById('subtotalAmount').textContent = formatCurrency(totals.subtotal);
  document.getElementById('vatAmount').textContent = formatCurrency(totals.vat);
  document.getElementById('totalAmount').textContent = formatCurrency(totals.total);
}

function renderCatalog(filter = 'all') {
  const catalogGrid = document.getElementById('catalogGrid');
  if (!catalogGrid) return;

  const filteredItems = filter === 'all'
    ? catalogItems
    : catalogItems.filter((item) => item.category === filter);

  catalogGrid.innerHTML = filteredItems
    .map((item) => `
      <article class="product-card">
        <div class="product-visual">${item.emoji}</div>
        <div class="product-body">
          <span class="product-tag">${item.category}</span>
          <h4>${item.name}</h4>
          <p>${item.description}</p>
          <div class="product-meta">
            <span class="product-price">${formatCurrency(item.price)}</span>
            <span class="product-stock">${item.stock} in stock</span>
          </div>
        </div>
      </article>
    `)
    .join('');

  document.getElementById('catalogCount').textContent = catalogItems.length;
}

function handleBusinessPlanSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const businessName = formData.get('businessName') || 'New Business';
  const industry = formData.get('industry') || 'Technology';
  const market = formData.get('market') || 'Target audience';
  const budget = Number(formData.get('budget')) || 0;
  const goal = formData.get('goal') || 'Launch quickly';

  const plan = `
    <h4>${businessName} Growth Blueprint</h4>
    <p>${businessName} should enter the ${industry} sector by building a trusted brand for ${market}. Use a lean launch strategy focused on customer trust, repeat buying, and conversion efficiency.</p>
    <ul>
      <li>Primary goal: ${goal}.</li>
      <li>Launch budget: ${formatCurrency(budget)}.</li>
      <li>Priority actions: improve product quality, create customer retention campaigns, and build a strong WhatsApp support channel.</li>
      <li>Success target: reach steady sales within 60 to 90 days and scale from repeat customers.</li>
    </ul>
  `;

  appState.lastPlan = plan;
  saveState();
  document.getElementById('planOutput').innerHTML = plan;
}

function handleInvoiceSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const customerName = formData.get('customerName') || 'Walk-in Customer';
  const itemName = formData.get('itemName') || 'Service';
  const quantity = Number(formData.get('quantity')) || 1;
  const unitPrice = Number(formData.get('unitPrice')) || 0;

  const item = {
    name: itemName,
    quantity,
    unitPrice,
    total: quantity * unitPrice,
    customer: customerName,
  };

  invoiceItems.push(item);
  appState.invoiceItems = invoiceItems;
  saveState();
  renderInvoiceItems();
  event.target.reset();
  event.target.elements.customerName.value = customerName;
  event.target.elements.quantity.value = 1;
  event.target.elements.unitPrice.value = 2500;
}

function generateInvoice() {
  const customerName = document.querySelector('#invoiceForm input[name="customerName"]')?.value || 'Walk-in Customer';
  const totals = calculateTotals();

  document.getElementById('invoiceTitle').textContent = customerName ? `${customerName} / OLAM AI BUSINESS ASSISTANT` : 'OLAM AI BUSINESS ASSISTANT';
  document.getElementById('invoiceDueDate').textContent = '30 days';
  document.getElementById('subtotalAmount').textContent = formatCurrency(totals.subtotal);
  document.getElementById('vatAmount').textContent = formatCurrency(totals.vat);
  document.getElementById('totalAmount').textContent = formatCurrency(totals.total);

  const receiptAmount = totals.total;
  const receiptCustomer = customerName;

  document.querySelector('#receiptBox .receipt-row strong:nth-of-type(1)')?.replaceChildren(document.createTextNode(receiptCustomer));
  const paidValue = document.querySelectorAll('#receiptBox .receipt-row strong')[1];
  if (paidValue) paidValue.textContent = formatCurrency(receiptAmount);

  window.print();
}

function handleReceiptGeneration() {
  const customerName = document.querySelector('#invoiceForm input[name="customerName"]')?.value || 'Premium Retail Client';
  const totals = calculateTotals();
  const receipt = {
    customer: customerName,
    amount: totals.total,
    method: 'Bank transfer',
    date: new Date().toLocaleDateString(),
  };

  appState.lastReceipt = receipt;
  saveState();

  const receiptRows = document.querySelectorAll('#receiptBox .receipt-row strong');
  if (receiptRows[0]) receiptRows[0].textContent = customerName;
  if (receiptRows[1]) receiptRows[1].textContent = formatCurrency(receipt.amount);

  const statusText = document.querySelector('#receiptBox .receipt-top p');
  if (statusText) statusText.textContent = `Generated on ${receipt.date}`;

  window.print();
}

function handleAdSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const product = formData.get('adProduct') || 'Premium business service';
  const audience = formData.get('audience') || 'smart buyers';
  const tone = formData.get('tone') || 'Premium';

  const adCopy = `
    <h4>${tone} campaign for ${product}</h4>
    <p>Introducing ${product}—crafted for ${audience}. Built to help businesses grow faster, serve customers better, and increase sales with confidence. Upgrade now and experience ${tone.toLowerCase()} performance that turns attention into action.</p>
  `;

  appState.lastAd = adCopy;
  saveState();
  document.getElementById('adOutput').innerHTML = adCopy;
}

function handleTransactionSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const type = formData.get('entryType') || 'sale';
  const title = formData.get('title') || 'New entry';
  const category = formData.get('category') || 'General';
  const amount = Number(formData.get('amount')) || 0;

  const entry = { type, title, category, amount };
  appState.transactions.push(entry);
  saveState();
  renderFinancialMetrics();
  renderTransactionTable();
  event.target.reset();
}

function exportTransactionsCsv() {
  if (!appState.transactions.length) {
    alert('No transactions to export yet.');
    return;
  }

  const headers = ['Type', 'Title', 'Category', 'Amount'];
  const rows = appState.transactions.map((entry) => [
    entry.type,
    entry.title,
    entry.category,
    entry.amount,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', 'olam-business-report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function bindScrollButtons() {
  document.querySelectorAll('[data-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      const selector = button.getAttribute('data-scroll');
      const target = document.querySelector(selector);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function setupFilters() {
  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((item) => item.classList.remove('active'));
      chip.classList.add('active');
      renderCatalog(chip.dataset.filter || 'all');
    });
  });
}

function init() {
  renderFinancialMetrics();
  renderTransactionTable();
  renderInvoiceItems();
  renderCatalog('all');

  document.getElementById('businessPlanForm')?.addEventListener('submit', handleBusinessPlanSubmit);
  document.getElementById('invoiceForm')?.addEventListener('submit', handleInvoiceSubmit);
  document.getElementById('generateInvoice')?.addEventListener('click', generateInvoice);
  document.getElementById('generateReceipt')?.addEventListener('click', handleReceiptGeneration);
  document.getElementById('adForm')?.addEventListener('submit', handleAdSubmit);
  document.getElementById('transactionForm')?.addEventListener('submit', handleTransactionSubmit);

  const exportButton = document.querySelector('.ghost-button');
  if (exportButton) {
    exportButton.addEventListener('click', exportTransactionsCsv);
  }

  bindScrollButtons();
  setupFilters();
}

window.addEventListener('DOMContentLoaded', init);
