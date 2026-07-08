/* =====================================================
   CAFE BHONSLE — Admin Panel JavaScript
   ===================================================== */

const Admin = {
  ORDERS_KEY: 'cb_orders',
  RESERVATIONS_KEY: 'cb_reservations',
  PASSWORD_KEY: 'cb_admin_password',
  AUTH_KEY: 'cb_admin_auth',
  DEFAULT_PASSWORD: 'bhonsle2024',

  // ==================== AUTH ====================
  init() {
    if (!this.isAuthenticated()) {
      this.showLogin();
    } else {
      this.showDashboard();
    }
  },

  isAuthenticated() {
    return sessionStorage.getItem(this.AUTH_KEY) === 'true';
  },

  getPassword() {
    return localStorage.getItem(this.PASSWORD_KEY) || this.DEFAULT_PASSWORD;
  },

  login(password) {
    if (password === this.getPassword()) {
      sessionStorage.setItem(this.AUTH_KEY, 'true');
      this.showDashboard();
      return true;
    }
    return false;
  },

  logout() {
    sessionStorage.removeItem(this.AUTH_KEY);
    this.showLogin();
  },

  showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
  },

  showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    this.switchTab('dashboard');
  },

  handleLogin(e) {
    e.preventDefault();
    const input = document.getElementById('loginPassword');
    const error = document.getElementById('loginError');
    if (this.login(input.value)) {
      error.style.display = 'none';
    } else {
      error.style.display = 'block';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
    }
  },

  // ==================== DATA ====================
  getOrders() {
    return JSON.parse(localStorage.getItem(this.ORDERS_KEY) || '[]');
  },

  getReservations() {
    return JSON.parse(localStorage.getItem(this.RESERVATIONS_KEY) || '[]');
  },

  saveOrders(orders) {
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  },

  saveReservations(reservations) {
    localStorage.setItem(this.RESERVATIONS_KEY, JSON.stringify(reservations));
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.saveOrders(orders);
      this.renderOrders();
      this.renderDashboard();
    }
  },

  deleteOrder(orderId) {
    if (!confirm('Delete this order permanently?')) return;
    const orders = this.getOrders().filter(o => o.id !== orderId);
    this.saveOrders(orders);
    this.renderOrders();
    this.renderDashboard();
  },

  updateReservationStatus(resId, newStatus) {
    const reservations = this.getReservations();
    const res = reservations.find(r => r.id === resId);
    if (res) {
      res.status = newStatus;
      this.saveReservations(reservations);
      this.renderReservations();
      this.renderDashboard();
    }
  },

  deleteReservation(resId) {
    if (!confirm('Delete this reservation permanently?')) return;
    const reservations = this.getReservations().filter(r => r.id !== resId);
    this.saveReservations(reservations);
    this.renderReservations();
    this.renderDashboard();
  },

  // ==================== TABS ====================
  switchTab(tab) {
    // Update sidebar active state
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tab);
    });

    // Update content panels
    document.querySelectorAll('.admin-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${tab}`);
    });

    // Render content
    switch (tab) {
      case 'dashboard': this.renderDashboard(); break;
      case 'orders': this.renderOrders(); break;
      case 'reservations': this.renderReservations(); break;
      case 'settings': this.renderSettings(); break;
    }
  },

  // ==================== DASHBOARD ====================
  renderDashboard() {
    const orders = this.getOrders();
    const reservations = this.getReservations();
    const today = new Date().toISOString().split('T')[0];

    // Stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const todayReservations = reservations.filter(r => r.date === today).length;
    const revenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    document.getElementById('statTotalOrders').textContent = totalOrders;
    document.getElementById('statPendingOrders').textContent = pendingOrders;
    document.getElementById('statTodayReservations').textContent = todayReservations;
    document.getElementById('statRevenue').textContent = '₹' + revenue.toLocaleString('en-IN');

    // Recent activity
    const allItems = [
      ...orders.map(o => ({ ...o, _type: 'order', _time: new Date(o.createdAt) })),
      ...reservations.map(r => ({ ...r, _type: 'reservation', _time: new Date(r.createdAt) }))
    ]
    .sort((a, b) => b._time - a._time)
    .slice(0, 10);

    const activityList = document.getElementById('recentActivity');
    if (allItems.length === 0) {
      activityList.innerHTML = '<div class="admin-empty">No recent activity yet. Orders and reservations will appear here.</div>';
      return;
    }

    activityList.innerHTML = allItems.map(item => {
      if (item._type === 'order') {
        const itemNames = item.items ? item.items.map(i => i.name).join(', ') : '';
        return `
          <div class="activity-item">
            <div class="activity-icon activity-icon-order">🛒</div>
            <div class="activity-details">
              <div class="activity-title">${item.customer?.name || 'Customer'} placed an order</div>
              <div class="activity-sub">${itemNames} — ₹${item.total || 0}</div>
              <div class="activity-time">${this.timeAgo(item._time)}</div>
            </div>
            <span class="status-badge status-${item.status}">${item.status}</span>
          </div>
        `;
      } else {
        return `
          <div class="activity-item">
            <div class="activity-icon activity-icon-reservation">🪑</div>
            <div class="activity-details">
              <div class="activity-title">${item.name} reserved a table</div>
              <div class="activity-sub">${item.date} at ${this.formatTime(item.time)} — ${item.guests} guests</div>
              <div class="activity-time">${this.timeAgo(item._time)}</div>
            </div>
            <span class="status-badge status-${item.status}">${item.status}</span>
          </div>
        `;
      }
    }).join('');
  },

  // ==================== ORDERS ====================
  renderOrders() {
    let orders = this.getOrders();

    // Apply filters
    const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
    if (statusFilter !== 'all') {
      orders = orders.filter(o => o.status === statusFilter);
    }

    const tableBody = document.getElementById('ordersTableBody');
    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="admin-empty">No orders found</td></tr>`;
      return;
    }

    tableBody.innerHTML = orders.map(order => {
      const itemsList = order.items ? order.items.map(i => `${i.name} ×${i.qty}`).join(', ') : '';
      const date = new Date(order.createdAt);
      return `
        <tr>
          <td><span class="order-id">${order.id}</span></td>
          <td>
            <div class="customer-cell">
              <strong>${order.customer?.name || '—'}</strong>
              <span>${order.customer?.phone || ''}</span>
            </div>
          </td>
          <td class="items-cell" title="${itemsList}">${itemsList}</td>
          <td><strong>₹${order.total || 0}</strong></td>
          <td>
            <select class="status-select status-${order.status}" onchange="Admin.updateOrderStatus('${order.id}', this.value)">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
              <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <div class="action-cell">
              <span class="table-date">${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              <button class="btn-icon btn-delete" onclick="Admin.deleteOrder('${order.id}')" title="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ==================== RESERVATIONS ====================
  renderReservations() {
    let reservations = this.getReservations();

    const statusFilter = document.getElementById('resStatusFilter')?.value || 'all';
    if (statusFilter !== 'all') {
      reservations = reservations.filter(r => r.status === statusFilter);
    }

    const tableBody = document.getElementById('reservationsTableBody');
    if (reservations.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="admin-empty">No reservations found</td></tr>`;
      return;
    }

    tableBody.innerHTML = reservations.map(res => `
      <tr>
        <td><span class="order-id">${res.id}</span></td>
        <td>
          <div class="customer-cell">
            <strong>${res.name}</strong>
            <span>${res.phone}</span>
          </div>
        </td>
        <td>${res.date}</td>
        <td>${this.formatTime(res.time)}</td>
        <td>${res.guests} guest${res.guests !== '1' ? 's' : ''}</td>
        <td>
          <select class="status-select status-${res.status}" onchange="Admin.updateReservationStatus('${res.id}', this.value)">
            <option value="pending" ${res.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${res.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="cancelled" ${res.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <div class="action-cell">
            <span class="table-date">${res.occasion || '—'}</span>
            <button class="btn-icon btn-delete" onclick="Admin.deleteReservation('${res.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  // ==================== SETTINGS ====================
  renderSettings() {
    // Nothing to dynamically render, form is static
  },

  changePassword(e) {
    e.preventDefault();
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const msg = document.getElementById('passwordMsg');

    if (current !== this.getPassword()) {
      msg.textContent = '✕ Current password is incorrect.';
      msg.className = 'settings-msg error';
      msg.style.display = 'block';
      return;
    }
    if (newPass.length < 4) {
      msg.textContent = '✕ New password must be at least 4 characters.';
      msg.className = 'settings-msg error';
      msg.style.display = 'block';
      return;
    }
    if (newPass !== confirm) {
      msg.textContent = '✕ Passwords do not match.';
      msg.className = 'settings-msg error';
      msg.style.display = 'block';
      return;
    }

    localStorage.setItem(this.PASSWORD_KEY, newPass);
    msg.textContent = '✓ Password changed successfully!';
    msg.className = 'settings-msg success';
    msg.style.display = 'block';
    e.target.reset();
    setTimeout(() => msg.style.display = 'none', 3000);
  },

  clearAllOrders() {
    if (!confirm('Are you sure you want to delete ALL orders? This cannot be undone.')) return;
    localStorage.removeItem(this.ORDERS_KEY);
    this.renderOrders();
    this.renderDashboard();
    this.showToast('All orders cleared.');
  },

  clearAllReservations() {
    if (!confirm('Are you sure you want to delete ALL reservations? This cannot be undone.')) return;
    localStorage.removeItem(this.RESERVATIONS_KEY);
    this.renderReservations();
    this.renderDashboard();
    this.showToast('All reservations cleared.');
  },

  exportData() {
    const data = {
      orders: this.getOrders(),
      reservations: this.getReservations(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cafe-bhonsle-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Data exported successfully!');
  },

  // ==================== HELPERS ====================
  timeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-IN');
  },

  formatTime(time) {
    if (!time) return '—';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  },

  showToast(message) {
    let toast = document.getElementById('adminToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'adminToast';
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), 3000);
  },

  // Mobile sidebar toggle
  toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    sidebar.classList.toggle('open');
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  Admin.init();
});
