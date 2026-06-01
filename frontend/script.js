const API_BASE = 'http://localhost:8080/api';

let currentUser = JSON.parse(localStorage.getItem('crediskill_user')) || null;

// ================= PASSWORD TOGGLE =================
function togglePassword() {
    // Toggles the closest password input near the clicked eye icon
    const pass = document.getElementById("password");
    if (!pass) return;
    pass.type = pass.type === "password" ? "text" : "password";
}

// ================= NAVIGATION STATE =================
function updateNavigation() {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;

    authLinks.innerHTML = '';

    if (currentUser) {
        // Nav links — no avatar list item; avatar sits absolutely in nav
        authLinks.innerHTML = `
            <li><a href="#" onclick="navigateWithAnimation('marketplace.html')" class="nav-btn">Marketplace</a></li>
            <li><a href="#" onclick="navigateWithAnimation('profile.html')" class="nav-btn">Dashboard</a></li>
            <li><a href="#" onclick="logout()" class="nav-btn">Logout</a></li>
        `;

        // Inject the 3D avatar container into <nav> as an absolutely-positioned sibling
        const nav = authLinks.closest('nav');
        if (nav && !document.getElementById('avatar-3d-navbar')) {
            const avatarDiv = document.createElement('div');
            avatarDiv.id = 'avatar-3d-navbar';
            avatarDiv.title = 'Freelancer System Agent';
            // letter fallback visible until GLB loads
            avatarDiv.innerHTML = `<div class="avatar-3d-fallback">${(currentUser.name || 'U').charAt(0).toUpperCase()}</div>`;
            nav.appendChild(avatarDiv);
        }

        // Initialise 3D after DOM settles
        setTimeout(() => { initNavbarAvatar3D(); }, 120);
    } else {
        authLinks.innerHTML = `
            <li><a href="#" onclick="navigateWithAnimation('marketplace.html')" class="nav-btn">Marketplace</a></li>
            <li><a href="#" onclick="navigateWithAnimation('login.html')" class="btn btn-secondary">Login</a></li>
            <li><a href="#" onclick="navigateWithAnimation('register.html')" class="btn">Sign Up</a></li>
        `;
        // Remove avatar if user logs out
        const old = document.getElementById('avatar-3d-navbar');
        if (old) old.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    try {
        updateNavigation();
        if (typeof initPageTransitions === 'function') {
            initPageTransitions();
        }

        const path = window.location.pathname;

        if (path.includes('marketplace.html')) loadMarketplace();
        if (path.includes('profile.html')) loadProfile();
    } catch (e) {
        console.error('Error during supplementary DOMContentLoaded code:', e);
    }
});

// ================= PAGE TRANSITION & AUTH UI =================

window.navigateWithAnimation = function(url) {
    document.body.style.transition = "all 0.5s ease";
    document.body.style.opacity = 0;
    document.body.style.transform = "scale(1.05)";

    setTimeout(() => {
        window.location.href = url;
    }, 500);
}

// Global Click Interceptor for '.btn' and '.nav-btn'
document.addEventListener('click', (e) => {
    const target = e.target.closest('a.btn, a.nav-btn');
    if (target && target.href && !target.href.includes('javascript:') && !target.hasAttribute('onclick')) {
        const targetUrl = new URL(target.href, window.location.origin);
        if (targetUrl.origin === window.location.origin && targetUrl.pathname !== window.location.pathname) {
            e.preventDefault();
            window.navigateWithAnimation(target.href);
        }
    }
});

// Page Entry Animation
window.addEventListener("load", () => {
    document.body.style.opacity = 0;
    document.body.style.transform = "scale(1.05)";
    document.body.style.transition = "all 0.5s ease";

    setTimeout(() => {
        document.body.style.opacity = 1;
        document.body.style.transform = "scale(1)";
    }, 100);
});

// ================= CUSTOM MODAL SYSTEM =================
function createModalContainer() {
    let container = document.getElementById('custom-modal-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'custom-modal-container';
        document.body.appendChild(container);
    }
    return container;
}

window.closeCustomModal = function() {
    const container = document.getElementById('custom-modal-container');
    if (container) {
        container.classList.remove('custom-modal-active');
        setTimeout(() => { container.innerHTML = ''; }, 400);
    }
};

window.showSuccess = function(message, callback) {
    const container = createModalContainer();
    container.innerHTML = '<div class="custom-modal-box custom-modal-success">' +
        '<div class="custom-modal-icon">✔</div>' +
        '<div class="custom-modal-title">Success</div>' +
        '<div class="custom-modal-msg">' + message + '</div>' +
    '</div>';
    void container.offsetWidth;
    container.classList.add('custom-modal-active');
    setTimeout(() => {
        closeCustomModal();
        if (callback) callback();
    }, 1500);
};

window.showError = function(message) {
    const container = createModalContainer();
    container.innerHTML = '<div class="custom-modal-box custom-modal-error">' +
        '<div class="custom-modal-icon">✖</div>' +
        '<div class="custom-modal-title">Error</div>' +
        '<div class="custom-modal-msg">' + message + '</div>' +
        '<button class="custom-modal-btn custom-btn-secondary" onclick="closeCustomModal()">Close</button>' +
    '</div>';
    void container.offsetWidth;
    container.classList.add('custom-modal-active');
};

window.showInputModal = function(title, placeholder, onSubmit) {
    const container = createModalContainer();
    container.innerHTML = '<div class="custom-modal-box">' +
        '<div class="custom-modal-title">' + title + '</div>' +
        '<input type="text" id="custom-modal-input-field" class="custom-modal-input" placeholder="' + placeholder + '">' +
        '<div class="custom-modal-btn-group">' +
            '<button class="custom-modal-btn custom-btn-secondary" id="custom-modal-cancel">Cancel</button>' +
            '<button class="custom-modal-btn custom-btn-primary" id="custom-modal-submit">Submit</button>' +
        '</div>' +
    '</div>';
    void container.offsetWidth;
    container.classList.add('custom-modal-active');
    const inputField = document.getElementById('custom-modal-input-field');
    inputField.focus();
    document.getElementById('custom-modal-cancel').onclick = closeCustomModal;
    document.getElementById('custom-modal-submit').onclick = () => {
        const val = inputField.value.trim();
        if (val) {
            closeCustomModal();
            onSubmit(val);
        } else {
            inputField.style.borderColor = '#EF4444';
        }
    };
};

function showAuthSuccess(title, message, redirectUrl, delay = 1200) {
    const successHTML = `
        <div id="auth-success-overlay" class="auth-success-active">
            <div class="auth-success-box">
                <div class="checkmark-circle">
                    <div class="checkmark-path">✔</div>
                </div>
                <h2 style="color:var(--text-main); margin-bottom:10px;">${title}</h2>
                <p style="color:var(--secondary);">${message}</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', successHTML);
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, delay);
}


async function handleLogin(e) {
    if (e) {
        e.preventDefault();
    }
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });
        
        const data = await res.json();
        
        // Ensure robust status checking (data.success OR data.message)
        const isSuccess = data.status === 'success' || data.success === true || (data.message && data.message.toLowerCase().includes('success'));
        
        if (isSuccess) {
            currentUser = data;
            localStorage.setItem('crediskill_user', JSON.stringify(data));
            showSuccess("Login Successful", () => {
                setTimeout(() => {
                    window.location.href = "profile.html";
                }, 1200);
            });
        } else {
            showAlert('error', data.message || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        showAlert('error', 'Server connection error');
    }
}

async function handleRegister(e) {
    if (e) {
        e.preventDefault();
    }
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    const fileInput = document.getElementById('profile_image');
    let profileImageBase64 = "";
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        profileImageBase64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(role)}&profile_image=${encodeURIComponent(profileImageBase64)}`
        });
        
        const data = await res.json();
        
        // Ensure robust status checking (data.success OR data.message)
        const isSuccess = data.status === 'success' || data.success === true || (data.message && data.message.toLowerCase().includes('success'));
        
        if (isSuccess) {
            showSuccess('Registration Successful', () => {
                window.location.href = 'login.html';
            });
        } else {
            showAlert('error', data.message || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        showAlert('error', 'Server connection error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('crediskill_user');
    window.location.href = 'index.html';
}

// Marketplace Logic
async function loadMarketplace() {
    const grid = document.getElementById('skillGrid');
    if (!grid) return;
    
    try {
        const res = await fetch(`${API_BASE}/skills`);
        const skills = await res.json();
        renderSkills(skills);
        window.allSkills = skills; // For filtering
    } catch (err) {
        grid.innerHTML = '<p class="error">Failed to load marketplace data.</p>';
    }
}

function renderSkills(skillsData) {
    const grid = document.getElementById('skillGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (skillsData.length === 0) {
        grid.innerHTML = '<p class="text-muted">No skills match the criteria.</p>';
        return;
    }

    skillsData.forEach(skill => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${skill.title}</h3>
            <div class="author">Offered by ${skill.author_name}</div>
            <p class="description">${skill.description}</p>
            <div class="price" style="font-size: 1rem; color: var(--secondary);">Value: $${skill.price.toFixed(2)}</div>
            <div style="margin-bottom: 1rem; font-size: 0.9rem; color: var(--primary);">Credibility Score: ${skill.credibility_score ? skill.credibility_score.toFixed(1) : parseFloat(0).toFixed(1)}</div>
            <button onclick="purchaseSkill(${skill.skill_id}, ${skill.user_id})" class="btn" ${!currentUser ? 'disabled' : ''}>
                ${currentUser ? 'Purchase Service' : 'Login to Purchase'}
            </button>
        `;
        grid.appendChild(card);
    });
    
    // Apply cinematic GSAP stagger if possible
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(grid.querySelectorAll('.card'), 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
        );
    }
}

function applyFilters() {
    if(!window.allSkills) return;
    const sInput = document.getElementById('searchInput').value.toLowerCase();
    const pFilter = document.getElementById('priceFilter').value;
    
    // We only have basic text searching and a mock price filter for this MVP
    const filtered = window.allSkills.filter(s => {
        let matchSearch = s.title.toLowerCase().includes(sInput) || s.description.toLowerCase().includes(sInput);
        let matchPrice = true;
        if(pFilter === 'low') matchPrice = s.price < 50;
        if(pFilter === 'high') matchPrice = s.price >= 50;
        return matchSearch && matchPrice;
    });
    renderSkills(filtered);
}

// Jobs Logic
async function loadJobs() {
    const grid = document.getElementById('jobGrid');
    if (!grid) return;
    
    try {
        const res = await fetch(`${API_BASE}/jobs`);
        const jobs = await res.json();
        grid.innerHTML = '';
        if (jobs.length === 0) {
            grid.innerHTML = '<p class="text-muted">No active jobs found.</p>';
            return;
        }

        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${job.title}</h3>
                <div class="author">Posted by ${job.client_name}</div>
                <p class="description">${job.description}</p>
                <div class="price" style="font-size: 1rem; color: var(--secondary);">Budget: $${job.budget.toFixed(2)}</div>
                <button onclick="applyToJob(${job.job_id})" class="btn btn-secondary" ${!currentUser ? 'disabled' : ''}>
                    ${currentUser ? 'Apply Now' : 'Login to Apply'}
                </button>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        grid.innerHTML = '<p class="error">Failed to load jobs data.</p>';
    }
}

function switchMarketplaceTab(tabInfo) {
    if(tabInfo === 'skills') {
        document.getElementById('skillGrid').style.display = 'grid';
        document.getElementById('skillsFilters').style.display = 'flex';
        document.getElementById('jobGrid').style.display = 'none';
    } else {
        document.getElementById('skillGrid').style.display = 'none';
        document.getElementById('skillsFilters').style.display = 'none';
        document.getElementById('jobGrid').style.display = 'grid';
        loadJobs();
    }
}

async function applyToJob(jobId) {
    if(!currentUser) {
        showError("Please login first!");
        return;
    }
    showInputModal("Submit Proposal", "Enter your bid amount ($):", async (bidAmount) => {
        if(!bidAmount) return;

        try {
            const res = await fetch(`${API_BASE}/proposals`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `job_id=${jobId}&freelancer_id=${currentUser.user_id}&bid_amount=${encodeURIComponent(bidAmount)}`
            });
            const data = await res.json();
            if (data.status === 'success') {
                showSuccess('Proposal Submitted successfully!');
            } else {
                showError('Failed to submit proposal.');
            }
        } catch (err) {
            showError('Server connection error');
        }
    });
}

// Add Skill
async function handleAddSkill(e) {
    e.preventDefault();
    if (!currentUser) return;
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const proofUrlNode = document.getElementById('proofUrl');
    const proofUrl = proofUrlNode ? proofUrlNode.value : '';
    
    try {
        const res = await fetch(`${API_BASE}/skills`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `user_id=${currentUser.user_id}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&price=${encodeURIComponent(price)}&proof_url=${encodeURIComponent(proofUrl)}`
        });
        
        const data = await res.json();
        if (data.status === 'success') {
            window.location.href = 'marketplace.html';
        } else {
            showAlert('error', 'Failed to add skill');
        }
    } catch (err) {
        showAlert('error', 'Server connection error');
    }
}

// Profile Logic
function switchDashTab(tab) {
    if(tab === 'client') {
        document.getElementById('freelancerDash').style.display = 'none';
        document.getElementById('clientDash').style.display = 'block';
    } else {
        document.getElementById('freelancerDash').style.display = 'block';
        document.getElementById('clientDash').style.display = 'none';
        renderChart(); // Redraw chart if needed
    }
}

let profileScoreData = 0;

async function loadProfile() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const cskNode = document.getElementById('profileUserCode');
    if(cskNode && currentUser.user_code) cskNode.textContent = currentUser.user_code;

    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileRole').textContent = currentUser.role;



    // Render Verification Badges if properties exist
    const vContainer = document.getElementById('verificationBadges');
    if(vContainer) {
        vContainer.innerHTML = '';
        if(currentUser.email_verified) vContainer.innerHTML += `<span class="badge-verified">✅ Email</span> `;
        if(currentUser.phone_verified) vContainer.innerHTML += `<span class="badge-verified">📱 Phone</span> `;
        if(currentUser.id_verified) vContainer.innerHTML += `<span class="badge-verified">🪪 ID</span>`;
    }

    // Default Tab visibility based on role
    if(currentUser.role === 'CLIENT') {
        switchDashTab('client');
        document.getElementById('tabFreelancerDash').style.display = 'none';
    } else if(currentUser.role === 'FREELANCER') {
        switchDashTab('freelancer');
        document.getElementById('tabClientDash').style.display = 'none';
    }

    // Fetch Score
    try {
        const res = await fetch(`${API_BASE}/credibility?user_id=${currentUser.user_id}`);
        if(res.ok) {
            const data = await res.json();
            profileScoreData = data.score;
            document.getElementById('profileScoreNum').textContent = data.score.toFixed(1);
            document.getElementById('profileTotalOrders').textContent = data.total_completed;
            document.getElementById('profileRating').textContent = data.average_rating.toFixed(1) + ' / 5.0';
        }
    } catch (e) {
        console.error("Could not fetch score", e);
    }
    
    renderChart();
    loadFreelancerOrders();
    loadClientOrders();
    
    // Apply cinematic Dashboard entry stagger
    if (typeof gsap !== 'undefined') {
        gsap.fromTo([".tabs", ".glass-panel"], 
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out", delay: 0.4 }
        );
    }
}

function renderChart() {
    const ctx = document.getElementById('credibilityChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Start', '1st Order', '3rd Order', 'Now'],
            datasets: [{
                label: 'Credibility Score',
                data: [0, profileScoreData/3, profileScoreData/1.5, profileScoreData],
                borderColor: '#9d4edd',
                backgroundColor: 'rgba(157, 78, 221, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

async function loadFreelancerOrders() {
    const grid = document.getElementById('freelancerOrdersGrid');
    if (!grid) return;
    try {
        const res = await fetch(`${API_BASE}/orders?user_id=${currentUser.user_id}&role=FREELANCER`);
        const orders = await res.json();
        grid.innerHTML = '';
        if(orders.length === 0) grid.innerHTML = '<p class="text-muted">No active orders found.</p>';
        orders.forEach(o => {
            const el = document.createElement('div');
            el.style = "padding: 0.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;";
            
            let actionBtn = "";
            if (o.status === 'PENDING') {
                actionBtn = `<button class="btn btn-secondary" onclick="updateOrderStatus(${o.order_id}, 'accept')">Accept Work</button>`;
            } else if (o.status === 'IN_PROGRESS') {
                actionBtn = `<button class="btn" style="background:#10B981;" onclick="updateOrderStatus(${o.order_id}, 'complete')">Mark Complete</button>`;
            } else {
                actionBtn = `<span class="text-muted">${o.status}</span>`;
            }

            el.innerHTML = `
                <div><strong>${o.title}</strong> <br> <small>Value: $${o.price}</small></div>
                <div>${actionBtn}</div>
            `;
            grid.appendChild(el);
        });
    } catch(e) {}
}

async function loadClientOrders() {
    const grid = document.getElementById('clientOrdersGrid');
    if (!grid) return;
    try {
        const res = await fetch(`${API_BASE}/orders?user_id=${currentUser.user_id}&role=CLIENT`);
        const orders = await res.json();
        grid.innerHTML = '';
        if(orders.length === 0) grid.innerHTML = '<p class="text-muted">No orders placed yet.</p>';
        orders.forEach(o => {
            const el = document.createElement('div');
            el.style = "padding: 0.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;";
            
            let actionBtn = "";
            if (o.status === 'COMPLETED') {
                actionBtn = `<button class="btn" style="background:#9d4edd;" onclick="reviewOrder(${o.order_id}, ${o.skill_id}, ${o.freelancer_id})">Leave Review</button>`;
            } else {
                actionBtn = `<span class="text-muted">${o.status}</span>`;
            }

            el.innerHTML = `
                <div><strong>${o.title}</strong> <br> <small>Value: $${o.price}</small></div>
                <div>${actionBtn}</div>
            `;
            grid.appendChild(el);
        });
    } catch(e) {}
}

async function updateOrderStatus(orderId, action) {
    try {
        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=${action}&order_id=${orderId}`
        });
        if (res.ok) {
            showSuccess('Order Status Updated', () => loadFreelancerOrders());
        }
    } catch(e) {}
}

async function reviewOrder(orderId, skillId, freelancerId) {
    showInputModal("Submit Review", "Rate the freelancer out of 5:", async (ratingStr) => {
        if(!ratingStr) return;
        const rating = parseInt(ratingStr);
    
    try {
        const res = await fetch(`${API_BASE}/reviews`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `order_id=${orderId}&reviewer_id=${currentUser.user_id}&reviewee_id=${freelancerId}&skill_id=${skillId}&rating=${rating}`
        });
        if (res.ok) {
            showSuccess('Review Submitted Successfully! Their Credibility grew.', () => loadClientOrders());
        }
    } catch(e) {}
    });
}

async function postJob() {
    if(!currentUser) return;
    const title = document.getElementById('jobTitle').value;
    const budget = document.getElementById('jobBudget').value;
    if(!title || !budget) {
        showError("Please fill all fields");
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/jobs`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `client_id=${currentUser.user_id}&title=${encodeURIComponent(title)}&budget=${encodeURIComponent(budget)}`
        });
        if (res.ok) {
            showSuccess('Job Posted Successfully');
            document.getElementById('jobTitle').value = '';
            document.getElementById('jobBudget').value = '';
        }
    } catch(e) {}
}

async function purchaseSkill(skillId, freelancerId) {
    if(!currentUser) {
        showError("Please login first!");
        return;
    }
    if(currentUser.user_id === freelancerId) {
        showError("You cannot purchase your own skill!");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `client_id=${currentUser.user_id}&skill_id=${skillId}&freelancer_id=${freelancerId}`
        });
        
        const data = await res.json();
        if (data.status === 'success') {
            showSuccess('Service Purchased Successfully! Complete and then rate the freelancer.');
        } else {
            showError('Failed to purchase service.');
        }
    } catch (err) {
        showError('Internal server error.');
    }
}

function showAlert(type, message) {
    if (type === 'success' || type === 'info') {
        showSuccess(message);
    } else {
        showError(message);
    }
}

/* ======================================= */
/*          ADMIN DASHBOARD LOGIC          */
/* ======================================= */

let adminToken = false;
let allAdminUsers = [];
let userGrowthChart, freelancerProgressChart, platformActivityChart;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        const adForm = document.getElementById('adminLoginForm');
        if(adForm) {
            adForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const em = document.getElementById('adminEmail').value;
                const pw = document.getElementById('adminPassword').value;
                const sk = document.getElementById('adminSecretKey').value;
                
                try {
                    const res = await fetch(`${API_BASE}/admin/login`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        body: `email=${encodeURIComponent(em)}&password=${encodeURIComponent(pw)}&secret_key=${encodeURIComponent(sk)}`
                    });
                    if(res.ok) {
                        adminToken = true;
                        document.getElementById('admin-login-overlay').style.display = 'none';
                        document.getElementById('admin-dashboard').style.display = 'block';
                        document.getElementById('adminLogoutBtn').style.display = 'inline-block';
                        loadAdminDashboard();
                    } else {
                        showError("Invalid Admin Credentials or Secret Key");
                    }
                } catch(err) {
                    showError("Server error connecting to Admin API");
                }
            });
        }
        
        const annForm = document.getElementById('announcementForm');
        if(annForm) {
            annForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const msg = document.getElementById('announcementMessage').value;
                try {
                    await fetch(`${API_BASE}/admin/announcements`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        body: `message=${encodeURIComponent(msg)}`
                    });
                    document.getElementById('announcementMessage').value = '';
                    showSuccess("Announcement Broadcasted!");
                    loadAnnouncements();
                } catch(err) {}
            });
        }
    }
});

function logoutAdmin() {
    adminToken = false;
    window.location.reload();
}

async function loadAdminDashboard() {
    // Stats
    try {
        const res = await fetch(`${API_BASE}/admin/stats`);
        if(res.ok) {
            const data = await res.json();
            document.getElementById('stat-users').textContent = data.total_users;
            document.getElementById('stat-clients').textContent = data.total_clients;
            document.getElementById('stat-freelancers').textContent = data.total_freelancers;
            document.getElementById('stat-orders').textContent = data.total_orders;
            document.getElementById('stat-jobs').textContent = data.active_jobs;
            document.getElementById('stat-health').textContent = data.platform_health.toFixed(1) + '%';
        }
    } catch(e) {}

    // Analytics (Chart.js)
    try {
        const res = await fetch(`${API_BASE}/admin/analytics`);
        if(res.ok) {
            const data = await res.json();
            renderCharts(data);
            
            const list = document.getElementById('topPerformersList');
            list.innerHTML = '';
            data.top_performers.forEach(p => {
                list.innerHTML += `<li><span>${p.name}</span> <span style="color:var(--secondary)">Score: ${p.score}</span></li>`;
            });
        }
    } catch(e) {}

    // Users
    fetchAdminUsers();
    
    // Timeline
    loadAnnouncements();
}

function renderCharts(data) {
    if(userGrowthChart) userGrowthChart.destroy();
    if(freelancerProgressChart) freelancerProgressChart.destroy();
    if(platformActivityChart) platformActivityChart.destroy();

    const ctx1 = document.getElementById('userGrowthChart');
    if(ctx1) userGrowthChart = new Chart(ctx1, {
        type: 'line',
        data: { labels: ['Jan','Feb','Mar','Apr','May'], datasets: [{ label: 'Users', data: data.user_growth, borderColor: '#00ffcc', tension: 0.3 }] }
    });

    const ctx2 = document.getElementById('freelancerProgressChart');
    if(ctx2) freelancerProgressChart = new Chart(ctx2, {
        type: 'bar',
        data: { labels: ['Jan','Feb','Mar','Apr','May'], datasets: [{ label: 'Completed Orders', data: data.freelancer_progress, backgroundColor: '#9d4edd' }] }
    });

    const ctx3 = document.getElementById('platformActivityChart');
    if(ctx3) platformActivityChart = new Chart(ctx3, {
        type: 'line',
        data: { labels: ['Mon','Tue','Wed','Thu','Fri'], datasets: [{ label: 'Daily Orders', data: data.platform_activity, borderColor: '#F4F4F5', borderDash: [5, 5] }] }
    });
}

function exportAdminData(type) {
    window.open(`${API_BASE}/admin/export/${type}`, '_blank');
}

async function fetchAdminUsers() {
    try {
        const res = await fetch(`${API_BASE}/admin/users`);
        if(res.ok) {
            allAdminUsers = await res.json();
            filterAdminUsers();
        }
    } catch(e) {}
}

function filterAdminUsers() {
    const sInput = document.getElementById('adminSearchUser').value.toLowerCase();
    const rFilter = document.getElementById('adminRoleFilter').value;
    
    const filtered = allAdminUsers.filter(u => {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const userCode = (u.user_code || "").toLowerCase();
        
        let matchS = name.includes(sInput) || email.includes(sInput) || userCode.includes(sInput);
        let matchR = (rFilter === 'ALL' || u.role === rFilter || u.role === 'BOTH');
        return matchS && matchR;
    });
    
    const tbody = document.getElementById('adminUsersBody');
    tbody.innerHTML = '';
    filtered.forEach(u => {
        const vBadges = [];
        if(u.email_verified) vBadges.push('Email');
        if(u.phone_verified) vBadges.push('Phone');
        if(u.id_verified) vBadges.push('ID');
        const vStr = vBadges.length > 0 ? `<span class="badge-verified">${vBadges.join(', ')}</span>` : '<span class="text-muted">None</span>';
        
        let statusStr = u.is_suspended ? `<span style="color:#EF4444">Suspended</span>` : `<span style="color:#10B981">Active</span>`;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.user_code}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${vStr}</td>
            <td>${statusStr}</td>
            <td><button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem" onclick='showAdminUserModal(${JSON.stringify(u)})'>Manage</button></td>
        `;
        tbody.appendChild(tr);
    });
}

let activeModalUser = null;
function showAdminUserModal(userStr) {
    let u = userStr;
    if(typeof userStr === 'string') u = JSON.parse(userStr);
    activeModalUser = u;
    document.getElementById('modalUserName').textContent = u.name;
    document.getElementById('modalUserId').textContent = u.user_code;
    document.getElementById('modalUserEmail').textContent = u.email;
    document.getElementById('modalUserRole').textContent = u.role;
    
    const sb = document.getElementById('modalSuspendBtn');
    if(u.is_suspended) {
        sb.textContent = "Unsuspend User";
        sb.className = "btn btn-action";
    } else {
        sb.textContent = "Suspend User";
        sb.className = "btn btn-warning";
    }
    
    document.getElementById('adminUserModal').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('adminUserModal').style.display = 'none';
    activeModalUser = null;
}

async function callAdminUserAction(action) {
    if(!activeModalUser) return;
    try {
        const res = await fetch(`${API_BASE}/admin/users`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `user_id=${activeModalUser.user_id}&action=${action}`
        });
        if(res.ok) {
            showSuccess('Action successful.');
            closeAdminModal();
            fetchAdminUsers();
        }
    } catch(e) {}
}

function toggleUserSuspend() {
    if(activeModalUser.is_suspended) callAdminUserAction('unsuspend');
    else callAdminUserAction('suspend');
}

function verifyUser(type) {
    callAdminUserAction(type);
}

async function loadAnnouncements() {
    try {
        const res = await fetch(`${API_BASE}/admin/announcements`);
        if(res.ok) {
            const data = await res.json();
            const tl = document.getElementById('adminTimeline');
            if(tl) {
                tl.innerHTML = '';
                data.forEach(a => {
                    tl.innerHTML += `<div class="timeline-item"><span class="time">${a.created_at}</span><p>${a.message}</p></div>`;
                });
            }
        }
    } catch(e) {}
}

/* ======================================= */
/*       HIDDEN ADMIN AVATAR SYSTEM        */
/* ======================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Only inject if not already there and not currently on admin page
    if (!document.getElementById('secret-admin-avatar') && !window.location.pathname.includes('admin.html')) {
        const avatarHTML = `
            <div id="secret-admin-avatar" title="Freelancer System Agent">
                <div id="avatar3D" style="width: 100%; height: 100%;"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', avatarHTML);
    }
    
    // Check if the element exists finally before initializing
    if (document.getElementById('secret-admin-avatar')) {
        initSecretSequence();
        init3DAvatar();
    }
});

let sequence = {
    clicks: 0,
    hoverTimer: null,
    isHoveringEnough: false,
    resetTimer: null
};

function resetSequence() {
    sequence.clicks = 0;
    sequence.isHoveringEnough = false;
    if(sequence.hoverTimer) clearTimeout(sequence.hoverTimer);
    if(sequence.resetTimer) clearTimeout(sequence.resetTimer);
    sequence.hoverTimer = null;
    sequence.resetTimer = null;
}

function initSecretSequence() {
    const avatar = document.getElementById('secret-admin-avatar');
    if(!avatar) return;

    avatar.addEventListener('click', () => {
        sequence.clicks++;
        if (sequence.resetTimer) clearTimeout(sequence.resetTimer);
        // Reset sequence if not completed within 10 seconds
        sequence.resetTimer = setTimeout(resetSequence, 10000);
    });

    avatar.addEventListener('mouseenter', () => {
        if (sequence.clicks >= 3) {
            sequence.hoverTimer = setTimeout(() => {
                sequence.isHoveringEnough = true;
            }, 2000);
        }
    });

    avatar.addEventListener('mouseleave', () => {
        if (sequence.hoverTimer) clearTimeout(sequence.hoverTimer);
        sequence.isHoveringEnough = false;
    });

    window.addEventListener('keydown', (e) => {
        if (e.key && e.key.toLowerCase() === 'a') {
            if (sequence.clicks >= 3 && sequence.isHoveringEnough) {
                // Prevent accidental triggers
                sequence.clicks = 0;
                sequence.isHoveringEnough = false;
                
                showInputModal("Admin Gateway", "Enter Admin PIN", (pin) => {
                    if (pin === 'CSK_ADMIN_2026') {
                        window.location.href = 'admin.html';
                    } else if (pin !== null && pin !== '') {
                        showError('Invalid PIN');
                    }
                    resetSequence();
                });
            }
        }
    });
}

/* ================================================ */
/*   NAVBAR 3D AVATAR — #avatar-3d-navbar (140px)   */
/* ================================================ */

/**
 * Renders a freestyle 3D GLB avatar inside #avatar-3d-navbar.
 * — 140 × 140 transparent canvas, absolutely positioned in nav
 * — Camera: position(0, 1, 2.2) → lookAt(0, 1, 0)
 * — Model: scale(1.3, 1.3, 1.3), auto-rotate 0.006 rad/frame
 * — OrbitControls: rotate on drag/scroll, no pan, distance 1.5–3
 * — Click: forwards admin-gateway sequence + profile navigation
 */
function initNavbarAvatar3D() {
    const container = document.getElementById('avatar-3d-navbar');
    if (!container) return;
    if (container.dataset.avatarInit) return; // prevent double-init
    container.dataset.avatarInit = 'true';

    if (typeof THREE === 'undefined') {
        console.warn('[NavAvatar] THREE not loaded');
        return;
    }

    const SIZE = 140;
    const fallback = container.querySelector('.avatar-3d-fallback');

    // ── Scene ────────────────────────────────────────
    const scene = new THREE.Scene();

    // ── Camera — positioned after model loads (auto-fit) ──
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 3.5); // will be overridden after GLB loads
    camera.lookAt(0, 0, 0);

    // ── Renderer ─────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = 'block';
    if (fallback) fallback.style.display = 'none';
    container.appendChild(renderer.domElement);

    // ── Lighting ─────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    // Front-top key light (soft blue-white)
    const keyLight = new THREE.DirectionalLight(0xaaddff, 2.8);
    keyLight.position.set(0.5, 3, 3);
    scene.add(keyLight);

    // Neon purple fill
    const fillLight = new THREE.DirectionalLight(0x9d4edd, 2.2);
    fillLight.position.set(-2, 0, 2);
    scene.add(fillLight);

    // Cyan rim from behind-below
    const rimLight = new THREE.DirectionalLight(0x00ffcc, 1.8);
    rimLight.position.set(0, -2, -3);
    scene.add(rimLight);

    // ── OrbitControls ────────────────────────────────
    let controls = null;
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.minDistance = 2;
        controls.maxDistance = 6;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        // Allow full vertical arc but favour portrait
        controls.minPolarAngle = Math.PI * 0.1;
        controls.maxPolarAngle = Math.PI * 0.85;
    } else {
        console.info('[NavAvatar] OrbitControls not available — drag interaction skipped');
    }

    // ── Load GLB ─────────────────────────────────────
    // Load from Java HTTP server (serves frontend/ as static files)
    // Falls back to embedded base64 data URL if not running via server
    const isServed = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    const glbSrc = isServed
        ? 'models/avatar.glb'                   // served via http://localhost:8080/
        : (window.AVATAR_GLB_DATA_URL || 'models/avatar.glb'); // file:// fallback
    let model = null;
    let modelBaseY = 0;
    let autoRotate = true; // paused while user drags

    const loader = new THREE.GLTFLoader();
    loader.load(
        glbSrc,
        (gltf) => {
            model = gltf.scene;

            // Auto-center: move model so its bounding center is at origin
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center); // perfectly centered
            modelBaseY = 0;

            // Moderate scale — not too big for the 140px container
            model.scale.set(0.9, 0.9, 0.9);

            // Auto-fit camera: push back so the full model fits in view
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) * 0.9;
            const fovRad = camera.fov * (Math.PI / 180);
            const fitDist = (maxDim / 2) / Math.tan(fovRad / 2);
            camera.position.set(0, 0, fitDist * 1.15); // 15% breathing room
            camera.lookAt(0, 0, 0);
            if (controls) controls.update();

            // Neon emissive boost on cyan/purple parts
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    const c = child.material.color;
                    if (c) {
                        if (c.r < 0.3 && c.g > 0.6 && c.b > 0.6) {
                            child.material.emissive = new THREE.Color(0x00ffcc);
                            child.material.emissiveIntensity = 0.55;
                        }
                        if (c.r > 0.4 && c.g < 0.3 && c.b > 0.6) {
                            child.material.emissive = new THREE.Color(0x9d4edd);
                            child.material.emissiveIntensity = 0.45;
                        }
                    }
                    child.material.needsUpdate = true;
                }
            });
            scene.add(model);
            if (fallback) fallback.style.display = 'none';
        },
        undefined,
        (err) => {
            console.warn('[NavAvatar] GLB failed → letter fallback', err);
            if (fallback) { fallback.style.display = 'flex'; }
            // Stylish neon sphere as geometric fallback
            const geo = new THREE.SphereGeometry(0.55, 24, 16);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x00ffcc, emissive: 0x00ffcc,
                emissiveIntensity: 0.7, metalness: 0.9, roughness: 0.15
            });
            model = new THREE.Mesh(geo, mat);
            scene.add(model);
        }
    );

    // ── ADMIN GATEWAY — Strict 3-Step Sequence ────────
    // Step 1: Click avatar exactly 3 times
    // Step 2: Hover for 2 seconds (must already have 3 clicks)
    // Step 3: Press 'A' key while hovering
    // All within 5-second window
    let seq = { clicks: 0, hovering: false, hoverReady: false, hoverTimer: null, resetTimer: null };

    function seqReset() {
        seq.clicks = 0;
        seq.hovering = false;
        seq.hoverReady = false;
        clearTimeout(seq.hoverTimer);
        clearTimeout(seq.resetTimer);
        seq.hoverTimer = null;
        seq.resetTimer = null;
    }

    container.addEventListener('click', (e) => {
        // Only count clicks — NEVER navigate on click
        seq.clicks++;
        clearTimeout(seq.resetTimer);
        seq.resetTimer = setTimeout(seqReset, 5000); // reset after 5s
    });

    container.addEventListener('mouseenter', () => {
        seq.hovering = true;
        if (seq.clicks >= 3) {
            seq.hoverTimer = setTimeout(() => {
                seq.hoverReady = true;
            }, 2000); // 2 seconds hover required
        }
    });

    container.addEventListener('mouseleave', () => {
        seq.hovering = false;
        seq.hoverReady = false;
        clearTimeout(seq.hoverTimer);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key && e.key.toLowerCase() === 'a') {
            if (seq.clicks >= 3 && seq.hoverReady && seq.hovering) {
                // ✅ Sequence complete — show admin PIN modal
                seqReset();
                if (typeof showInputModal === 'function') {
                    showInputModal('Admin Gateway', 'Enter Admin PIN', (pin) => {
                        if (pin === 'CSK_ADMIN_2026') {
                            window.location.href = 'admin.html';
                        } else if (pin !== null && pin !== '') {
                            if (typeof showError === 'function') showError('Invalid PIN');
                        }
                    });
                }
            }
        }
    });

    // ── Render loop ───────────────────────────────────
    const clock = new THREE.Clock();
    function navAvatarLoop() {
        requestAnimationFrame(navAvatarLoop);
        const t = clock.getElapsedTime();
        if (model && autoRotate) {
            model.rotation.y += 0.006; // exact spec
        }
        if (controls) controls.update();
        renderer.render(scene, camera);
    }
    navAvatarLoop();
}


/* ================================================ */
/*   HIDDEN ADMIN OVERLAY AVATAR — #secret-admin-avatar */
/* ================================================ */

function init3DAvatar() {
    const container = document.getElementById('avatar3D');
    if (!container) return;
    if (typeof THREE === 'undefined' || !THREE.GLTFLoader) return;

    // Keep the overlay compact — it's hidden / used only for click-sequence detection
    const wrapper = document.getElementById('secret-admin-avatar');
    if (wrapper) {
        wrapper.style.width = '0px';
        wrapper.style.height = '0px';
        wrapper.style.overflow = 'hidden';
        wrapper.style.position = 'fixed';
        wrapper.style.bottom = '0';
        wrapper.style.right = '0';
        wrapper.style.zIndex = '-1';
        wrapper.style.pointerEvents = 'none';
    }
}

