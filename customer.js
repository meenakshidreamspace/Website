// ============================================
// MEENAKSHI DREAM SPACE - CUSTOMER DASHBOARD
// Ultra Premium Version with Advanced Features
// ============================================

const SUPABASE_URL = 'https://bjaljadzmlvmmixllofo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqYWxqYWR6bWx2bW1peGxsb2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NzQzODAsImV4cCI6MjEwNDM1MDM4MH0.ka7VgIxmjBQtoy-lG2Lg6P7DAA4ee9nf6bYekW0twLU';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Global Variables
let currentUser = null;
let userProfile = null;
let customerProjects = [];
let refreshInterval = null;
let notificationSound = null;

// Fallback image for broken images
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1216544/pexels-photo-1216544.jpeg?auto=compress&cs=tinysrgb&w=800';

// ============================================
// UTILITY FUNCTIONS
// ============================================
function safeText(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatCurrency(amount) {
    return 'Rs.' + Number(amount || 0).toLocaleString('en-IN');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch { return dateStr; }
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch { return dateStr; }
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        
        // Relative time
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' hrs ago';
        if (diff < 604800000) return Math.floor(diff / 86400000) + ' days ago';
        
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch { return dateStr; }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initNavigation();
    initProfileForm();
    initPasswordForm();
    startRealtimeListeners();
    initKeyboardShortcuts();
});

// ============================================
// AUTH CHECK (Enhanced)
// ============================================
async function checkAuth() {
    try {
        // Priority 1: Session storage (for demo users)
        const storedAdmin = sessionStorage.getItem('mds_admin');
        const storedRole = sessionStorage.getItem('mds_role');
        
        if (storedAdmin && storedRole === 'customer') {
            userProfile = JSON.parse(storedAdmin);
            updateCustomerUI();
            loadDashboardData();
            console.log('%c✓ Customer Session Loaded', 'color: #10b981; font-weight: bold;');
            return;
        }

        // Priority 2: Supabase session
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session && session.user) {
            currentUser = session.user;
            await loadUserProfile();
            return;
        }

        // No session - redirect
        window.location.href = 'auth.html';
    } catch (err) {
        console.error('Auth check error:', err);
        window.location.href = 'auth.html';
    }
}

async function loadUserProfile() {
    if (!currentUser) return;

    try {
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error || !profile) {
            // Create profile if missing
            const { data: newProfile } = await supabaseClient
                .from('profiles')
                .insert([{
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
                    phone: currentUser.user_metadata?.phone || '',
                    role: 'customer',
                    is_active: true
                }])
                .select()
                .single();
            
            userProfile = newProfile;
        } else {
            userProfile = profile;
        }

        // Redirect admins away
        if (userProfile && (userProfile.role === 'super_admin' || userProfile.role === 'admin')) {
            window.location.href = 'admin-dashboard.html';
            return;
        }

        updateCustomerUI();
        loadDashboardData();
    } catch (err) {
        console.error('Profile load error:', err);
        window.location.href = 'auth.html';
    }
}

function updateCustomerUI() {
    if (!userProfile) return;

    const name = userProfile.full_name || 'User';
    const initial = name.charAt(0).toUpperCase();
    const firstName = name.split(' ')[0];

    // Update all UI elements
    const elements = {
        userName: document.getElementById('userName'),
        userEmail: document.getElementById('userEmail'),
        userAvatar: document.getElementById('userAvatar'),
        welcomeName: document.getElementById('welcomeName'),
        profileName: document.getElementById('profileName'),
        profileEmail: document.getElementById('profileEmail'),
        profilePhone: document.getElementById('profilePhone'),
        profileCity: document.getElementById('profileCity'),
        profileAddress: document.getElementById('profileAddress')
    };

    if (elements.userName) elements.userName.textContent = name;
    if (elements.userEmail) elements.userEmail.textContent = userProfile.email || '';
    if (elements.userAvatar) elements.userAvatar.textContent = initial;
    if (elements.welcomeName) {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
        elements.welcomeName.textContent = `${greeting}, ${firstName}!`;
    }

    if (elements.profileName) elements.profileName.value = userProfile.full_name || '';
    if (elements.profileEmail) elements.profileEmail.value = userProfile.email || '';
    if (elements.profilePhone) elements.profilePhone.value = userProfile.phone || '';
    if (elements.profileCity) elements.profileCity.value = userProfile.city || '';
    if (elements.profileAddress) elements.profileAddress.value = userProfile.address || '';
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

    if (section) {
        section.classList.add('active');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (menuItem) menuItem.classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'my-projects': 'My Projects',
        'progress': 'Project Progress',
        'payments': 'Payments',
        'documents': 'Documents',
        'messages': 'Messages',
        'notifications': 'Notifications',
        'enquiries': 'My Enquiries',
        'profile': 'My Profile',
        'support': 'Support'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[page] || 'Dashboard';

    const loaders = {
        'dashboard': loadDashboardData,
        'my-projects': loadMyProjects,
        'progress': loadProgress,
        'payments': loadPayments,
        'documents': loadDocuments,
        'messages': loadMessages,
        'notifications': loadNotifications,
        'enquiries': loadEnquiries
    };

    if (loaders[page]) loaders[page]();

    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // ESC to close modals/menus
        if (e.key === 'Escape') {
            closeImageModal();
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        }
        
        // Number keys for quick page navigation (Alt + Number)
        if (e.altKey && !isNaN(e.key)) {
            const pages = ['dashboard', 'my-projects', 'progress', 'payments', 'documents', 'messages', 'notifications'];
            const idx = parseInt(e.key) - 1;
            if (pages[idx]) {
                e.preventDefault();
                showPage(pages[idx]);
            }
        }
    });
}

// ============================================
// DASHBOARD DATA
// ============================================
async function loadDashboardData() {
    if (!userProfile) return;

    try {
        // Load projects
        const { data: projects } = await supabaseClient
            .from('customer_projects')
            .select('*')
            .eq('customer_id', userProfile.id);

        customerProjects = projects || [];
        const activeProjects = customerProjects.filter(p => p.project_status !== 'completed');

        // Update project count
        const statProjects = document.getElementById('statProjects');
        if (statProjects) statProjects.textContent = activeProjects.length;

        // Calculate average progress
        if (customerProjects.length > 0) {
            const statusProgress = {
                'planning': 5, 'design': 15, 'approval': 25,
                'foundation': 35, 'structure': 55, 'finishing': 75,
                'handover': 90, 'completed': 100
            };
            const avgProgress = Math.round(
                customerProjects.reduce((sum, p) => sum + (statusProgress[p.project_status] || 0), 0) / customerProjects.length
            );
            const statProgress = document.getElementById('statProgress');
            if (statProgress) statProgress.textContent = avgProgress + '%';
        }

        // Load payments
        const { data: payments } = await supabaseClient
            .from('payments')
            .select('amount, payment_status')
            .eq('customer_id', userProfile.id);

        const totalPaid = (payments || [])
            .filter(p => p.payment_status === 'completed')
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

        const statPaid = document.getElementById('statPaid');
        if (statPaid) statPaid.textContent = formatCurrency(totalPaid);

        // Load enquiries count
        const { count: enqCount } = await supabaseClient
            .from('enquiries')
            .select('*', { count: 'exact', head: true })
            .or(`phone.eq.${userProfile.phone || ''},email.eq.${userProfile.email || ''}`);

        const statEnquiries = document.getElementById('statEnquiries');
        if (statEnquiries) statEnquiries.textContent = enqCount || 0;

        // Load recent updates
        if (customerProjects.length > 0) {
            const projectIds = customerProjects.map(p => p.id);
            const { data: updates } = await supabaseClient
                .from('project_updates')
                .select('*')
                .in('customer_project_id', projectIds)
                .order('created_at', { ascending: false })
                .limit(5);

            const updatesContainer = document.getElementById('recentUpdates');
            if (updatesContainer && updates && updates.length > 0) {
                updatesContainer.innerHTML = updates.map(u => `
                    <div class="notification-item">
                        <div class="notification-icon" style="background: linear-gradient(135deg, #32699b, #1a3459);">
                            <i class="fas fa-hard-hat"></i>
                        </div>
                        <div class="notification-content">
                            <h4>${safeText(u.update_title)}</h4>
                            <p>${safeText(u.update_description || '')}</p>
                            <span class="time">
                                <i class="fas fa-clock" style="font-size:10px; margin-right:4px;"></i>
                                ${formatTime(u.created_at)}
                                ${u.progress_percentage ? ` • ${u.progress_percentage}% Complete` : ''}
                            </span>
                        </div>
                    </div>
                `).join('');
            }
        }

        loadNotificationCount();

    } catch (err) {
        console.error('Dashboard error:', err);
    }
}

// ============================================
// MY PROJECTS
// ============================================
async function loadMyProjects() {
    if (!userProfile) return;

    try {
        const { data: projects } = await supabaseClient
            .from('customer_projects')
            .select('*, packages(package_name, price_label)')
            .eq('customer_id', userProfile.id)
            .order('created_at', { ascending: false });

        const container = document.getElementById('myProjectsContent');
        if (!container) return;

        if (!projects || projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-home"></i>
                    <h3>No Projects Yet</h3>
                    <p>Once you start a construction project with us, all details will appear here.</p>
                    <br>
                    <a href="index.html#contact" class="btn-submit">
                        <i class="fas fa-phone"></i> Start Your Project
                    </a>
                </div>
            `;
            return;
        }

        const statusProgress = {
            'planning': 5, 'design': 15, 'approval': 25,
            'foundation': 35, 'structure': 55, 'finishing': 75,
            'handover': 90, 'completed': 100
        };

        container.innerHTML = projects.map(p => {
            const progress = statusProgress[p.project_status] || 0;
            const remaining = (p.total_cost || 0) - (p.paid_amount || 0);
            const paidPercentage = p.total_cost > 0 ? Math.round((p.paid_amount / p.total_cost) * 100) : 0;
            
            return `
                <div class="card" style="margin-bottom:20px; border-left:4px solid var(--primary);">
                    <div class="card-header">
                        <h3><i class="fas fa-home"></i> ${safeText(p.project_name)}</h3>
                        <span class="status-badge status-${p.project_status}">${safeText(p.project_status.replace('_', ' '))}</span>
                    </div>
                    <div class="card-body">
                        <div class="project-detail-grid">
                            <div class="detail-item">
                                <label>Package</label>
                                <p>${safeText(p.packages?.package_name || 'N/A')}</p>
                            </div>
                            <div class="detail-item">
                                <label>Plot Area</label>
                                <p>${p.plot_area || 'N/A'} sq.ft</p>
                            </div>
                            <div class="detail-item">
                                <label>Total Cost</label>
                                <p>${formatCurrency(p.total_cost)}</p>
                            </div>
                            <div class="detail-item">
                                <label>Amount Paid</label>
                                <p style="color:#10b981;">${formatCurrency(p.paid_amount)} <small>(${paidPercentage}%)</small></p>
                            </div>
                            <div class="detail-item">
                                <label>Remaining</label>
                                <p style="color:${remaining > 0 ? '#f59e0b' : '#10b981'};">${formatCurrency(remaining)}</p>
                            </div>
                            <div class="detail-item">
                                <label>Start Date</label>
                                <p>${formatDate(p.start_date)}</p>
                            </div>
                            <div class="detail-item">
                                <label>Expected Completion</label>
                                <p>${formatDate(p.expected_completion)}</p>
                            </div>
                        </div>

                        <div class="progress-container">
                            <div class="progress-info">
                                <span><i class="fas fa-chart-line"></i> Construction Progress</span>
                                <span class="progress-value">${progress}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%;"></div>
                            </div>
                        </div>

                        ${p.site_address ? `
                            <div style="margin-top:15px; padding:15px; background:var(--gray-50); border-radius:var(--radius-md); border-left:3px solid var(--primary);">
                                <strong style="font-size:13px; color:var(--gray-600);">
                                    <i class="fas fa-map-marker-alt" style="color:var(--primary);"></i> Site Address:
                                </strong>
                                <p style="margin-top:6px; font-size:14px; color:var(--gray-700);">${safeText(p.site_address)}</p>
                            </div>
                        ` : ''}

                        ${p.notes ? `
                            <div style="margin-top:12px; padding:12px 15px; background:#fff8e1; border-radius:var(--radius-md); border-left:3px solid #f59e0b;">
                                <strong style="font-size:13px; color:#78350f;">
                                    <i class="fas fa-sticky-note" style="color:#f59e0b;"></i> Notes:
                                </strong>
                                <p style="margin-top:6px; font-size:13px; color:#92400e;">${safeText(p.notes)}</p>
                            </div>
                        ` : ''}

                        <div style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap;">
                            <button class="btn-submit" onclick="showPage('progress')" style="font-size:13px; padding:9px 18px;">
                                <i class="fas fa-chart-line"></i> View Progress
                            </button>
                            <button class="btn-submit" onclick="showPage('payments')" style="font-size:13px; padding:9px 18px; background:linear-gradient(135deg, #10b981, #059669);">
                                <i class="fas fa-wallet"></i> Payments
                            </button>
                            <button class="btn-submit" onclick="showPage('documents')" style="font-size:13px; padding:9px 18px; background:linear-gradient(135deg, #8b5cf6, #7c3aed);">
                                <i class="fas fa-folder"></i> Documents
                            </button>
                            <a href="https://wa.me/918190952731?text=Hi, I need an update on my project: ${encodeURIComponent(p.project_name)}" target="_blank" class="btn-submit" style="font-size:13px; padding:9px 18px; background:linear-gradient(135deg, #25d366, #128c7e);">
                                <i class="fab fa-whatsapp"></i> Ask Update
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Projects error:', err);
        showToast('error', 'Error', 'Could not load projects');
    }
}

// ============================================
// PROJECT PROGRESS (Enhanced with Image Modal)
// ============================================
async function loadProgress() {
    if (!userProfile) return;

    try {
        // Ensure customer projects are loaded
        if (customerProjects.length === 0) {
            const { data: projects } = await supabaseClient
                .from('customer_projects')
                .select('*')
                .eq('customer_id', userProfile.id);
            customerProjects = projects || [];
        }

        const container = document.getElementById('progressContent');
        if (!container) return;

        if (customerProjects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>No Active Project</h3>
                    <p>Progress updates will appear here once your project starts.</p>
                </div>
            `;
            return;
        }

        const projectIds = customerProjects.map(p => p.id);
        const { data: updates } = await supabaseClient
            .from('project_updates')
            .select('*')
            .in('customer_project_id', projectIds)
            .order('created_at', { ascending: false });

        if (!updates || updates.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h3>No Progress Updates Yet</h3>
                    <p>Your project manager will post updates here as construction progresses.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="project-timeline">
                ${updates.map(u => `
                    <div class="timeline-update">
                        <h4><i class="fas fa-hard-hat" style="color:var(--primary); margin-right:8px;"></i>${safeText(u.update_title)}</h4>
                        <div class="update-date">
                            <i class="fas fa-calendar" style="color:var(--primary);"></i> ${formatDateTime(u.created_at)}
                            ${u.progress_percentage ? `<span style="margin-left:10px; padding:3px 12px; background:linear-gradient(135deg, #32699b, #1a3459); color:white; border-radius:20px; font-size:11px; font-weight:600;">${u.progress_percentage}% Complete</span>` : ''}
                        </div>
                        <p>${safeText(u.update_description || '')}</p>
                        ${u.progress_percentage ? `
                            <div class="progress-container" style="margin-top:12px;">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${u.progress_percentage}%;"></div>
                                </div>
                            </div>
                        ` : ''}
                        ${u.image_urls && u.image_urls.length > 0 ? `
                            <div class="update-images">
                                ${u.image_urls.map((img, idx) => `
                                    <img src="${img}" 
                                         alt="Progress ${idx + 1}" 
                                         loading="lazy"
                                         onclick="openImageModal('${img}', ${idx}, ${JSON.stringify(u.image_urls).replace(/"/g, '&quot;')})"
                                         onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">
                                `).join('')}
                            </div>
                        ` : `
                            <div style="margin-top:12px; padding:20px; background:var(--gray-50); border-radius:8px; text-align:center; color:var(--gray-400);">
                                <i class="fas fa-image" style="font-size:32px; opacity:0.5;"></i>
                                <p style="font-size:12px; margin-top:8px;">No images available</p>
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>
        `;
    } catch (err) {
        console.error('Progress error:', err);
        showToast('error', 'Error', 'Could not load progress updates');
    }
}

// ============================================
// IMAGE MODAL / LIGHTBOX (Advanced)
// ============================================
let currentImageIndex = 0;
let currentImageArray = [];

function openImageModal(imageUrl, index = 0, imagesArray = null) {
    closeImageModal(); // Close any existing modal
    
    currentImageIndex = index;
    currentImageArray = imagesArray || [imageUrl];
    
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        backdrop-filter: blur(10px);
        animation: modalFadeIn 0.3s ease;
    `;
    
    const showNav = currentImageArray.length > 1;
    
    modal.innerHTML = `
        <button onclick="closeImageModal()" style="
            position: absolute;
            top: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
            background: white;
            border: none;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            color: #333;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 100001;
            transition: all 0.3s;
        " onmouseover="this.style.transform='rotate(90deg) scale(1.1)'" onmouseout="this.style.transform='rotate(0) scale(1)'">
            <i class="fas fa-times"></i>
        </button>
        
        ${showNav ? `
            <button onclick="navigateImage(-1)" style="
                position: absolute;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                width: 55px;
                height: 55px;
                background: rgba(255,255,255,0.15);
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                color: white;
                z-index: 100001;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='translateY(-50%) scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'; this.style.transform='translateY(-50%)'">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button onclick="navigateImage(1)" style="
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                width: 55px;
                height: 55px;
                background: rgba(255,255,255,0.15);
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                color: white;
                z-index: 100001;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='translateY(-50%) scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'; this.style.transform='translateY(-50%)'">
                <i class="fas fa-chevron-right"></i>
            </button>
        ` : ''}
        
        <img id="modalImage" src="${currentImageArray[currentImageIndex]}" 
             alt="Full Size Preview" 
             style="
                max-width: 90%;
                max-height: 85vh;
                object-fit: contain;
                border-radius: 12px;
                box-shadow: 0 25px 70px rgba(0,0,0,0.5);
                animation: modalZoomIn 0.4s ease;
             "
             onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">
        
        <div style="
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(20px);
            padding: 12px 24px;
            border-radius: 25px;
            color: white;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 15px;
            border: 1px solid rgba(255,255,255,0.2);
        ">
            ${showNav ? `<span id="imageCounter">${currentImageIndex + 1} / ${currentImageArray.length}</span> <span style="opacity:0.5;">|</span>` : ''}
            <span><i class="fas fa-mouse-pointer"></i> Click outside to close</span>
            <span style="opacity:0.5;">|</span>
            <span><i class="fas fa-keyboard"></i> ESC to close</span>
            <a href="${currentImageArray[currentImageIndex]}" download target="_blank" style="color:white; text-decoration:none; margin-left:10px;">
                <i class="fas fa-download"></i>
            </a>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeImageModal();
    });
}

function navigateImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = currentImageArray.length - 1;
    if (currentImageIndex >= currentImageArray.length) currentImageIndex = 0;
    
    const modalImage = document.getElementById('modalImage');
    const counter = document.getElementById('imageCounter');
    
    if (modalImage) {
        modalImage.style.animation = 'modalZoomIn 0.3s ease';
        modalImage.src = currentImageArray[currentImageIndex];
    }
    if (counter) counter.textContent = `${currentImageIndex + 1} / ${currentImageArray.length}`;
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.animation = 'modalFadeIn 0.3s ease reverse';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Add modal animation styles
if (!document.getElementById('imageModalStyles')) {
    const style = document.createElement('style');
    style.id = 'imageModalStyles';
    style.textContent = `
        @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes modalZoomIn {
            from { opacity: 0; transform: scale(0.85); }
            to { opacity: 1; transform: scale(1); }
        }
        .update-images {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
            margin-top: 15px;
            max-width: 700px;
        }
        .update-images img {
            width: 100%;
            height: 110px;
            object-fit: cover;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 3px solid transparent;
            background: #f3f4f6;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .update-images img:hover {
            transform: scale(1.05) translateY(-3px);
            border-color: #32699b;
            box-shadow: 0 10px 25px rgba(50, 105, 155, 0.35);
        }
    `;
    document.head.appendChild(style);
}

// Keyboard navigation for image modal
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('imageModal');
    if (modal) {
        if (e.key === 'ArrowLeft') navigateImage(-1);
        if (e.key === 'ArrowRight') navigateImage(1);
    }
});

// ============================================
// PAYMENTS (Enhanced)
// ============================================
async function loadPayments() {
    if (!userProfile) return;

    try {
        const { data: payments } = await supabaseClient
            .from('payments')
            .select('*')
            .eq('customer_id', userProfile.id)
            .order('created_at', { ascending: false });

        const completed = (payments || []).filter(p => p.payment_status === 'completed');
        const pending = (payments || []).filter(p => p.payment_status === 'pending');

        const totalPaid = completed.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const totalPending = pending.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

        const totalPaidEl = document.getElementById('totalPaid');
        const totalPendingEl = document.getElementById('totalPending');
        const totalInvoicesEl = document.getElementById('totalInvoices');
        
        if (totalPaidEl) totalPaidEl.textContent = formatCurrency(totalPaid);
        if (totalPendingEl) totalPendingEl.textContent = formatCurrency(totalPending);
        if (totalInvoicesEl) totalInvoicesEl.textContent = (payments || []).length;

        const tbody = document.getElementById('paymentsTableBody');
        if (!tbody) return;

        if (!payments || payments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:60px; color:#616262;">
                        <i class="fas fa-file-invoice-dollar" style="font-size:48px; opacity:0.3; margin-bottom:15px; display:block;"></i>
                        <h3 style="color:#374151; margin-bottom:5px;">No Payment Records</h3>
                        <p style="font-size:13px;">Your payment history will appear here.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = payments.map(p => `
            <tr>
                <td>${formatDate(p.payment_date || p.created_at)}</td>
                <td><strong style="color:#1a3459;">${formatCurrency(p.amount)}</strong></td>
                <td>${safeText(p.payment_type || '-')}</td>
                <td>
                    <i class="fas ${p.payment_method === 'UPI' ? 'fa-mobile-alt' : p.payment_method === 'Bank Transfer' ? 'fa-university' : 'fa-money-bill'}" style="color:#32699b; margin-right:5px;"></i>
                    ${safeText(p.payment_method || '-')}
                </td>
                <td>
                    <code style="background:#f3f4f6; padding:3px 8px; border-radius:4px; font-size:12px;">${safeText(p.transaction_id || '-')}</code>
                </td>
                <td>
                    <span class="status-badge status-${p.payment_status}">
                        <i class="fas ${p.payment_status === 'completed' ? 'fa-check-circle' : p.payment_status === 'pending' ? 'fa-clock' : 'fa-times-circle'}"></i>
                        ${p.payment_status}
                    </span>
                </td>
                <td>
                    ${p.receipt_url ? 
                        `<a href="${p.receipt_url}" target="_blank" class="btn-submit" style="padding:6px 12px; font-size:11px;">
                            <i class="fas fa-download"></i> Receipt
                        </a>` : 
                        `<span style="color:#9ca3af; font-size:12px;">
                            <i class="fas fa-hourglass-half"></i> Processing
                        </span>`
                    }
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Payments error:', err);
        showToast('error', 'Error', 'Could not load payments');
    }
}

// ============================================
// DOCUMENTS (Enhanced)
// ============================================
async function loadDocuments() {
    if (!userProfile) return;

    try {
        const { data: projects } = await supabaseClient
            .from('customer_projects')
            .select('id')
            .eq('customer_id', userProfile.id);

        const projectIds = (projects || []).map(p => p.id);

        const tbody = document.getElementById('documentsTableBody');
        if (!tbody) return;

        if (projectIds.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding:60px; color:#616262;">
                        <i class="fas fa-folder-open" style="font-size:48px; opacity:0.3; margin-bottom:15px; display:block;"></i>
                        <h3 style="color:#374151; margin-bottom:5px;">No Documents Available</h3>
                        <p style="font-size:13px;">Your project documents will appear here.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const { data: docs } = await supabaseClient
            .from('documents')
            .select('*')
            .in('customer_project_id', projectIds)
            .eq('is_customer_visible', true)
            .order('created_at', { ascending: false });

        if (!docs || docs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding:60px; color:#616262;">
                        <i class="fas fa-file-alt" style="font-size:48px; opacity:0.3; margin-bottom:15px; display:block;"></i>
                        <h3 style="color:#374151; margin-bottom:5px;">No Documents Uploaded</h3>
                        <p style="font-size:13px;">Documents will be uploaded by your project manager.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const docIcons = {
            'pdf': { icon: 'fas fa-file-pdf', color: '#ef4444' },
            'image': { icon: 'fas fa-file-image', color: '#8b5cf6' },
            'doc': { icon: 'fas fa-file-word', color: '#3b82f6' },
            'spreadsheet': { icon: 'fas fa-file-excel', color: '#10b981' },
            'drawing': { icon: 'fas fa-compass-drafting', color: '#f59e0b' },
            'contract': { icon: 'fas fa-file-contract', color: '#6366f1' },
            'default': { icon: 'fas fa-file', color: '#6b7280' }
        };

        tbody.innerHTML = docs.map(d => {
            const iconInfo = docIcons[d.document_type] || docIcons.default;
            return `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:40px; height:40px; background:${iconInfo.color}15; border-radius:8px; display:flex; align-items:center; justify-content:center;">
                                <i class="${iconInfo.icon}" style="color:${iconInfo.color}; font-size:18px;"></i>
                            </div>
                            <span style="font-weight:600;">${safeText(d.document_name)}</span>
                        </div>
                    </td>
                    <td>
                        <span style="text-transform:capitalize; padding:4px 10px; background:${iconInfo.color}15; color:${iconInfo.color}; border-radius:12px; font-size:11px; font-weight:600;">
                            ${safeText(d.document_type || 'General')}
                        </span>
                    </td>
                    <td>${formatDate(d.created_at)}</td>
                    <td>
                        <a href="${d.document_url}" target="_blank" class="btn-submit" style="padding:8px 14px; font-size:12px;">
                            <i class="fas fa-download"></i> Download
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Documents error:', err);
        showToast('error', 'Error', 'Could not load documents');
    }
}

// ============================================
// MESSAGES (Enhanced Chat)
// ============================================
async function loadMessages() {
    if (!userProfile) return;

    try {
        const { data: messages } = await supabaseClient
            .from('customer_messages')
            .select('*')
            .eq('customer_id', userProfile.id)
            .order('created_at', { ascending: true });

        const container = document.getElementById('messagesList');
        if (!container) return;

        if (!messages || messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>Start a Conversation</h3>
                    <p>Send us a message and our team will get back to you shortly.</p>
                </div>
            `;
            return;
        }

        // Group by date
        let lastDate = '';
        container.innerHTML = messages.map(m => {
            const messageDate = new Date(m.created_at).toDateString();
            let dateHeader = '';
            
            if (messageDate !== lastDate) {
                lastDate = messageDate;
                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();
                let displayDate = messageDate;
                if (messageDate === today) displayDate = 'Today';
                else if (messageDate === yesterday) displayDate = 'Yesterday';
                else displayDate = new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                
                dateHeader = `
                    <div style="text-align:center; margin:15px 0; position:relative;">
                        <span style="background:var(--gray-50); padding:5px 15px; border-radius:15px; font-size:11px; font-weight:600; color:var(--gray-500); text-transform:uppercase; letter-spacing:1px; border:1px solid var(--gray-200);">
                            ${displayDate}
                        </span>
                    </div>
                `;
            }
            
            return dateHeader + `
                <div class="message-bubble ${m.sender_type}">
                    ${safeText(m.message)}
                    <div class="message-time">
                        ${new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        ${m.sender_type === 'customer' ? '<i class="fas fa-check-double" style="margin-left:5px; font-size:10px;"></i>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.scrollTop = container.scrollHeight;

        // Mark admin messages as read
        await supabaseClient
            .from('customer_messages')
            .update({ is_read: true })
            .eq('customer_id', userProfile.id)
            .eq('sender_type', 'admin')
            .eq('is_read', false);
    } catch (err) {
        console.error('Messages error:', err);
    }
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message || !userProfile) return;

    input.value = '';
    input.disabled = true;

    const container = document.getElementById('messagesList');
    if (container.querySelector('.empty-state')) {
        container.innerHTML = '';
    }

    // Optimistic UI update
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble customer';
    bubble.innerHTML = `
        ${safeText(message)}
        <div class="message-time">
            Just now
            <i class="fas fa-clock" style="margin-left:5px; font-size:10px;"></i>
        </div>
    `;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;

    try {
        const { error } = await supabaseClient
            .from('customer_messages')
            .insert([{
                customer_id: userProfile.id,
                message: message,
                sender_type: 'customer',
                is_read: false
            }]);

        if (error) throw error;
        
        // Update timestamp icon to sent
        setTimeout(() => {
            const timeEl = bubble.querySelector('.message-time');
            if (timeEl) {
                timeEl.innerHTML = `Just now <i class="fas fa-check" style="margin-left:5px; font-size:10px;"></i>`;
            }
        }, 500);
        
    } catch (error) {
        showToast('error', 'Failed', 'Message could not be sent. Try again.');
        console.error('Message error:', error);
        bubble.style.opacity = '0.5';
        const timeEl = bubble.querySelector('.message-time');
        if (timeEl) {
            timeEl.innerHTML = `Failed <i class="fas fa-exclamation-triangle" style="margin-left:5px; color:#ef4444;"></i>`;
        }
    } finally {
        input.disabled = false;
        input.focus();
    }
}

// ============================================
// NOTIFICATIONS
// ============================================
async function loadNotifications() {
    if (!userProfile) return;

    try {
        const { data: notifications } = await supabaseClient
            .from('notifications')
            .select('*')
            .eq('user_id', userProfile.id)
            .order('created_at', { ascending: false });

        const container = document.getElementById('notificationsList');
        if (!container) return;

        if (!notifications || notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <h3>No Notifications</h3>
                    <p>You're all caught up! We'll notify you about project updates and important alerts.</p>
                </div>
            `;
            return;
        }

        const notifIcons = {
            'success': { icon: 'fas fa-check-circle', bg: '#10b98115', color: '#10b981' },
            'warning': { icon: 'fas fa-exclamation-triangle', bg: '#f59e0b15', color: '#f59e0b' },
            'info': { icon: 'fas fa-info-circle', bg: '#3b82f615', color: '#3b82f6' },
            'project': { icon: 'fas fa-hard-hat', bg: '#32699b15', color: '#32699b' },
            'payment': { icon: 'fas fa-wallet', bg: '#8b5cf615', color: '#8b5cf6' },
            'default': { icon: 'fas fa-bell', bg: '#6b728015', color: '#6b7280' }
        };

        container.innerHTML = notifications.map(n => {
            const iconInfo = notifIcons[n.notification_type] || notifIcons.default;
            return `
                <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="markNotifRead(${n.id}, this)">
                    <div class="notification-icon" style="background:${iconInfo.color}; color:white;">
                        <i class="${iconInfo.icon}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${safeText(n.title)} ${!n.is_read ? '<span style="width:8px; height:8px; background:#ef4444; border-radius:50%; display:inline-block; margin-left:5px;"></span>' : ''}</h4>
                        <p>${safeText(n.message || '')}</p>
                        <span class="time"><i class="fas fa-clock" style="font-size:10px; margin-right:4px;"></i>${formatTime(n.created_at)}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Notifications error:', err);
    }
}

async function loadNotificationCount() {
    if (!userProfile) return;

    try {
        const { count } = await supabaseClient
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userProfile.id)
            .eq('is_read', false);

        const badge = document.getElementById('notifBadge');
        const dot = document.getElementById('notifDot');

        if (count > 0) {
            if (badge) {
                badge.style.display = 'inline';
                badge.textContent = count > 99 ? '99+' : count;
            }
            if (dot) dot.style.display = 'block';
        } else {
            if (badge) badge.style.display = 'none';
            if (dot) dot.style.display = 'none';
        }
    } catch (err) {
        console.error('Notification count error:', err);
    }
}

async function markNotifRead(id, el) {
    if (el) el.classList.remove('unread');
    try {
        await supabaseClient
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
        loadNotificationCount();
    } catch (err) {
        console.error('Mark read error:', err);
    }
}

async function markAllRead() {
    if (!userProfile) return;
    
    try {
        await supabaseClient
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userProfile.id);
        loadNotifications();
        loadNotificationCount();
        showToast('success', 'Done', 'All notifications marked as read');
    } catch (err) {
        showToast('error', 'Error', 'Could not update notifications');
    }
}

// ============================================
// ENQUIRIES
// ============================================
async function loadEnquiries() {
    if (!userProfile) return;

    try {
        const { data: enquiries } = await supabaseClient
            .from('enquiries')
            .select('*')
            .or(`phone.eq.${userProfile.phone || ''},email.eq.${userProfile.email || ''}`)
            .order('created_at', { ascending: false });

        const tbody = document.getElementById('enquiriesTableBody');
        if (!tbody) return;

        if (!enquiries || enquiries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:60px; color:#616262;">
                        <i class="fas fa-envelope" style="font-size:48px; opacity:0.3; margin-bottom:15px; display:block;"></i>
                        <h3 style="color:#374151; margin-bottom:5px;">No Enquiries Yet</h3>
                        <p style="font-size:13px;">Your enquiries will appear here.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = enquiries.map(e => `
            <tr>
                <td>${formatDate(e.created_at)}</td>
                <td><strong>${safeText(e.subject || 'General Enquiry')}</strong></td>
                <td>${safeText(e.package_interested || '-')}</td>
                <td>
                    <span class="status-badge status-${e.status}">
                        <i class="fas ${e.status === 'new' ? 'fa-star' : e.status === 'contacted' ? 'fa-phone' : e.status === 'converted' ? 'fa-check-circle' : 'fa-clock'}"></i>
                        ${e.status.replace('_', ' ')}
                    </span>
                </td>
                <td title="${safeText(e.message || '')}">${safeText((e.message || '').substring(0, 60))}${(e.message || '').length > 60 ? '...' : ''}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Enquiries error:', err);
    }
}

// ============================================
// PROFILE FORM
// ============================================
function initProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!userProfile) return;

        const data = {
            full_name: document.getElementById('profileName').value.trim(),
            phone: document.getElementById('profilePhone').value.trim(),
            city: document.getElementById('profileCity').value.trim(),
            address: document.getElementById('profileAddress').value.trim()
        };

        // Validation
        if (!data.full_name || data.full_name.length < 2) {
            showToast('error', 'Invalid Name', 'Name must be at least 2 characters');
            return;
        }
        if (!data.phone || data.phone.replace(/\D/g, '').length < 10) {
            showToast('error', 'Invalid Phone', 'Please enter a valid 10-digit phone number');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const { error } = await supabaseClient
                .from('profiles')
                .update(data)
                .eq('id', userProfile.id);

            if (error) throw error;
            
            userProfile = { ...userProfile, ...data };
            sessionStorage.setItem('mds_admin', JSON.stringify(userProfile));
            updateCustomerUI();
            showToast('success', 'Profile Updated', 'Your profile has been saved successfully');
        } catch (error) {
            showToast('error', 'Error', 'Could not update profile');
            console.error('Profile update error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

// ============================================
// PASSWORD FORM
// ============================================
function initPasswordForm() {
    const form = document.getElementById('passwordForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        if (newPass.length < 8) {
            showToast('error', 'Weak Password', 'Password must be at least 8 characters');
            return;
        }

        if (newPass !== confirmPass) {
            showToast('error', 'Mismatch', 'Passwords do not match');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

        try {
            const { error } = await supabaseClient.auth.updateUser({
                password: newPass
            });

            if (error) throw error;
            
            showToast('success', 'Password Changed', 'Your password has been updated successfully');
            form.reset();
        } catch (error) {
            showToast('error', 'Error', error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

// ============================================
// REALTIME LISTENERS
// ============================================
function startRealtimeListeners() {
    if (!userProfile) return;

    try {
        // Notifications
        supabaseClient
            .channel('customer-notifications-' + userProfile.id)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userProfile.id}`
            }, (payload) => {
                loadNotificationCount();
                showToast('info', 'New Notification', payload.new.title);
                playNotificationSound();
            })
            .subscribe();

        // Messages
        supabaseClient
            .channel('customer-messages-' + userProfile.id)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'customer_messages',
                filter: `customer_id=eq.${userProfile.id}`
            }, (payload) => {
                if (payload.new.sender_type === 'admin') {
                    // Only reload if on messages page
                    const messagesPage = document.getElementById('page-messages');
                    if (messagesPage && messagesPage.classList.contains('active')) {
                        loadMessages();
                    }
                    showToast('info', 'New Message', 'Admin replied to your message');
                    playNotificationSound();
                }
            })
            .subscribe();

        // Project updates
        supabaseClient
            .channel('customer-project-updates-' + userProfile.id)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'project_updates'
            }, (payload) => {
                const isMyProject = customerProjects.some(p => p.id === payload.new.customer_project_id);
                if (isMyProject) {
                    showToast('success', 'Project Update', payload.new.update_title);
                    playNotificationSound();
                    // Refresh if on progress page
                    const progressPage = document.getElementById('page-progress');
                    if (progressPage && progressPage.classList.contains('active')) {
                        loadProgress();
                    }
                }
            })
            .subscribe();

        // Periodic refresh
        refreshInterval = setInterval(() => {
            loadNotificationCount();
        }, 60000);
    } catch (err) {
        console.error('Realtime error:', err);
    }
}

// ============================================
// NOTIFICATION SOUND
// ============================================
function playNotificationSound() {
    try {
        // Create simple beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
        // Sound not supported - ignore
    }
}

// ============================================
// LOGOUT
// ============================================
async function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    if (refreshInterval) clearInterval(refreshInterval);
    sessionStorage.removeItem('mds_admin');
    sessionStorage.removeItem('mds_role');
    
    try {
        await supabaseClient.auth.signOut();
    } catch (err) {
        console.log('Signout error:', err);
    }
    
    showToast('success', 'Logged Out', 'See you soon!');
    setTimeout(() => {
        window.location.href = 'auth.html';
    }, 1000);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(type, title, message, duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <div class="t-content">
            <div class="t-title">${safeText(title)}</div>
            <div class="t-message">${safeText(message)}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================
// NETWORK STATUS
// ============================================
window.addEventListener('online', () => {
    showToast('success', 'Back Online', 'Your internet connection has been restored.');
});

window.addEventListener('offline', () => {
    showToast('warning', 'No Internet', 'Please check your connection.');
});

// ============================================
// GLOBAL EXPORTS
// ============================================
window.showPage = showPage;
window.toggleSidebar = toggleSidebar;
window.sendMessage = sendMessage;
window.markAllRead = markAllRead;
window.markNotifRead = markNotifRead;
window.logout = logout;
window.showToast = showToast;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.navigateImage = navigateImage;

console.log('%cCustomer Dashboard Loaded', 'background: linear-gradient(135deg, #32699b, #1a3459); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');