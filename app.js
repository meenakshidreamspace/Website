// ============================================
// MEENAKSHI DREAM SPACE - ADVANCED APP JS
// Ultra Premium Version with Advanced Features
// ============================================

// Supabase Configuration
const SUPABASE_URL = 'https://bjaljadzmlvmmixllofo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqYWxqYWR6bWx2bW1peGxsb2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NzQzODAsImV4cCI6MjEwNDM1MDM4MH0.ka7VgIxmjBQtoy-lG2Lg6P7DAA4ee9nf6bYekW0twLU';

// Global Variables
let supabaseClient = null;
let allPackages = [];
let allProjects = [];
let allFeatures = [];
let allFeatureCategories = [];
let searchDebounceTimer = null;
let scrollProgress = 0;

// ============================================
// ICON VALIDATION - Auto-fix broken icons
// ============================================
function validateIcon(icon) {
    if (!icon) return 'fas fa-check';
    
    const iconFixes = {
        'fas fa-file-certificate': 'fas fa-stamp',
        'fas fa-certificate': 'fas fa-award',
        'fas fa-drafting-compass': 'fas fa-compass-drafting',
        'fa-drafting-compass': 'fa-compass-drafting',
        'fas fa-trowel': 'fas fa-trowel-bricks',
        'fas fa-hammer-crash': 'fas fa-hammer',
        'fas fa-house-user': 'fas fa-house',
        'fas fa-ruler-combined-alt': 'fas fa-ruler-combined'
    };
    
    for (const [broken, fixed] of Object.entries(iconFixes)) {
        if (icon.includes(broken)) {
            return icon.replace(broken, fixed);
        }
    }
    
    return icon;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function formatCurrency(amount) {
    return 'Rs.' + Number(amount).toLocaleString('en-IN');
}

function safeText(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(str, length) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isInputFocused() {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
}

// ============================================
// INITIALIZE SUPABASE (With Retry)
// ============================================
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('%c✓ Supabase Connected', 'color: #10b981; font-weight: bold;');
            initializeApp();
        } catch (err) {
            console.error('Supabase init error:', err);
            setTimeout(initializeSupabase, 500);
        }
    } else {
        setTimeout(initializeSupabase, 200);
    }
}

// ============================================
// INITIALIZE APP
// ============================================
function initializeApp() {
    // Core initializations
    initPreloader();
    initAOS();
    initNavigation();
    initHeroSlider();
    initScrollEffects();
    initScrollProgress();
    initCounters();
    initMobileMenu();
    initBackToTop();
    initProcessTabs();
    initEnquiryForm();
    initProjectFilter();
    initCostEstimator();
    initLazyLoading();
    initSmoothScroll();
    initKeyboardNavigation();
    initImageErrorHandler();
    
    // Load dynamic content
    loadSiteSettings();
    loadAboutUs();
    loadPackages();
    loadServices();
    loadConstructionProcess();
    loadDesignProcess();
    loadFeatureCategories();
    loadProjects();
    loadTestimonials();
    loadFAQs();
    
    // Calculate initial estimate
    calculateCost();
    
    console.log('%c✓ App Initialized', 'color: #10b981; font-weight: bold;');
}

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
});

// ============================================
// PRELOADER
// ============================================
function initPreloader() {
    const removePreloader = () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('loaded');
            setTimeout(() => preloader.remove(), 500);
        }
    };
    
    window.addEventListener('load', () => {
        setTimeout(removePreloader, 800);
    });
    
    // Safety timeout
    setTimeout(removePreloader, 3000);
}

// ============================================
// AOS ANIMATION
// ============================================
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: 'ease-in-out',
            mirror: false,
            anchorPlacement: 'top-bottom',
            disable: window.innerWidth < 480 ? 'phone' : false
        });
    }
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navbar) return;
    
    const handleScroll = throttle(() => {
        // Navbar shrink effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Active link highlighting
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Smooth scroll on nav click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 90;
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    closeMobileMenu();
                }
            }
        });
    });
}

// ============================================
// SCROLL PROGRESS INDICATOR
// ============================================
function initScrollProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.id = 'scrollProgress';
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-label', 'Page scroll progress');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #32699b, #1a3459, #ffd700);
        z-index: 10001;
        width: 0%;
        transition: width 0.1s ease;
        box-shadow: 0 0 10px rgba(50, 105, 155, 0.5);
        pointer-events: none;
    `;
    document.body.appendChild(progressBar);
    
    const updateProgress = throttle(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = scrollProgress + '%';
    }, 50);
    
    window.addEventListener('scroll', updateProgress, { passive: true });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const menu = document.getElementById('navMenu');
    
    if (!toggle || !menu) return;
    
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Close on link click
    menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (menu.classList.contains('active') && 
            !menu.contains(e.target) && 
            !toggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const menu = document.getElementById('navMenu');
    if (toggle) toggle.classList.remove('active');
    if (menu) menu.classList.remove('active');
    document.body.classList.remove('menu-open');
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not(.nav-link)').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 90;
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Home key - scroll to top
        if (e.key === 'Home' && !isInputFocused()) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // End key - scroll to bottom
        if (e.key === 'End' && !isInputFocused()) {
            e.preventDefault();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    });
}

// ============================================
// IMAGE ERROR HANDLER (Global)
// ============================================
function initImageErrorHandler() {
    const fallbackImg = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800';
    
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG' && !e.target.dataset.fallbackApplied) {
            e.target.dataset.fallbackApplied = 'true';
            e.target.src = fallbackImg;
        }
    }, true);
}

// ============================================
// HERO SLIDER
// ============================================
function initHeroSlider() {
    if (typeof Swiper === 'undefined') return;
    
    try {
        new Swiper('.hero-slider', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            effect: 'fade',
            fadeEffect: { crossFade: true },
            speed: 1500,
            keyboard: { enabled: true, onlyInViewport: true },
            a11y: { enabled: true }
        });
    } catch (err) {
        console.error('Hero slider init error:', err);
    }
}

// ============================================
// SCROLL EFFECTS
// ============================================
function initScrollEffects() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    const toggleBackToTop = throttle(() => {
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    }, 100);
    
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
}

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ============================================
// COUNTERS - Animated numbers
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;
    
    const options = { threshold: 0.3, rootMargin: '0px 0px -50px 0px' };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count')) || 0;
    const duration = 2500;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out-quart for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const value = Math.floor(easeOut * target);
        el.textContent = value.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

// ============================================
// LAZY LOADING - Advanced image loading
// ============================================
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ============================================
// LOAD SITE SETTINGS
// ============================================
async function loadSiteSettings() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('site_settings')
            .select('*');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            const settings = {};
            data.forEach(item => {
                settings[item.setting_key] = item.setting_value;
            });
            
            if (settings.hero_title) {
                const heroTitle = document.getElementById('heroTitle');
                if (heroTitle) {
                    heroTitle.innerHTML = settings.hero_title.replace(/dream home/gi, '<span class="highlight">Dream Home</span>');
                }
            }
            if (settings.hero_subtitle) {
                const heroSubtitle = document.getElementById('heroSubtitle');
                if (heroSubtitle) heroSubtitle.textContent = settings.hero_subtitle;
            }
        }
    } catch (error) {
        console.error('Site settings error:', error);
    }
}

// ============================================
// LOAD ABOUT US
// ============================================
async function loadAboutUs() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('about_us')
            .select('*')
            .eq('is_active', true)
            .limit(1)
            .single();
        
        if (error) return;
        
        if (data) {
            const els = {
                aboutTitle: document.getElementById('aboutTitle'),
                aboutDesc: document.getElementById('aboutDesc'),
                expYears: document.getElementById('expYears'),
                missionText: document.getElementById('missionText'),
                visionText: document.getElementById('visionText')
            };
            
            if (els.aboutTitle) els.aboutTitle.textContent = data.title;
            if (els.aboutDesc) els.aboutDesc.textContent = data.description;
            if (els.expYears) els.expYears.textContent = data.years_experience;
            if (els.missionText) els.missionText.textContent = data.mission_text;
            if (els.visionText) els.visionText.textContent = data.vision_text;
            
            updateStatsBarCounters(data);
        }
    } catch (error) {
        console.error('About us error:', error);
    }
}

function updateStatsBarCounters(data) {
    const stats = document.querySelectorAll('.stats-bar [data-count]');
    if (stats.length >= 4) {
        stats[0].setAttribute('data-count', data.projects_completed || 350);
        stats[1].setAttribute('data-count', data.happy_clients || 280);
        stats[2].setAttribute('data-count', data.awards_won || 18);
        stats[3].setAttribute('data-count', data.team_members || 65);
    }
    
    const heroStats = document.querySelectorAll('.hero-stats [data-count]');
    if (heroStats.length >= 3) {
        heroStats[0].setAttribute('data-count', data.years_experience || 12);
        heroStats[1].setAttribute('data-count', data.projects_completed || 350);
    }
}

// ============================================
// LOAD SERVICES
// ============================================
async function loadServices() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        
        if (error) throw error;
        
        const grid = document.getElementById('servicesGrid');
        if (!grid || !data || data.length === 0) return;
        
        grid.innerHTML = data.map((service, index) => `
            <div class="service-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="service-icon">
                    <i class="${validateIcon(service.service_icon) || 'fas fa-tools'}"></i>
                </div>
                <h3>${safeText(service.service_name)}</h3>
                <p>${safeText(service.service_description || '')}</p>
            </div>
        `).join('');
        
        refreshAOS();
    } catch (error) {
        console.error('Services error:', error);
    }
}

// ============================================
// LOAD PACKAGES WITH ACCORDIONS
// ============================================
async function loadPackages() {
    if (!supabaseClient) return;
    
    try {
        const [pkgResult, secResult, itemResult] = await Promise.all([
            supabaseClient.from('packages').select('*').eq('is_active', true).order('display_order'),
            supabaseClient.from('package_sections').select('*').eq('is_active', true).order('display_order'),
            supabaseClient.from('package_section_items').select('*').eq('is_active', true).order('display_order')
        ]);
        
        if (pkgResult.error) throw pkgResult.error;
        
        allPackages = pkgResult.data || [];
        const sections = secResult.data || [];
        const items = itemResult.data || [];
        
        const grid = document.getElementById('packagesGrid');
        if (!grid) return;
        
        if (allPackages.length === 0) {
            grid.innerHTML = createEmptyState('fas fa-box', 'Packages Coming Soon', 'Our construction packages will be updated shortly.');
            return;
        }
        
        grid.innerHTML = allPackages.map((pkg, pkgIndex) => {
            const pkgSections = sections.filter(s => s.package_id === pkg.id);
            const escapedName = pkg.package_name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            return `
                <div class="package-card ${pkg.is_popular ? 'popular' : ''}" data-aos="fade-up" data-aos-delay="${pkgIndex * 100}">
                    <div class="package-header">
                        ${pkg.badge_text ? `<span class="package-badge">${safeText(pkg.badge_text)}</span>` : ''}
                        <h3>${safeText(pkg.package_name)}</h3>
                        <div class="package-price">
                            ${safeText(pkg.price_label) || ('Rs.' + pkg.price_per_sqft + '/sq.ft')}
                            <small>onwards</small>
                        </div>
                    </div>
                    <div class="package-body">
                        <p class="package-desc">${safeText(pkg.short_description || '')}</p>
                        <div class="accordion">
                            ${pkgSections.map((section, secIndex) => {
                                const secItems = items.filter(i => i.section_id === section.id);
                                return `
                                    <div class="accordion-item ${secIndex === 0 ? 'active' : ''}">
                                        <button class="accordion-header" type="button" aria-expanded="${secIndex === 0}">
                                            <span class="ah-icon"><i class="${validateIcon(section.section_icon) || 'fas fa-check'}"></i></span>
                                            <span class="ah-title">${safeText(section.section_title)}</span>
                                            <i class="fas fa-chevron-down ah-arrow"></i>
                                        </button>
                                        <div class="accordion-content">
                                            <ul>
                                                ${secItems.map(item => `<li>${safeText(item.item_text)}</li>`).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div class="package-footer">
                        <button class="btn-primary" onclick="enquirePackage('${escapedName}')" type="button">
                            <i class="fas fa-envelope"></i> Enquire Now
                        </button>
                        <a href="https://wa.me/918190952731?text=Hi, I'm interested in ${encodeURIComponent(pkg.package_name)} package" target="_blank" class="btn-outline">
                            <i class="fab fa-whatsapp"></i> WhatsApp Us
                        </a>
                    </div>
                </div>
            `;
        }).join('');
        
        initAccordion();
        refreshAOS();
    } catch (error) {
        console.error('Packages error:', error);
        const grid = document.getElementById('packagesGrid');
        if (grid) {
            grid.innerHTML = createErrorState('Unable to load packages');
        }
    }
}

// ============================================
// ACCORDION FUNCTIONALITY
// ============================================
function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function(e) {
            e.preventDefault();
            const item = this.closest('.accordion-item');
            const accordion = this.closest('.accordion');
            const isActive = item.classList.contains('active');
            
            // Close all in same accordion
            accordion.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                const btn = i.querySelector('.accordion-header');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
            
            // Open clicked if was closed
            if (!isActive) {
                item.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

// ============================================
// PROCESS TABS
// ============================================
function initProcessTabs() {
    const tabs = document.querySelectorAll('.process-tab');
    const constructionTimeline = document.getElementById('constructionTimeline');
    const designTimeline = document.getElementById('designTimeline');
    
    if (tabs.length === 0) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabType = tab.getAttribute('data-tab');
            
            if (tabType === 'construction') {
                if (constructionTimeline) constructionTimeline.classList.remove('hidden');
                if (designTimeline) designTimeline.classList.add('hidden');
            } else {
                if (constructionTimeline) constructionTimeline.classList.add('hidden');
                if (designTimeline) designTimeline.classList.remove('hidden');
            }
            
            refreshAOS();
        });
    });
}

// ============================================
// LOAD CONSTRUCTION PROCESS
// ============================================
async function loadConstructionProcess() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('construction_process')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        
        if (error) throw error;
        
        const timeline = document.getElementById('constructionTimeline');
        if (!timeline) return;
        
        if (!data || data.length === 0) {
            timeline.innerHTML = createEmptyState('fas fa-hard-hat', 'Construction Process Coming Soon', 'Our detailed construction process will be updated shortly.');
            return;
        }
        
        timeline.innerHTML = data.map((step, index) => `
            <div class="timeline-item" data-aos="fade-${index % 2 === 0 ? 'right' : 'left'}" data-aos-delay="${index * 50}">
                <div class="timeline-content">
                    <div class="timeline-card">
                        <span class="timeline-step">Step ${step.step_number}</span>
                        <h3>${safeText(step.step_title)}</h3>
                        ${step.duration_text ? `<div class="timeline-duration"><i class="fas fa-clock"></i> ${safeText(step.duration_text)}</div>` : ''}
                        <p>${safeText(step.step_description || '')}</p>
                        ${step.step_details && step.step_details.length > 0 ? `
                            <ul class="timeline-details">
                                ${step.step_details.map(d => `<li>${safeText(d)}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                </div>
                <div class="timeline-marker">
                    <i class="${validateIcon(step.step_icon) || 'fas fa-check'}"></i>
                </div>
            </div>
        `).join('');
        
        refreshAOS();
    } catch (error) {
        console.error('Construction process error:', error);
        const timeline = document.getElementById('constructionTimeline');
        if (timeline) {
            timeline.innerHTML = createErrorState('Unable to load construction process');
        }
    }
}

// ============================================
// LOAD DESIGN PROCESS
// ============================================
async function loadDesignProcess() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('design_process')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        
        if (error) throw error;
        
        const timeline = document.getElementById('designTimeline');
        if (!timeline) return;
        
        if (!data || data.length === 0) {
            timeline.innerHTML = createEmptyState('fas fa-compass-drafting', 'Design Process Coming Soon', 'Our design workflow will be updated shortly.');
            return;
        }
        
        timeline.innerHTML = data.map((step, index) => `
            <div class="timeline-item" data-aos="fade-${index % 2 === 0 ? 'right' : 'left'}" data-aos-delay="${index * 50}">
                <div class="timeline-content">
                    <div class="timeline-card">
                        <span class="timeline-step">Step ${step.step_number}</span>
                        <h3>${safeText(step.step_title)}</h3>
                        ${step.duration_text ? `<div class="timeline-duration"><i class="fas fa-clock"></i> ${safeText(step.duration_text)}</div>` : ''}
                        <p>${safeText(step.step_description || '')}</p>
                        ${step.step_details && step.step_details.length > 0 ? `
                            <ul class="timeline-details">
                                ${step.step_details.map(d => `<li>${safeText(d)}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                </div>
                <div class="timeline-marker">
                    <i class="${validateIcon(step.step_icon) || 'fas fa-check'}"></i>
                </div>
            </div>
        `).join('');
        
        refreshAOS();
    } catch (error) {
        console.error('Design process error:', error);
    }
}

// ============================================
// LOAD FEATURES & CATEGORIES
// ============================================
async function loadFeatureCategories() {
    if (!supabaseClient) return;
    
    try {
        const [catResult, featResult] = await Promise.all([
            supabaseClient.from('feature_categories').select('*').eq('is_active', true).order('display_order'),
            supabaseClient.from('features').select('*').eq('is_active', true).order('display_order')
        ]);
        
        if (catResult.error) throw catResult.error;
        if (featResult.error) throw featResult.error;
        
        allFeatureCategories = catResult.data || [];
        allFeatures = featResult.data || [];
        
        if (allFeatures.length === 0) {
            const container = document.getElementById('featuresContent');
            if (container) {
                container.innerHTML = createEmptyState('fas fa-star', 'Features Coming Soon', 'Our 300+ premium features will be listed here shortly.');
            }
            return;
        }
        
        renderFeatureTabs();
        renderFeatures('all');
    } catch (error) {
        console.error('Features error:', error);
        const container = document.getElementById('featuresContent');
        if (container) {
            container.innerHTML = createErrorState('Unable to load features');
        }
    }
}

function renderFeatureTabs() {
    const tabsContainer = document.getElementById('featuresTabs');
    if (!tabsContainer) return;
    
    let tabsHTML = `<button class="feature-tab active" data-category="all" type="button">
        <i class="fas fa-th"></i> All Features <span class="tab-count">${allFeatures.length}</span>
    </button>`;
    
    allFeatureCategories.forEach(cat => {
        const count = allFeatures.filter(f => f.feature_category === cat.category_name).length;
        if (count > 0) {
            const escapedName = cat.category_name.replace(/"/g, '&quot;');
            tabsHTML += `<button class="feature-tab" data-category="${escapedName}" type="button">
                <i class="${validateIcon(cat.category_icon) || 'fas fa-check'}"></i> ${safeText(cat.category_name)} <span class="tab-count">${count}</span>
            </button>`;
        }
    });
    
    tabsContainer.innerHTML = tabsHTML;
    
    tabsContainer.querySelectorAll('.feature-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            tabsContainer.querySelectorAll('.feature-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderFeatures(tab.getAttribute('data-category'));
        });
    });
}

function renderFeatures(category) {
    const container = document.getElementById('featuresContent');
    if (!container) return;
    
    let filteredFeatures = category === 'all' 
        ? allFeatures 
        : allFeatures.filter(f => f.feature_category === category);
    
    if (filteredFeatures.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:#616262;">
                <i class="fas fa-info-circle" style="font-size:48px; margin-bottom:15px; color:#32699b;"></i>
                <p>No features found in this category.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `<div class="features-grid">
        ${filteredFeatures.map((feature, index) => `
            <div class="feature-item" style="opacity:0; animation: fadeInScale 0.4s ease forwards; animation-delay: ${(index % 12) * 50}ms;">
                <div class="feature-item-icon">
                    <i class="${validateIcon(feature.feature_icon) || 'fas fa-check'}"></i>
                </div>
                <div class="feature-item-content">
                    <h4>${safeText(feature.feature_title)}</h4>
                    ${feature.feature_description ? `<p>${safeText(feature.feature_description)}</p>` : ''}
                </div>
            </div>
        `).join('')}
    </div>`;
}

// ============================================
// LOAD PROJECTS / GALLERY
// ============================================
async function loadProjects() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        
        if (error) throw error;
        
        allProjects = data || [];
        renderProjects('all');
    } catch (error) {
        console.error('Projects error:', error);
    }
}

function renderProjects(filter) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    
    let filteredProjects = filter === 'all' 
        ? allProjects 
        : allProjects.filter(p => p.project_type && p.project_type.toLowerCase() === filter.toLowerCase());
    
    if (filteredProjects.length === 0) {
        grid.innerHTML = createEmptyState('fas fa-images', 'No Projects Available', 'Projects will be added soon.');
        return;
    }
    
    const fallbackImg = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800';
    
    grid.innerHTML = filteredProjects.map((project, index) => {
        const imageUrl = project.thumbnail_url || 
                        (project.image_urls && project.image_urls[0]) || 
                        fallbackImg;
        
        return `
            <div class="project-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                <div class="project-image">
                    <img src="${imageUrl}" alt="${safeText(project.project_title)}" loading="lazy" onerror="this.src='${fallbackImg}';">
                    <div class="project-overlay">
                        <a href="${imageUrl}" target="_blank" title="View Full Image"><i class="fas fa-search-plus"></i></a>
                    </div>
                </div>
                <div class="project-info">
                    ${project.project_type ? `<span class="project-type">${safeText(project.project_type)}</span>` : ''}
                    <h3>${safeText(project.project_title)}</h3>
                    ${project.project_description ? `<p style="font-size:14px; color:#4b5563; margin-top:8px;">${safeText(truncate(project.project_description, 100))}</p>` : ''}
                    <div class="project-meta">
                        ${project.location ? `<span><i class="fas fa-map-marker-alt"></i> ${safeText(project.location)}</span>` : ''}
                        ${project.area_sqft ? `<span><i class="fas fa-ruler-combined"></i> ${project.area_sqft} sq.ft</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    refreshAOS();
}

function initProjectFilter() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProjects(btn.getAttribute('data-filter'));
        });
    });
}

// ============================================
// LOAD TESTIMONIALS
// ============================================
async function loadTestimonials() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('testimonials')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const wrapper = document.getElementById('testimonialsWrapper');
        if (!wrapper) return;
        
        if (!data || data.length === 0) {
            wrapper.innerHTML = `
                <div class="swiper-slide">
                    ${createEmptyState('fas fa-quote-left', 'Testimonials Coming Soon', 'Client reviews will appear here.')}
                </div>
            `;
            return;
        }
        
        wrapper.innerHTML = data.map(t => `
            <div class="swiper-slide">
                <div class="testimonial-card">
                    <div class="testimonial-rating">
                        ${Array.from({length: 5}, (_, i) => `<i class="fa${i < t.rating ? 's' : 'r'} fa-star"></i>`).join('')}
                    </div>
                    <p class="testimonial-text">"${safeText(t.review_text)}"</p>
                    <div class="testimonial-author">
                        <div class="author-avatar">${t.client_name.charAt(0).toUpperCase()}</div>
                        <div class="author-info">
                            <h4>${safeText(t.client_name)}</h4>
                            <p>${safeText(t.client_designation || '')} ${t.location ? '• ' + safeText(t.location) : ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (typeof Swiper !== 'undefined') {
            try {
                new Swiper('.testimonials-slider', {
                    loop: data.length > 2,
                    slidesPerView: 1,
                    spaceBetween: 20,
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    },
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                        dynamicBullets: true
                    },
                    keyboard: { enabled: true },
                    a11y: { enabled: true },
                    breakpoints: {
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 }
                    }
                });
            } catch (err) {
                console.error('Testimonials swiper error:', err);
            }
        }
    } catch (error) {
        console.error('Testimonials error:', error);
    }
}

// ============================================
// LOAD FAQs
// ============================================
async function loadFAQs() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('faqs')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        
        if (error) throw error;
        
        const container = document.getElementById('faqContainer');
        if (!container) return;
        
        if (!data || data.length === 0) {
            container.innerHTML = createEmptyState('fas fa-question-circle', 'FAQs Coming Soon', 'Frequently asked questions will appear here.');
            return;
        }
        
        container.innerHTML = data.map((faq, index) => `
            <div class="faq-item ${index === 0 ? 'active' : ''}" data-aos="fade-up" data-aos-delay="${index * 50}">
                <button class="faq-question" type="button" aria-expanded="${index === 0}">
                    <span>${safeText(faq.question)}</span>
                    <i class="fas fa-plus"></i>
                </button>
                <div class="faq-answer">
                    <div class="faq-answer-content">${safeText(faq.answer)}</div>
                </div>
            </div>
        `).join('');
        
        initFAQ();
        refreshAOS();
    } catch (error) {
        console.error('FAQs error:', error);
    }
}

function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function(e) {
            e.preventDefault();
            const item = this.closest('.faq-item');
            const isActive = item.classList.contains('active');
            
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                const btn = i.querySelector('.faq-question');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
            
            if (!isActive) {
                item.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

// ============================================
// ENQUIRY FORM (Advanced Validation)
// ============================================
function initEnquiryForm() {
    const form = document.getElementById('enquiryForm');
    if (!form) return;
    
    // Real-time phone validation
    const phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^\d\s+\-()]/g, '');
        });
    }
    
    // Real-time email validation
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '';
            }
        });
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!supabaseClient) {
            showToast('error', 'Connection Error', 'Please refresh the page and try again.');
            return;
        }
        
        const formData = new FormData(form);
        const enquiryData = {
            full_name: formData.get('full_name')?.trim(),
            phone: formData.get('phone')?.trim(),
            email: formData.get('email')?.trim() || null,
            location: formData.get('location')?.trim() || null,
            package_interested: formData.get('package_interested') || null,
            plot_size: formData.get('plot_size')?.trim() || null,
            subject: formData.get('subject')?.trim() || 'General Enquiry',
            message: formData.get('message')?.trim() || null,
            enquiry_type: 'website',
            status: 'new'
        };
        
        // Validation
        if (!enquiryData.full_name || enquiryData.full_name.length < 2) {
            showToast('error', 'Invalid Name', 'Please enter your full name (min 2 characters).');
            return;
        }
        
        if (!enquiryData.phone || enquiryData.phone.replace(/\D/g, '').length < 10) {
            showToast('error', 'Invalid Phone', 'Please enter a valid 10-digit phone number.');
            return;
        }
        
        if (enquiryData.email && !isValidEmail(enquiryData.email)) {
            showToast('error', 'Invalid Email', 'Please enter a valid email address.');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        try {
            const { error } = await supabaseClient
                .from('enquiries')
                .insert([enquiryData]);
            
            if (error) throw error;
            
            showToast('success', 'Enquiry Submitted!', 'We will contact you within 24 hours.');
            form.reset();
            
            // Save to localStorage for tracking
            saveEnquiryToLocal(enquiryData);
            
            // WhatsApp option
            setTimeout(() => {
                const waMessage = createWhatsAppMessage(enquiryData);
                if (confirm('Would you like to also send this enquiry via WhatsApp for faster response?')) {
                    window.open(`https://wa.me/918190952731?text=${waMessage}`, '_blank');
                }
            }, 1500);
            
        } catch (error) {
            console.error('Enquiry error:', error);
            showToast('error', 'Submission Failed', 'Please try again or contact us directly at +91 81909 52731.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

function createWhatsAppMessage(data) {
    return encodeURIComponent(
        `Hi! I just submitted an enquiry from your website.\n\n` +
        `*Name:* ${data.full_name}\n` +
        `*Phone:* ${data.phone}\n` +
        `*Email:* ${data.email || 'N/A'}\n` +
        `*Package:* ${data.package_interested || 'N/A'}\n` +
        `*Plot Size:* ${data.plot_size || 'N/A'}\n` +
        `*Location:* ${data.location || 'N/A'}\n` +
        `*Message:* ${data.message || 'N/A'}`
    );
}

function saveEnquiryToLocal(data) {
    try {
        const enquiries = JSON.parse(localStorage.getItem('mds_enquiries') || '[]');
        enquiries.push({ ...data, timestamp: new Date().toISOString() });
        localStorage.setItem('mds_enquiries', JSON.stringify(enquiries.slice(-10)));
    } catch (err) {
        console.log('LocalStorage not available');
    }
}

// ============================================
// PACKAGE ENQUIRY
// ============================================
function enquirePackage(packageName) {
    const packageSelect = document.querySelector('select[name="package_interested"]');
    if (packageSelect) {
        const options = Array.from(packageSelect.options);
        const match = options.find(o => o.value.toLowerCase().includes(packageName.toLowerCase().split(' ')[0]));
        if (match) packageSelect.value = match.value;
    }
    
    const contact = document.getElementById('contact');
    if (contact) {
        contact.scrollIntoView({ behavior: 'smooth' });
    }
    
    showToast('info', 'Package Selected', `${packageName} pre-filled. Please complete the form.`);
    
    // Focus name field after scroll
    setTimeout(() => {
        const nameField = document.querySelector('input[name="full_name"]');
        if (nameField) nameField.focus();
    }, 1000);
}

// ============================================
// COST ESTIMATOR (With Animated Numbers)
// ============================================
function initCostEstimator() {
    ['plotArea', 'floors', 'packageType'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateCost);
            el.addEventListener('change', calculateCost);
        }
    });
}

function calculateCost() {
    const plotAreaEl = document.getElementById('plotArea');
    const floorsEl = document.getElementById('floors');
    const packageTypeEl = document.getElementById('packageType');
    
    if (!plotAreaEl || !floorsEl || !packageTypeEl) return;
    
    const plotArea = parseFloat(plotAreaEl.value) || 0;
    const floors = parseInt(floorsEl.value) || 1;
    const rate = parseFloat(packageTypeEl.value) || 0;
    
    const totalArea = plotArea * floors;
    const totalCost = totalArea * rate;
    
    const resultEl = document.getElementById('estimatedCost');
    if (resultEl) {
        animateNumber(resultEl, totalCost);
    }
}

function animateNumber(element, target) {
    const current = parseFloat(element.textContent.replace(/[^\d.-]/g, '')) || 0;
    const duration = 800;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const value = current + (target - current) * easeOut;
        element.textContent = formatCurrency(Math.floor(value));
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = formatCurrency(target);
        }
    }
    
    requestAnimationFrame(update);
}

// ============================================
// TOAST NOTIFICATIONS (Enhanced)
// ============================================
function showToast(type, title, message, duration = 5000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <div class="toast-content">
            <div class="toast-title">${safeText(title)}</div>
            <div class="toast-message">${safeText(message)}</div>
        </div>
        <i class="fas fa-times toast-close" role="button" tabindex="0" aria-label="Close"></i>
    `;
    
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        const closeToast = () => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        };
        
        closeBtn.addEventListener('click', closeToast);
        closeBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeToast();
            }
        });
    }
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function createEmptyState(icon, title, message) {
    return `
        <div style="text-align:center; padding:60px 20px; color:#616262; grid-column:1/-1;">
            <i class="${icon}" style="font-size:64px; color:#32699b; opacity:0.3; margin-bottom:20px;"></i>
            <h3 style="color:#1a3459; margin-bottom:10px; font-family: 'Playfair Display', serif;">${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

function createErrorState(message) {
    return `
        <div style="text-align:center; padding:40px 20px; color:#ef4444; grid-column:1/-1;">
            <i class="fas fa-exclamation-triangle" style="font-size:48px; margin-bottom:15px;"></i>
            <p style="font-weight:600;">${message}</p>
            <button onclick="location.reload()" style="margin-top:15px; padding:10px 24px; background:#32699b; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

function refreshAOS() {
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
}

// ============================================
// PAGE VISIBILITY API
// ============================================
document.addEventListener('visibilitychange', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('loaded');
        setTimeout(() => preloader.remove(), 500);
    }
});

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
// PERFORMANCE MONITORING
// ============================================
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            try {
                const perfData = performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                if (pageLoadTime > 0) {
                    console.log(`%cPage Loaded in ${(pageLoadTime / 1000).toFixed(2)}s`, 'color: #32699b; font-weight: bold;');
                }
            } catch (err) {}
        }, 0);
    });
}

// ============================================
// COPY TO CLIPBOARD (Utility)
// ============================================
function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('success', 'Copied!', successMessage);
        }).catch(() => {
            fallbackCopy(text, successMessage);
        });
    } else {
        fallbackCopy(text, successMessage);
    }
}

function fallbackCopy(text, successMessage) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('success', 'Copied!', successMessage);
    } catch (err) {
        showToast('error', 'Copy Failed', 'Please copy manually.');
    }
    document.body.removeChild(textarea);
}

// ============================================
// SHARE FUNCTIONALITY
// ============================================
function shareWebsite() {
    if (navigator.share) {
        navigator.share({
            title: 'Meenakshi Dream Space',
            text: 'Premium construction services with 300+ features',
            url: window.location.href
        }).catch(() => {});
    } else {
        copyToClipboard(window.location.href, 'Website link copied to share!');
    }
}

// ============================================
// GLOBAL EXPORTS
// ============================================
window.calculateCost = calculateCost;
window.enquirePackage = enquirePackage;
window.showToast = showToast;
window.copyToClipboard = copyToClipboard;
window.shareWebsite = shareWebsite;

// ============================================
// STARTUP LOG
// ============================================
console.log('%cMeenakshi Dream Space', 'background: linear-gradient(135deg, #32699b, #1a3459); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;');
console.log('%cBuilding Dreams Into Reality', 'color: #616262; font-size: 12px; padding: 4px;');
console.log('%cContact: +91 81909 52731', 'color: #1a3459; font-size: 11px;');