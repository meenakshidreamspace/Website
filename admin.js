// ============================================
// MEENAKSHI DREAM SPACE - ADMIN DASHBOARD JS
// ============================================

const SUPABASE_URL = 'https://bjaljadzmlvmmixllofo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqYWxqYWR6bWx2bW1peGxsb2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NzQzODAsImV4cCI6MjEwNDM1MDM4MH0.ka7VgIxmjBQtoy-lG2Lg6P7DAA4ee9nf6bYekW0twLU';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let currentRole = null;
let activeChatCustomer = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initNavigation();
    initForms();
    loadDashboard();
});

async function checkAuth() {
    const adminData = sessionStorage.getItem('mds_admin');
    const adminRole = sessionStorage.getItem('mds_role');
    
    if (adminData) {
        currentUser = JSON.parse(adminData);
        currentRole = adminRole || currentUser.role;
        updateAdminUI();
        return;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        if (profile && (profile.role === 'super_admin' || profile.role === 'admin')) {
            currentUser = profile;
            currentRole = profile.role;
            updateAdminUI();
            return;
        }
    }

    window.location.href = 'auth.html';
}

function updateAdminUI() {
    if (!currentUser) return;
    const name = currentUser.full_name || currentUser.email;
    document.getElementById('adminName').textContent = name;
    document.getElementById('adminAvatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('adminRole').textContent = currentRole === 'super_admin' ? 'Super Admin' : 'Admin';
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            showPage(page);
        });
    });
}

function showPage(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    const section = document.getElementById(`page-${page}`);
    const menuItem = document.querySelector(`.menu-item[data-page="${page}"]`);
    
    if (section) section.classList.add('active');
    if (menuItem) menuItem.classList.add('active');
    
    const titles = {
        'dashboard': 'Dashboard', 'enquiries': 'Enquiries', 'customers': 'Customers',
        'customer-projects': 'Customer Projects', 'payments': 'Payments', 'messages': 'Messages',
        'packages': 'Packages', 'features': 'Features', 'services': 'Services',
        'projects': 'Portfolio', 'testimonials': 'Testimonials', 'faqs': 'FAQs',
        'construction-process': 'Construction Process', 'design-process': 'Design Process',
        'about': 'About Us', 'settings': 'Site Settings', 'team': 'Team Members', 'blogs': 'Blog Posts'
    };
    
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    
    const loaders = {
        'dashboard': loadDashboard, 'enquiries': loadEnquiries, 'customers': loadCustomers,
        'customer-projects': loadCustomerProjects, 'payments': loadPayments, 'messages': loadMessages,
        'packages': loadPackages, 'features': loadFeatures, 'services': loadServices,
        'projects': loadProjects, 'testimonials': loadTestimonials, 'faqs': loadFAQs,
        'construction-process': () => loadProcess('construction'),
        'design-process': () => loadProcess('design'),
        'about': loadAbout, 'settings': loadSettings, 'team': loadTeam, 'blogs': loadBlogs
    };
    
    if (loaders[page]) loaders[page]();
    
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

// ============================================
// MODAL
// ============================================
function openModal(title, bodyHTML, onSave) {
    document.getElementById('modalTitle').innerHTML = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalOverlay').classList.add('active');
    const saveBtn = document.getElementById('modalSaveBtn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
    saveBtn.onclick = onSave;
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ============================================
// TOAST
// ============================================
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', info: 'fas fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="${icons[type] || icons.success}"></i>
        <div class="t-content">
            <div class="t-title">${title}</div>
            <div class="t-message">${message}</div>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        toast.style.transform = 'translateX(400px)'; 
        toast.style.transition = '0.3s'; 
        setTimeout(() => toast.remove(), 300); 
    }, 4000);
}

// ============================================
// LOGOUT
// ============================================
async function logout() {
    sessionStorage.removeItem('mds_admin');
    sessionStorage.removeItem('mds_role');
    await supabaseClient.auth.signOut();
    window.location.href = 'auth.html';
}

// ============================================
// DELETE RECORD (Global)
// ============================================
async function deleteRecord(table, id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    const { error } = await supabaseClient.from(table).delete().eq('id', id);
    if (error) {
        showToast('error', 'Error', error.message);
    } else {
        showToast('success', 'Deleted', 'Record deleted successfully');
        // Reload current page
        const activePage = document.querySelector('.menu-item.active');
        if (activePage) showPage(activePage.getAttribute('data-page'));
    }
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
    try {
        const [enqRes, custRes, projRes, payRes, compRes] = await Promise.all([
            supabaseClient.from('enquiries').select('*', { count: 'exact', head: true }),
            supabaseClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
            supabaseClient.from('customer_projects').select('*', { count: 'exact', head: true }).neq('project_status', 'completed'),
            supabaseClient.from('payments').select('amount').eq('payment_status', 'completed'),
            supabaseClient.from('projects').select('*', { count: 'exact', head: true }).eq('is_active', true)
        ]);

        const newEnq = await supabaseClient.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new');

        document.getElementById('stat-enquiries').textContent = enqRes.count || 0;
        document.getElementById('stat-new-enquiries').textContent = newEnq.count || 0;
        document.getElementById('stat-customers').textContent = custRes.count || 0;
        document.getElementById('stat-active-projects').textContent = projRes.count || 0;
        document.getElementById('stat-completed').textContent = compRes.count || 0;
        
        const totalRevenue = (payRes.data || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        document.getElementById('stat-revenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');

        if (newEnq.count > 0) {
            document.getElementById('enqBadge').style.display = 'inline';
            document.getElementById('enqBadge').textContent = newEnq.count;
            document.getElementById('enqDot').style.display = 'block';
        }

        const { data: recent } = await supabaseClient.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5);
        const tbody = document.getElementById('recentEnquiries');
        if (recent && recent.length > 0) {
            tbody.innerHTML = recent.map(e => `
                <tr>
                    <td><strong>${e.full_name}</strong></td>
                    <td>${e.phone}</td>
                    <td>${e.package_interested || '-'}</td>
                    <td><span class="status-badge status-${e.status}">${e.status}</span></td>
                    <td>${new Date(e.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--gray-500);">No enquiries yet</td></tr>';
        }
    } catch (err) {
        console.error('Dashboard error:', err);
    }
}

// ============================================
// ENQUIRIES
// ============================================
async function loadEnquiries() {
    const { data, error } = await supabaseClient.from('enquiries').select('*').order('created_at', { ascending: false });
    if (error) return showToast('error', 'Error', error.message);
    
    const tbody = document.getElementById('enquiriesTableBody');
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;">No enquiries found</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(e => `
        <tr>
            <td><strong>${e.full_name}</strong></td>
            <td><a href="tel:${e.phone}">${e.phone}</a></td>
            <td>${e.email || '-'}</td>
            <td>${e.package_interested || '-'}</td>
            <td>${e.location || '-'}</td>
            <td>
                <select class="filter-select" style="padding:4px 8px; font-size:11px;" onchange="updateEnquiryStatus(${e.id}, this.value)">
                    <option value="new" ${e.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="contacted" ${e.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="in_progress" ${e.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                    <option value="converted" ${e.status === 'converted' ? 'selected' : ''}>Converted</option>
                    <option value="closed" ${e.status === 'closed' ? 'selected' : ''}>Closed</option>
                </select>
            </td>
            <td>${new Date(e.created_at).toLocaleDateString()}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view" title="View" onclick="viewEnquiry(${e.id})"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" title="WhatsApp" onclick="window.open('https://wa.me/91${e.phone}?text=Hi ${e.full_name}, this is Meenakshi Dream Space','_blank')"><i class="fab fa-whatsapp"></i></button>
                    <button class="action-btn delete" title="Delete" onclick="deleteRecord('enquiries', ${e.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function updateEnquiryStatus(id, status) {
    const { error } = await supabaseClient.from('enquiries').update({ status }).eq('id', id);
    if (error) showToast('error', 'Error', error.message);
    else showToast('success', 'Updated', 'Enquiry status updated');
}

async function viewEnquiry(id) {
    const { data } = await supabaseClient.from('enquiries').select('*').eq('id', id).single();
    if (!data) return;
    openModal('<i class="fas fa-envelope"></i> Enquiry Details', `
        <div class="form-grid">
            <div class="form-group"><label>Name</label><p><strong>${data.full_name}</strong></p></div>
            <div class="form-group"><label>Phone</label><p>${data.phone}</p></div>
            <div class="form-group"><label>Email</label><p>${data.email || '-'}</p></div>
            <div class="form-group"><label>Location</label><p>${data.location || '-'}</p></div>
            <div class="form-group"><label>Package</label><p>${data.package_interested || '-'}</p></div>
            <div class="form-group"><label>Plot Size</label><p>${data.plot_size || '-'}</p></div>
            <div class="form-group"><label>Subject</label><p>${data.subject || '-'}</p></div>
            <div class="form-group"><label>Status</label><p><span class="status-badge status-${data.status}">${data.status}</span></p></div>
            <div class="form-group full"><label>Message</label><p>${data.message || '-'}</p></div>
            <div class="form-group full"><label>Admin Notes</label>
                <textarea id="enquiryNotes" rows="3">${data.admin_notes || ''}</textarea>
            </div>
        </div>
    `, async () => {
        const notes = document.getElementById('enquiryNotes').value;
        await supabaseClient.from('enquiries').update({ admin_notes: notes }).eq('id', id);
        showToast('success', 'Saved', 'Notes updated');
        closeModal();
    });
}

// ============================================
// CUSTOMERS
// ============================================
async function loadCustomers() {
    const { data } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('customersTableBody');
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;">No customers found</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(c => `
        <tr>
            <td><strong>${c.full_name}</strong></td>
            <td>${c.email}</td>
            <td>${c.phone || '-'}</td>
            <td>${c.city || '-'}</td>
            <td><span class="status-badge ${c.role === 'super_admin' ? 'status-new' : 'status-active'}">${c.role}</span></td>
            <td><span class="status-badge ${c.is_active ? 'status-active' : 'status-inactive'}">${c.is_active ? 'Active' : 'Inactive'}</span></td>
            <td>${new Date(c.created_at).toLocaleDateString()}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="toggleUserStatus('${c.id}', ${!c.is_active})"><i class="fas fa-${c.is_active ? 'ban' : 'check'}"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function toggleUserStatus(id, active) {
    await supabaseClient.from('profiles').update({ is_active: active }).eq('id', id);
    showToast('success', 'Updated', 'User status changed');
    loadCustomers();
}

// ============================================
// CUSTOMER PROJECTS
// ============================================
async function loadCustomerProjects() {
    const { data } = await supabaseClient.from('customer_projects').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
    const tbody = document.getElementById('customerProjectsTableBody');
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;">No projects found</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(p => `
        <tr>
            <td><strong>${p.project_name}</strong></td>
            <td>${p.profiles?.full_name || '-'}</td>
            <td>${p.package_id || '-'}</td>
            <td>${p.plot_area || '-'} sq.ft</td>
            <td><span class="status-badge status-${p.project_status}">${p.project_status}</span></td>
            <td>₹${(p.total_cost || 0).toLocaleString('en-IN')}</td>
            <td>₹${(p.paid_amount || 0).toLocaleString('en-IN')}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editCustomerProject(${p.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteRecord('customer_projects', ${p.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openCustomerProjectModal(project = null) {
    openModal('<i class="fas fa-project-diagram"></i> ' + (project ? 'Edit' : 'Add') + ' Project', `
        <div class="form-grid">
            <div class="form-group"><label>Project Name *</label><input type="text" id="cp-name" value="${project?.project_name || ''}"></div>
            <div class="form-group"><label>Customer ID *</label><input type="text" id="cp-customer" value="${project?.customer_id || ''}"></div>
            <div class="form-group"><label>Package ID</label><input type="number" id="cp-package" value="${project?.package_id || ''}"></div>
            <div class="form-group"><label>Plot Area (sq.ft)</label><input type="number" id="cp-area" value="${project?.plot_area || ''}"></div>
            <div class="form-group"><label>Total Cost</label><input type="number" id="cp-cost" value="${project?.total_cost || ''}"></div>
            <div class="form-group"><label>Status</label>
                <select id="cp-status">
                    <option value="planning" ${project?.project_status === 'planning' ? 'selected' : ''}>Planning</option>
                    <option value="design" ${project?.project_status === 'design' ? 'selected' : ''}>Design</option>
                    <option value="approval" ${project?.project_status === 'approval' ? 'selected' : ''}>Approval</option>
                    <option value="foundation" ${project?.project_status === 'foundation' ? 'selected' : ''}>Foundation</option>
                    <option value="structure" ${project?.project_status === 'structure' ? 'selected' : ''}>Structure</option>
                    <option value="finishing" ${project?.project_status === 'finishing' ? 'selected' : ''}>Finishing</option>
                    <option value="handover" ${project?.project_status === 'handover' ? 'selected' : ''}>Handover</option>
                    <option value="completed" ${project?.project_status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
            <div class="form-group"><label>Start Date</label><input type="date" id="cp-start" value="${project?.start_date || ''}"></div>
            <div class="form-group"><label>Expected Completion</label><input type="date" id="cp-end" value="${project?.expected_completion || ''}"></div>
            <div class="form-group full"><label>Site Address</label><textarea id="cp-address" rows="2">${project?.site_address || ''}</textarea></div>
        </div>
    `, async () => {
        const record = {
            project_name: document.getElementById('cp-name').value,
            customer_id: document.getElementById('cp-customer').value,
            package_id: parseInt(document.getElementById('cp-package').value) || null,
            plot_area: parseFloat(document.getElementById('cp-area').value) || null,
            total_cost: parseFloat(document.getElementById('cp-cost').value) || null,
            project_status: document.getElementById('cp-status').value,
            start_date: document.getElementById('cp-start').value || null,
            expected_completion: document.getElementById('cp-end').value || null,
            site_address: document.getElementById('cp-address').value
        };
        if (project) {
            await supabaseClient.from('customer_projects').update(record).eq('id', project.id);
        } else {
            await supabaseClient.from('customer_projects').insert([record]);
        }
        showToast('success', 'Saved', 'Project saved successfully');
        closeModal();
        loadCustomerProjects();
    });
}

function editCustomerProject(id) {
    supabaseClient.from('customer_projects').select('*').eq('id', id).single().then(({ data }) => {
        if (data) openCustomerProjectModal(data);
    });
}

// ============================================
// PAYMENTS
// ============================================
async function loadPayments() {
    const { data } = await supabaseClient.from('payments').select('*, profiles(full_name)').order('created_at', { ascending: false });
    const tbody = document.getElementById('paymentsTableBody');
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;">No payments found</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(p => `
        <tr>
            <td>${p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '-'}</td>
            <td>${p.profiles?.full_name || '-'}</td>
            <td><strong>₹${(p.amount || 0).toLocaleString('en-IN')}</strong></td>
            <td>${p.payment_type || '-'}</td>
            <td>${p.payment_method || '-'}</td>
            <td>${p.transaction_id || '-'}</td>
            <td><span class="status-badge status-${p.payment_status}">${p.payment_status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn delete" onclick="deleteRecord('payments', ${p.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openPaymentModal() {
    openModal('<i class="fas fa-wallet"></i> Add Payment', `
        <div class="form-grid">
            <div class="form-group"><label>Customer ID *</label><input type="text" id="pay-customer"></div>
            <div class="form-group"><label>Project ID</label><input type="number" id="pay-project"></div>
            <div class="form-group"><label>Amount *</label><input type="number" id="pay-amount"></div>
            <div class="form-group"><label>Type</label>
                <select id="pay-type"><option>booking</option><option>installment</option><option>final</option></select>
            </div>
            <div class="form-group"><label>Method</label>
                <select id="pay-method"><option>cash</option><option>bank_transfer</option><option>upi</option><option>cheque</option></select>
            </div>
            <div class="form-group"><label>Transaction ID</label><input type="text" id="pay-txn"></div>
            <div class="form-group"><label>Status</label>
                <select id="pay-status"><option value="completed">Completed</option><option value="pending">Pending</option></select>
            </div>
        </div>
    `, async () => {
        await supabaseClient.from('payments').insert([{
            customer_id: document.getElementById('pay-customer').value,
            customer_project_id: parseInt(document.getElementById('pay-project').value) || null,
            amount: parseFloat(document.getElementById('pay-amount').value),
            payment_type: document.getElementById('pay-type').value,
            payment_method: document.getElementById('pay-method').value,
            transaction_id: document.getElementById('pay-txn').value,
            payment_status: document.getElementById('pay-status').value,
            payment_date: new Date().toISOString()
        }]);
        showToast('success', 'Saved', 'Payment recorded');
        closeModal();
        loadPayments();
    });
}

// ============================================
// MESSAGES
// ============================================
async function loadMessages() {
    const { data: customers } = await supabaseClient.from('profiles').select('*').eq('role', 'customer').eq('is_active', true);
    const container = document.getElementById('messageCustomers');
    if (!customers || customers.length === 0) {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:var(--gray-500);">No customers</div>';
        return;
    }
    container.innerHTML = customers.map(c => `
        <div class="customer-item" onclick="openChat('${c.id}', '${c.full_name}')">
            <div class="customer-avatar">${c.full_name.charAt(0).toUpperCase()}</div>
            <div class="c-info">
                <h5>${c.full_name}</h5>
                <p>${c.email}</p>
            </div>
        </div>
    `).join('');
}

async function openChat(customerId, name) {
    activeChatCustomer = customerId;
    document.getElementById('chatInput').disabled = false;
    document.getElementById('chatSendBtn').disabled = false;
    
    document.querySelectorAll('.customer-item').forEach(i => i.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
    
    const { data } = await supabaseClient.from('customer_messages').select('*').eq('customer_id', customerId).order('created_at');
    const container = document.getElementById('chatMessages');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><h3>No messages yet</h3></div>';
        return;
    }
    
    container.innerHTML = data.map(m => `
        <div class="msg-bubble ${m.sender_type}">
            ${m.message}
            <div class="msg-time">${new Date(m.created_at).toLocaleString()}</div>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

async function sendAdminMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg || !activeChatCustomer) return;
    
    await supabaseClient.from('customer_messages').insert([{
        customer_id: activeChatCustomer,
        message: msg,
        sender_type: 'admin'
    }]);
    input.value = '';
    openChat(activeChatCustomer, '');
}

// ============================================
// PACKAGES
// ============================================
async function loadPackages() {
    const { data: packages } = await supabaseClient.from('packages').select('*').order('display_order');
    const { data: sections } = await supabaseClient.from('package_sections').select('*');
    
    const tbody = document.getElementById('packagesTableBody');
    if (!packages || packages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;">No packages found</td></tr>';
        return;
    }
    
    tbody.innerHTML = packages.map(p => {
        const secCount = sections?.filter(s => s.package_id === p.id).length || 0;
        return `
            <tr>
                <td><strong>${p.package_name}</strong></td>
                <td>${p.price_label || '₹' + p.price_per_sqft}</td>
                <td>${p.badge_text || '-'}</td>
                <td>${p.is_popular ? '<span class="status-badge status-active">Yes</span>' : 'No'}</td>
                <td>${secCount} sections</td>
                <td><span class="status-badge ${p.is_active ? 'status-active' : 'status-inactive'}">${p.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn view" onclick="viewPackageSections(${p.id}, '${p.package_name.replace(/'/g, '')}')"><i class="fas fa-list"></i></button>
                        <button class="action-btn edit" onclick="editPackage(${p.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteRecord('packages', ${p.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openPackageModal(pkg = null) {
    openModal('<i class="fas fa-box"></i> ' + (pkg ? 'Edit' : 'Add') + ' Package', `
        <div class="form-grid">
            <div class="form-group"><label>Package Name *</label><input type="text" id="pkg-name" value="${pkg?.package_name || ''}"></div>
            <div class="form-group"><label>Slug</label><input type="text" id="pkg-slug" value="${pkg?.package_slug || ''}"></div>
            <div class="form-group"><label>Price per sq.ft</label><input type="number" id="pkg-price" value="${pkg?.price_per_sqft || ''}"></div>
            <div class="form-group"><label>Price Label</label><input type="text" id="pkg-label" value="${pkg?.price_label || ''}" placeholder="₹1,799/sq.ft"></div>
            <div class="form-group"><label>Badge Text</label><input type="text" id="pkg-badge" value="${pkg?.badge_text || ''}"></div>
            <div class="form-group"><label>Display Order</label><input type="number" id="pkg-order" value="${pkg?.display_order || 0}"></div>
            <div class="form-group full"><label>Short Description</label><textarea id="pkg-desc" rows="2">${pkg?.short_description || ''}</textarea></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="pkg-popular" ${pkg?.is_popular ? 'checked' : ''}><label>Most Popular</label></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="pkg-active" ${pkg?.is_active !== false ? 'checked' : ''}><label>Active</label></div>
        </div>
    `, async () => {
        const record = {
            package_name: document.getElementById('pkg-name').value,
            package_slug: document.getElementById('pkg-slug').value,
            price_per_sqft: parseFloat(document.getElementById('pkg-price').value) || 0,
            price_label: document.getElementById('pkg-label').value,
            badge_text: document.getElementById('pkg-badge').value,
            display_order: parseInt(document.getElementById('pkg-order').value) || 0,
            short_description: document.getElementById('pkg-desc').value,
            is_popular: document.getElementById('pkg-popular').checked,
            is_active: document.getElementById('pkg-active').checked
        };
        if (pkg) {
            await supabaseClient.from('packages').update(record).eq('id', pkg.id);
        } else {
            await supabaseClient.from('packages').insert([record]);
        }
        showToast('success', 'Saved', 'Package saved');
        closeModal();
        loadPackages();
    });
}

function editPackage(id) {
    supabaseClient.from('packages').select('*').eq('id', id).single().then(({ data }) => {
        if (data) openPackageModal(data);
    });
}

async function viewPackageSections(packageId, packageName) {
    const { data: sections } = await supabaseClient.from('package_sections').select('*').eq('package_id', packageId).order('display_order');
    const { data: items } = await supabaseClient.from('package_section_items').select('*');
    
    let html = `<h4 style="margin-bottom:15px;">${packageName} - Sections & Items</h4>`;
    html += `<button class="btn btn-primary btn-sm" style="margin-bottom:15px;" onclick="addSectionToPackage(${packageId}, '${packageName}')"><i class="fas fa-plus"></i> Add Section</button>`;
    
    if (sections && sections.length > 0) {
        sections.forEach(sec => {
            const secItems = items?.filter(i => i.section_id === sec.id) || [];
            html += `
                <div class="form-accordion active" style="margin-bottom:10px;">
                    <div class="form-accordion-header" onclick="this.parentElement.classList.toggle('active')">
                        <h4><i class="${sec.section_icon || 'fas fa-check'}"></i> ${sec.section_title} (${secItems.length} items)</h4>
                        <div>
                            <button class="btn btn-sm btn-info" onclick="event.stopPropagation(); addItemToSection(${sec.id}, ${packageId}, '${packageName}')"><i class="fas fa-plus"></i> Item</button>
                            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteSection(${sec.id}, ${packageId}, '${packageName}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="form-accordion-body">
                        ${secItems.map(item => `
                            <div class="sub-list-item">
                                <span>✅ ${item.item_text}</span>
                                <div class="sub-actions">
                                    <button class="action-btn delete" onclick="deleteItem(${item.id}, ${packageId}, '${packageName}')"><i class="fas fa-times"></i></button>
                                </div>
                            </div>
                        `).join('')}
                        ${secItems.length === 0 ? '<p style="color:var(--gray-500); font-size:13px;">No items yet</p>' : ''}
                    </div>
                </div>
            `;
        });
    } else {
        html += '<p style="color:var(--gray-500);">No sections yet. Add a section to get started.</p>';
    }
    
    openModal('<i class="fas fa-list"></i> Package Sections', html, () => { closeModal(); loadPackages(); });
    document.getElementById('modalSaveBtn').innerHTML = '<i class="fas fa-check"></i> Done';
}

async function addSectionToPackage(packageId, packageName) {
    const title = prompt('Enter section title:');
    if (!title) return;
    const icon = prompt('Enter icon class (e.g., fas fa-check):', 'fas fa-check') || 'fas fa-check';
    await supabaseClient.from('package_sections').insert([{ package_id: packageId, section_title: title, section_icon: icon }]);
    showToast('success', 'Added', 'Section added');
    viewPackageSections(packageId, packageName);
}

async function addItemToSection(sectionId, packageId, packageName) {
    const text = prompt('Enter item text:');
    if (!text) return;
    await supabaseClient.from('package_section_items').insert([{ section_id: sectionId, item_text: text }]);
    showToast('success', 'Added', 'Item added');
    viewPackageSections(packageId, packageName);
}

async function deleteSection(id, packageId, packageName) {
    if (!confirm('Delete this section and all its items?')) return;
    await supabaseClient.from('package_sections').delete().eq('id', id);
    showToast('success', 'Deleted', 'Section deleted');
    viewPackageSections(packageId, packageName);
}

async function deleteItem(id, packageId, packageName) {
    if (!confirm('Delete this item?')) return;
    await supabaseClient.from('package_section_items').delete().eq('id', id);
    showToast('success', 'Deleted', 'Item deleted');
    viewPackageSections(packageId, packageName);
}

// ============================================
// FEATURES
// ============================================
async function loadFeatures() {
    const { data: categories } = await supabaseClient.from('feature_categories').select('*').order('display_order');
    const { data: features } = await supabaseClient.from('features').select('*').order('display_order');
    
    const catTbody = document.getElementById('featureCategoriesTableBody');
    if (categories && categories.length > 0) {
        catTbody.innerHTML = categories.map(c => {
            const count = features?.filter(f => f.feature_category === c.category_name).length || 0;
            return `
                <tr>
                    <td><strong>${c.category_name}</strong></td>
                    <td><i class="${c.category_icon || 'fas fa-check'}"></i> ${c.category_icon || '-'}</td>
                    <td>${count}</td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn edit" onclick="editFeatureCategory(${c.id})"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete" onclick="deleteRecord('feature_categories', ${c.id})"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    const filter = document.getElementById('featureCategoryFilter');
    filter.innerHTML = '<option value="">All Categories</option>' + (categories || []).map(c => `<option value="${c.category_name}">${c.category_name}</option>`).join('');
    filter.onchange = () => renderFeaturesTable(features, filter.value);
    
    renderFeaturesTable(features, '');
}

function renderFeaturesTable(features, category) {
    const filtered = category ? features?.filter(f => f.feature_category === category) : features;
    const tbody = document.getElementById('featuresTableBody');
    if (!filtered || filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px;">No features found</td></tr>';
        return;
    }
    tbody.innerHTML = filtered.map(f => `
        <tr>
            <td><strong>${f.feature_title}</strong></td>
            <td>${f.feature_category}</td>
            <td><i class="${f.feature_icon || 'fas fa-check'}"></i></td>
            <td><span class="status-badge ${f.is_active ? 'status-active' : 'status-inactive'}">${f.is_active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editFeature(${f.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteRecord('features', ${f.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openFeatureCategoryModal(cat = null) {
    openModal('<i class="fas fa-folder"></i> ' + (cat ? 'Edit' : 'Add') + ' Category', `
        <div class="form-grid">
            <div class="form-group"><label>Category Name *</label><input type="text" id="fc-name" value="${cat?.category_name || ''}"></div>
            <div class="form-group"><label>Icon Class</label><input type="text" id="fc-icon" value="${cat?.category_icon || 'fas fa-check'}"></div>
            <div class="form-group"><label>Order</label><input type="number" id="fc-order" value="${cat?.display_order || 0}"></div>
            <div class="form-group full"><label>Description</label><textarea id="fc-desc" rows="2">${cat?.category_description || ''}</textarea></div>
        </div>
    `, async () => {
        const record = {
            category_name: document.getElementById('fc-name').value,
            category_icon: document.getElementById('fc-icon').value,
            display_order: parseInt(document.getElementById('fc-order').value) || 0,
            category_description: document.getElementById('fc-desc').value
        };
        if (cat) await supabaseClient.from('feature_categories').update(record).eq('id', cat.id);
        else await supabaseClient.from('feature_categories').insert([record]);
        showToast('success', 'Saved', 'Category saved');
        closeModal();
        loadFeatures();
    });
}

function editFeatureCategory(id) {
    supabaseClient.from('feature_categories').select('*').eq('id', id).single().then(({ data }) => { if (data) openFeatureCategoryModal(data); });
}

function openFeatureModal(feat = null) {
    supabaseClient.from('feature_categories').select('*').then(({ data: cats }) => {
        openModal('<i class="fas fa-star"></i> ' + (feat ? 'Edit' : 'Add') + ' Feature', `
            <div class="form-grid">
                <div class="form-group"><label>Feature Title *</label><input type="text" id="ft-title" value="${feat?.feature_title || ''}"></div>
                <div class="form-group"><label>Category *</label>
                    <select id="ft-category">
                        ${(cats || []).map(c => `<option value="${c.category_name}" ${feat?.feature_category === c.category_name ? 'selected' : ''}>${c.category_name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group"><label>Icon Class</label><input type="text" id="ft-icon" value="${feat?.feature_icon || 'fas fa-check'}"></div>
                <div class="form-group"><label>Order</label><input type="number" id="ft-order" value="${feat?.display_order || 0}"></div>
                <div class="form-group full"><label>Description</label><textarea id="ft-desc" rows="2">${feat?.feature_description || ''}</textarea></div>
                <div class="form-group checkbox-group"><input type="checkbox" id="ft-active" ${feat?.is_active !== false ? 'checked' : ''}><label>Active</label></div>
            </div>
        `, async () => {
            const record = {
                feature_title: document.getElementById('ft-title').value,
                feature_category: document.getElementById('ft-category').value,
                feature_icon: document.getElementById('ft-icon').value,
                display_order: parseInt(document.getElementById('ft-order').value) || 0,
                feature_description: document.getElementById('ft-desc').value,
                is_active: document.getElementById('ft-active').checked
            };
            if (feat) await supabaseClient.from('features').update(record).eq('id', feat.id);
            else await supabaseClient.from('features').insert([record]);
            showToast('success', 'Saved', 'Feature saved');
            closeModal();
            loadFeatures();
        });
    });
}

function editFeature(id) {
    supabaseClient.from('features').select('*').eq('id', id).single().then(({ data }) => { if (data) openFeatureModal(data); });
}

// ============================================
// SERVICES
// ============================================
async function loadServices() {
    const { data } = await supabaseClient.from('services').select('*').order('display_order');
    const tbody = document.getElementById('servicesTableBody');
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px;">No services</td></tr>'; return; }
    tbody.innerHTML = data.map(s => `
        <tr>
            <td><strong>${s.service_name}</strong></td>
            <td><i class="${s.service_icon || 'fas fa-tools'}"></i> ${s.service_icon}</td>
            <td>${(s.service_description || '').substring(0, 60)}...</td>
            <td><span class="status-badge ${s.is_active ? 'status-active' : 'status-inactive'}">${s.is_active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editService(${s.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteRecord('services', ${s.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openServiceModal(svc = null) {
    openModal('<i class="fas fa-tools"></i> ' + (svc ? 'Edit' : 'Add') + ' Service', `
        <div class="form-grid">
            <div class="form-group"><label>Service Name *</label><input type="text" id="svc-name" value="${svc?.service_name || ''}"></div>
            <div class="form-group"><label>Icon Class</label><input type="text" id="svc-icon" value="${svc?.service_icon || 'fas fa-tools'}"></div>
            <div class="form-group"><label>Order</label><input type="number" id="svc-order" value="${svc?.display_order || 0}"></div>
            <div class="form-group full"><label>Description</label><textarea id="svc-desc" rows="3">${svc?.service_description || ''}</textarea></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="svc-active" ${svc?.is_active !== false ? 'checked' : ''}><label>Active</label></div>
        </div>
    `, async () => {
        const record = { service_name: document.getElementById('svc-name').value, service_icon: document.getElementById('svc-icon').value, display_order: parseInt(document.getElementById('svc-order').value) || 0, service_description: document.getElementById('svc-desc').value, is_active: document.getElementById('svc-active').checked };
        if (svc) await supabaseClient.from('services').update(record).eq('id', svc.id);
        else await supabaseClient.from('services').insert([record]);
        showToast('success', 'Saved', 'Service saved'); closeModal(); loadServices();
    });
}

function editService(id) { supabaseClient.from('services').select('*').eq('id', id).single().then(({ data }) => { if (data) openServiceModal(data); }); }

// ============================================
// PROJECTS / PORTFOLIO
// ============================================
async function loadProjects() {
    const { data } = await supabaseClient.from('projects').select('*').order('display_order');
    const tbody = document.getElementById('projectsTableBody');
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;">No projects</td></tr>'; return; }
    tbody.innerHTML = data.map(p => `
        <tr>
            <td><img src="${p.thumbnail_url || 'https://via.placeholder.com/80x60'}" style="width:80px; height:50px; object-fit:cover; border-radius:6px;"></td>
            <td><strong>${p.project_title}</strong></td>
            <td>${p.project_type || '-'}</td>
            <td>${p.location || '-'}</td>
            <td>${p.area_sqft || '-'} sq.ft</td>
            <td>${p.is_featured ? '⭐' : '-'}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editProject(${p.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteRecord('projects', ${p.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openProjectModal(proj = null) {
    openModal('<i class="fas fa-images"></i> ' + (proj ? 'Edit' : 'Add') + ' Project', `
        <div class="form-grid">
            <div class="form-group"><label>Project Title *</label><input type="text" id="proj-title" value="${proj?.project_title || ''}"></div>
            <div class="form-group"><label>Type</label><input type="text" id="proj-type" value="${proj?.project_type || ''}" placeholder="residential, villa, commercial"></div>
            <div class="form-group"><label>Location</label><input type="text" id="proj-location" value="${proj?.location || ''}"></div>
            <div class="form-group"><label>Area (sq.ft)</label><input type="number" id="proj-area" value="${proj?.area_sqft || ''}"></div>
            <div class="form-group"><label>Budget Range</label><input type="text" id="proj-budget" value="${proj?.budget_range || ''}"></div>
            <div class="form-group"><label>Thumbnail URL</label><input type="text" id="proj-thumb" value="${proj?.thumbnail_url || ''}"></div>
            <div class="form-group full"><label>Description</label><textarea id="proj-desc" rows="3">${proj?.project_description || ''}</textarea></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="proj-featured" ${proj?.is_featured ? 'checked' : ''}><label>Featured</label></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="proj-active" ${proj?.is_active !== false ? 'checked' : ''}><label>Active</label></div>
        </div>
    `, async () => {
        const record = { project_title: document.getElementById('proj-title').value, project_type: document.getElementById('proj-type').value, location: document.getElementById('proj-location').value, area_sqft: parseInt(document.getElementById('proj-area').value) || null, budget_range: document.getElementById('proj-budget').value, thumbnail_url: document.getElementById('proj-thumb').value, project_description: document.getElementById('proj-desc').value, is_featured: document.getElementById('proj-featured').checked, is_active: document.getElementById('proj-active').checked };
        if (proj) await supabaseClient.from('projects').update(record).eq('id', proj.id);
        else await supabaseClient.from('projects').insert([record]);
        showToast('success', 'Saved', 'Project saved'); closeModal(); loadProjects();
    });
}

function editProject(id) { supabaseClient.from('projects').select('*').eq('id', id).single().then(({ data }) => { if (data) openProjectModal(data); }); }

// ============================================
// TESTIMONIALS
// ============================================
async function loadTestimonials() {
    const { data } = await supabaseClient.from('testimonials').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('testimonialsTableBody');
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">No testimonials</td></tr>'; return; }
    tbody.innerHTML = data.map(t => `
        <tr>
            <td><strong>${t.client_name}</strong></td>
            <td>${'⭐'.repeat(t.rating)}</td>
            <td>${(t.review_text || '').substring(0, 60)}...</td>
            <td>${t.location || '-'}</td>
            <td>${t.is_featured ? '⭐' : '-'}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editTestimonial(${t.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteRecord('testimonials', ${t.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openTestimonialModal(t = null) {
    openModal('<i class="fas fa-quote-left"></i> ' + (t ? 'Edit' : 'Add') + ' Testimonial', `
        <div class="form-grid">
            <div class="form-group"><label>Client Name *</label><input type="text" id="t-name" value="${t?.client_name || ''}"></div>
            <div class="form-group"><label>Designation</label><input type="text" id="t-desig" value="${t?.client_designation || ''}"></div>
            <div class="form-group"><label>Rating (1-5)</label><input type="number" id="t-rating" min="1" max="5" value="${t?.rating || 5}"></div>
            <div class="form-group"><label>Location</label><input type="text" id="t-loc" value="${t?.location || ''}"></div>
            <div class="form-group full"><label>Review Text *</label><textarea id="t-review" rows="4">${t?.review_text || ''}</textarea></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="t-featured" ${t?.is_featured ? 'checked' : ''}><label>Featured</label></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="t-active" ${t?.is_active !== false ? 'checked' : ''}><label>Active</label></div>
        </div>
    `, async () => {
        const record = { client_name: document.getElementById('t-name').value, client_designation: document.getElementById('t-desig').value, rating: parseInt(document.getElementById('t-rating').value) || 5, location: document.getElementById('t-loc').value, review_text: document.getElementById('t-review').value, is_featured: document.getElementById('t-featured').checked, is_active: document.getElementById('t-active').checked };
        if (t) await supabaseClient.from('testimonials').update(record).eq('id', t.id);
        else await supabaseClient.from('testimonials').insert([record]);
        showToast('success', 'Saved', 'Testimonial saved'); closeModal(); loadTestimonials();
    });
}

function editTestimonial(id) { supabaseClient.from('testimonials').select('*').eq('id', id).single().then(({ data }) => { if (data) openTestimonialModal(data); }); }

// ============================================
// FAQs
// ============================================
async function loadFAQs() {
    const { data } = await supabaseClient.from('faqs').select('*').order('display_order');
    const tbody = document.getElementById('faqsTableBody');
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px;">No FAQs</td></tr>'; return; }
    tbody.innerHTML = data.map(f => `
        <tr>
            <td><strong>${f.question}</strong></td>
            <td>${f.faq_category || 'general'}</td>
            <td>${f.display_order}</td>
            <td><span class="status-badge ${f.is_active ? 'status-active' : 'status-inactive'}">${f.is_active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editFaq(${f.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteRecord('faqs', ${f.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openFaqModal(faq = null) {
    openModal('<i class="fas fa-question-circle"></i> ' + (faq ? 'Edit' : 'Add') + ' FAQ', `
        <div class="form-grid">
            <div class="form-group full"><label>Question *</label><input type="text" id="faq-q" value="${faq?.question || ''}"></div>
            <div class="form-group full"><label>Answer *</label><textarea id="faq-a" rows="4">${faq?.answer || ''}</textarea></div>
            <div class="form-group"><label>Category</label><input type="text" id="faq-cat" value="${faq?.faq_category || 'general'}"></div>
            <div class="form-group"><label>Order</label><input type="number" id="faq-order" value="${faq?.display_order || 0}"></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="faq-active" ${faq?.is_active !== false ? 'checked' : ''}><label>Active</label></div>
        </div>
    `, async () => {
        const record = { question: document.getElementById('faq-q').value, answer: document.getElementById('faq-a').value, faq_category: document.getElementById('faq-cat').value, display_order: parseInt(document.getElementById('faq-order').value) || 0, is_active: document.getElementById('faq-active').checked };
        if (faq) await supabaseClient.from('faqs').update(record).eq('id', faq.id);
        else await supabaseClient.from('faqs').insert([record]);
        showToast('success', 'Saved', 'FAQ saved'); closeModal(); loadFAQs();
    });
}

function editFaq(id) { supabaseClient.from('faqs').select('*').eq('id', id).single().then(({ data }) => { if (data) openFaqModal(data); }); }

// ============================================
// PROCESSES (Construction & Design)
// ============================================
async function loadProcess(type) {
    const table = type === 'construction' ? 'construction_process' : 'design_process';
    const tbodyId = type === 'construction' ? 'constructionProcessTableBody' : 'designProcessTableBody';
    const { data } = await supabaseClient.from(table).select('*').order('display_order');
    const tbody = document.getElementById(tbodyId);
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">No steps</td></tr>'; return; }
    tbody.innerHTML = data.map(s => `
        <tr>
            <td><strong>${s.step_number}</strong></td>
            <td>${s.step_title}</td>
            <td>${s.duration_text || '-'}</td>
            <td>${s.step_details?.length || 0}</td>
            <td><span class="status-badge ${s.is_active ? 'status-active' : 'status-inactive'}">${s.is_active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editProcessStep('${type}', ${s.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteRecord('${table}', ${s.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openProcessModal(type, step = null) {
    const table = type === 'construction' ? 'construction_process' : 'design_process';
    openModal('<i class="fas fa-tasks"></i> ' + (step ? 'Edit' : 'Add') + ' Step', `
        <div class="form-grid">
            <div class="form-group"><label>Step Number *</label><input type="number" id="ps-num" value="${step?.step_number || ''}"></div>
            <div class="form-group"><label>Title *</label><input type="text" id="ps-title" value="${step?.step_title || ''}"></div>
            <div class="form-group"><label>Icon Class</label><input type="text" id="ps-icon" value="${step?.step_icon || 'fas fa-check'}"></div>
            <div class="form-group"><label>Duration</label><input type="text" id="ps-duration" value="${step?.duration_text || ''}" placeholder="e.g., 2-3 Weeks"></div>
            <div class="form-group full"><label>Description</label><textarea id="ps-desc" rows="3">${step?.step_description || ''}</textarea></div>
            <div class="form-group full"><label>Details (comma separated)</label><textarea id="ps-details" rows="3">${step?.step_details?.join(', ') || ''}</textarea></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="ps-active" ${step?.is_active !== false ? 'checked' : ''}><label>Active</label></div>
        </div>
    `, async () => {
        const detailsText = document.getElementById('ps-details').value;
        const record = {
            step_number: parseInt(document.getElementById('ps-num').value),
            step_title: document.getElementById('ps-title').value,
            step_icon: document.getElementById('ps-icon').value,
            duration_text: document.getElementById('ps-duration').value,
            step_description: document.getElementById('ps-desc').value,
            step_details: detailsText ? detailsText.split(',').map(d => d.trim()) : [],
            is_active: document.getElementById('ps-active').checked,
            display_order: parseInt(document.getElementById('ps-num').value)
        };
        if (step) await supabaseClient.from(table).update(record).eq('id', step.id);
        else await supabaseClient.from(table).insert([record]);
        showToast('success', 'Saved', 'Step saved'); closeModal(); loadProcess(type);
    });
}

function editProcessStep(type, id) {
    const table = type === 'construction' ? 'construction_process' : 'design_process';
    supabaseClient.from(table).select('*').eq('id', id).single().then(({ data }) => { if (data) openProcessModal(type, data); });
}

// ============================================
// ABOUT US
// ============================================
async function loadAbout() {
    const { data } = await supabaseClient.from('about_us').select('*').limit(1).single();
    if (data) {
        document.getElementById('about-title').value = data.title || '';
        document.getElementById('about-description').value = data.description || '';
        document.getElementById('about-years').value = data.years_experience || 0;
        document.getElementById('about-projects').value = data.projects_completed || 0;
        document.getElementById('about-clients').value = data.happy_clients || 0;
        document.getElementById('about-awards').value = data.awards_won || 0;
        document.getElementById('about-team').value = data.team_members || 0;
        document.getElementById('about-mission').value = data.mission_text || '';
        document.getElementById('about-vision').value = data.vision_text || '';
    }
}

// ============================================
// SITE SETTINGS
// ============================================
async function loadSettings() {
    const { data } = await supabaseClient.from('site_settings').select('*');
    const grid = document.getElementById('settingsGrid');
    if (!data) return;
    grid.innerHTML = data.map(s => `
        <div class="form-group">
            <label>${s.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
            <input type="text" name="setting_${s.setting_key}" value="${s.setting_value || ''}" data-key="${s.setting_key}">
        </div>
    `).join('');
}

// ============================================
// TEAM MEMBERS
// ============================================
async function loadTeam() {
    const { data } = await supabaseClient.from('team_members').select('*').order('display_order');
    const tbody = document.getElementById('teamTableBody');
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">No team members</td></tr>'; return; }
    tbody.innerHTML = data.map(m => `
        <tr>
            <td><strong>${m.member_name}</strong></td>
            <td>${m.designation || '-'}</td>
            <td>${m.email || '-'}</td>
            <td>${m.phone || '-'}</td>
            <td><span class="status-badge ${m.is_active ? 'status-active' : 'status-inactive'}">${m.is_active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editTeamMember(${m.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteRecord('team_members', ${m.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openTeamModal(m = null) {
    openModal('<i class="fas fa-user-tie"></i> ' + (m ? 'Edit' : 'Add') + ' Member', `
        <div class="form-grid">
            <div class="form-group"><label>Name *</label><input type="text" id="tm-name" value="${m?.member_name || ''}"></div>
            <div class="form-group"><label>Designation</label><input type="text" id="tm-desig" value="${m?.designation || ''}"></div>
            <div class="form-group"><label>Email</label><input type="email" id="tm-email" value="${m?.email || ''}"></div>
            <div class="form-group"><label>Phone</label><input type="tel" id="tm-phone" value="${m?.phone || ''}"></div>
            <div class="form-group"><label>Photo URL</label><input type="text" id="tm-photo" value="${m?.photo_url || ''}"></div>
            <div class="form-group"><label>Order</label><input type="number" id="tm-order" value="${m?.display_order || 0}"></div>
            <div class="form-group full"><label>Bio</label><textarea id="tm-bio" rows="3">${m?.bio || ''}</textarea></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="tm-active" ${m?.is_active !== false ? 'checked' : ''}><label>Active</label></div>
        </div>
    `, async () => {
        const record = { member_name: document.getElementById('tm-name').value, designation: document.getElementById('tm-desig').value, email: document.getElementById('tm-email').value, phone: document.getElementById('tm-phone').value, photo_url: document.getElementById('tm-photo').value, display_order: parseInt(document.getElementById('tm-order').value) || 0, bio: document.getElementById('tm-bio').value, is_active: document.getElementById('tm-active').checked };
        if (m) await supabaseClient.from('team_members').update(record).eq('id', m.id);
        else await supabaseClient.from('team_members').insert([record]);
        showToast('success', 'Saved', 'Member saved'); closeModal(); loadTeam();
    });
}

function editTeamMember(id) { supabaseClient.from('team_members').select('*').eq('id', id).single().then(({ data }) => { if (data) openTeamModal(data); }); }

// ============================================
// BLOGS
// ============================================
async function loadBlogs() {
    const { data } = await supabaseClient.from('blogs').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('blogsTableBody');
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">No blog posts</td></tr>'; return; }
    tbody.innerHTML = data.map(b => `
        <tr>
            <td><strong>${b.title}</strong></td>
            <td>${b.category || '-'}</td>
            <td>${b.views || 0}</td>
            <td>${b.is_published ? '<span class="status-badge status-active">Published</span>' : '<span class="status-badge status-pending">Draft</span>'}</td>
            <td>${new Date(b.created_at).toLocaleDateString()}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editBlog(${b.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteRecord('blogs', ${b.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openBlogModal(b = null) {
    openModal('<i class="fas fa-blog"></i> ' + (b ? 'Edit' : 'New') + ' Post', `
        <div class="form-grid">
            <div class="form-group full"><label>Title *</label><input type="text" id="blog-title" value="${b?.title || ''}"></div>
            <div class="form-group"><label>Category</label><input type="text" id="blog-cat" value="${b?.category || 'general'}"></div>
            <div class="form-group"><label>Featured Image URL</label><input type="text" id="blog-img" value="${b?.featured_image || ''}"></div>
            <div class="form-group full"><label>Excerpt</label><textarea id="blog-excerpt" rows="2">${b?.excerpt || ''}</textarea></div>
            <div class="form-group full"><label>Content</label><textarea id="blog-content" rows="8">${b?.content || ''}</textarea></div>
            <div class="form-group checkbox-group"><input type="checkbox" id="blog-published" ${b?.is_published ? 'checked' : ''}><label>Publish</label></div>
        </div>
    `, async () => {
        const record = { 
            title: document.getElementById('blog-title').value, 
            category: document.getElementById('blog-cat').value, 
            featured_image: document.getElementById('blog-img').value, 
            excerpt: document.getElementById('blog-excerpt').value, 
            content: document.getElementById('blog-content').value, 
            is_published: document.getElementById('blog-published').checked, 
            published_at: document.getElementById('blog-published').checked ? new Date().toISOString() : null 
        };
        if (b) await supabaseClient.from('blogs').update(record).eq('id', b.id);
        else await supabaseClient.from('blogs').insert([record]);
        showToast('success', 'Saved', 'Post saved'); 
        closeModal(); 
        loadBlogs();
    });
}

function editBlog(id) { 
    supabaseClient.from('blogs').select('*').eq('id', id).single().then(({ data }) => { 
        if (data) openBlogModal(data); 
    }); 
}

// ============================================
// FORMS INITIALIZATION
// ============================================
function initForms() {
    // About Us Form
    const aboutForm = document.getElementById('aboutForm');
    if (aboutForm) {
        aboutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const record = {
                title: document.getElementById('about-title').value,
                description: document.getElementById('about-description').value,
                years_experience: parseInt(document.getElementById('about-years').value) || 0,
                projects_completed: parseInt(document.getElementById('about-projects').value) || 0,
                happy_clients: parseInt(document.getElementById('about-clients').value) || 0,
                awards_won: parseInt(document.getElementById('about-awards').value) || 0,
                team_members: parseInt(document.getElementById('about-team').value) || 0,
                mission_text: document.getElementById('about-mission').value,
                vision_text: document.getElementById('about-vision').value
            };
            
            // Check if record exists
            const { data: existing } = await supabaseClient.from('about_us').select('id').limit(1).single();
            
            if (existing) {
                await supabaseClient.from('about_us').update(record).eq('id', existing.id);
            } else {
                await supabaseClient.from('about_us').insert([record]);
            }
            
            showToast('success', 'Saved', 'About Us updated successfully');
        });
    }
    
    // Settings Form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = settingsForm.querySelectorAll('input[data-key]');
            
            for (const input of inputs) {
                const key = input.getAttribute('data-key');
                const value = input.value;
                await supabaseClient.from('site_settings').update({ setting_value: value }).eq('setting_key', key);
            }
            
            showToast('success', 'Saved', 'Site settings updated successfully');
        });
    }
    
    // Search filters
    const enquirySearch = document.getElementById('enquirySearch');
    if (enquirySearch) {
        enquirySearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('#enquiriesTableBody tr').forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }
    
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) {
        customerSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('#customersTableBody tr').forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }
    
    const featureSearch = document.getElementById('featureSearch');
    if (featureSearch) {
        featureSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('#featuresTableBody tr').forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }
    
    const enquiryStatusFilter = document.getElementById('enquiryStatusFilter');
    if (enquiryStatusFilter) {
        enquiryStatusFilter.addEventListener('change', (e) => {
            const status = e.target.value;
            document.querySelectorAll('#enquiriesTableBody tr').forEach(row => {
                if (!status) {
                    row.style.display = '';
                } else {
                    const rowStatus = row.querySelector('select')?.value;
                    row.style.display = rowStatus === status ? '' : 'none';
                }
            });
        });
    }
}

// ============================================
// GLOBAL FUNCTIONS (Expose to HTML onclick handlers)
// ============================================
window.showPage = showPage;
window.toggleSidebar = toggleSidebar;
window.closeModal = closeModal;
window.logout = logout;
window.deleteRecord = deleteRecord;
window.updateEnquiryStatus = updateEnquiryStatus;
window.viewEnquiry = viewEnquiry;
window.toggleUserStatus = toggleUserStatus;
window.openCustomerProjectModal = openCustomerProjectModal;
window.editCustomerProject = editCustomerProject;
window.openPaymentModal = openPaymentModal;
window.openChat = openChat;
window.sendAdminMessage = sendAdminMessage;
window.openPackageModal = openPackageModal;
window.editPackage = editPackage;
window.viewPackageSections = viewPackageSections;
window.addSectionToPackage = addSectionToPackage;
window.addItemToSection = addItemToSection;
window.deleteSection = deleteSection;
window.deleteItem = deleteItem;
window.openFeatureCategoryModal = openFeatureCategoryModal;
window.editFeatureCategory = editFeatureCategory;
window.openFeatureModal = openFeatureModal;
window.editFeature = editFeature;
window.openServiceModal = openServiceModal;
window.editService = editService;
window.openProjectModal = openProjectModal;
window.editProject = editProject;
window.openTestimonialModal = openTestimonialModal;
window.editTestimonial = editTestimonial;
window.openFaqModal = openFaqModal;
window.editFaq = editFaq;
window.openProcessModal = openProcessModal;
window.editProcessStep = editProcessStep;
window.openTeamModal = openTeamModal;
window.editTeamMember = editTeamMember;
window.openBlogModal = openBlogModal;
window.editBlog = editBlog;