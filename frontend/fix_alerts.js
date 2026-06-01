const fs = require('fs');

const path = 'c:\\Users\\AASISH LEBAKA\\OneDrive\\Desktop\\Crediskill\\CrediSkill_Project\\frontend\\script.js';
let content = fs.readFileSync(path, 'utf8');

const customModalSystem = 
"// ================= CUSTOM MODAL SYSTEM =================\n" +
"function createModalContainer() {\n" +
"    let container = document.getElementById('custom-modal-container');\n" +
"    if (!container) {\n" +
"        container = document.createElement('div');\n" +
"        container.id = 'custom-modal-container';\n" +
"        document.body.appendChild(container);\n" +
"    }\n" +
"    return container;\n" +
"}\n\n" +
"window.closeCustomModal = function() {\n" +
"    const container = document.getElementById('custom-modal-container');\n" +
"    if (container) {\n" +
"        container.classList.remove('custom-modal-active');\n" +
"        setTimeout(() => { container.innerHTML = ''; }, 400);\n" +
"    }\n" +
"};\n\n" +
"window.showSuccess = function(message, callback) {\n" +
"    const container = createModalContainer();\n" +
"    container.innerHTML = '<div class=\"custom-modal-box custom-modal-success\">' +\n" +
"        '<div class=\"custom-modal-icon\">✔</div>' +\n" +
"        '<div class=\"custom-modal-title\">Success</div>' +\n" +
"        '<div class=\"custom-modal-msg\">' + message + '</div>' +\n" +
"    '</div>';\n" +
"    void container.offsetWidth;\n" +
"    container.classList.add('custom-modal-active');\n" +
"    setTimeout(() => {\n" +
"        closeCustomModal();\n" +
"        if (callback) callback();\n" +
"    }, 1500);\n" +
"};\n\n" +
"window.showError = function(message) {\n" +
"    const container = createModalContainer();\n" +
"    container.innerHTML = '<div class=\"custom-modal-box custom-modal-error\">' +\n" +
"        '<div class=\"custom-modal-icon\">✖</div>' +\n" +
"        '<div class=\"custom-modal-title\">Error</div>' +\n" +
"        '<div class=\"custom-modal-msg\">' + message + '</div>' +\n" +
"        '<button class=\"custom-modal-btn custom-btn-secondary\" onclick=\"closeCustomModal()\">Close</button>' +\n" +
"    '</div>';\n" +
"    void container.offsetWidth;\n" +
"    container.classList.add('custom-modal-active');\n" +
"};\n\n" +
"window.showInputModal = function(title, placeholder, onSubmit) {\n" +
"    const container = createModalContainer();\n" +
"    container.innerHTML = '<div class=\"custom-modal-box\">' +\n" +
"        '<div class=\"custom-modal-title\">' + title + '</div>' +\n" +
"        '<input type=\"text\" id=\"custom-modal-input-field\" class=\"custom-modal-input\" placeholder=\"' + placeholder + '\">' +\n" +
"        '<div class=\"custom-modal-btn-group\">' +\n" +
"            '<button class=\"custom-modal-btn custom-btn-secondary\" id=\"custom-modal-cancel\">Cancel</button>' +\n" +
"            '<button class=\"custom-modal-btn custom-btn-primary\" id=\"custom-modal-submit\">Submit</button>' +\n" +
"        '</div>' +\n" +
"    '</div>';\n" +
"    void container.offsetWidth;\n" +
"    container.classList.add('custom-modal-active');\n" +
"    const inputField = document.getElementById('custom-modal-input-field');\n" +
"    inputField.focus();\n" +
"    document.getElementById('custom-modal-cancel').onclick = closeCustomModal;\n" +
"    document.getElementById('custom-modal-submit').onclick = () => {\n" +
"        const val = inputField.value.trim();\n" +
"        if (val) {\n" +
"            closeCustomModal();\n" +
"            onSubmit(val);\n" +
"        } else {\n" +
"            inputField.style.borderColor = '#EF4444';\n" +
"        }\n" +
"    };\n" +
"};\n\n";

if (!content.includes('function createModalContainer')) {
    content = content.replace('function showAuthSuccess', customModalSystem + 'function showAuthSuccess');
}

// Replace showAlert
content = content.replace(/function showAlert\(type, message\) {[\s\S]*?^}/m,
"function showAlert(type, message) {\n" +
"    if (type === 'success' || type === 'info') {\n" +
"        showSuccess(message);\n" +
"    } else {\n" +
"        showError(message);\n" +
"    }\n" +
"}");

// Simple alerts
content = content.replace(/alert\("Please login first!"\);/g, 'showError("Please login first!");');
content = content.replace(/alert\("You cannot purchase your own skill!"\);/g, 'showError("You cannot purchase your own skill!");');
content = content.replace(/alert\('Internal server error\.'\);/g, "showError('Internal server error.');");
content = content.replace(/alert\('Failed to purchase service\.'\);/g, "showError('Failed to purchase service.');");
content = content.replace(/alert\("Please fill all fields"\);/g, 'showError("Please fill all fields");');
content = content.replace(/alert\('Server connection error'\);/g, "showError('Server connection error');");
content = content.replace(/alert\('Failed to submit proposal\.'\);/g, "showError('Failed to submit proposal.');");
content = content.replace(/alert\("Invalid Admin Credentials or Secret Key"\);/g, 'showError("Invalid Admin Credentials or Secret Key");');
content = content.replace(/alert\("Server error connecting to Admin API"\);/g, 'showError("Server error connecting to Admin API");');
content = content.replace(/alert\("Invalid PIN"\);/g, 'showError("Invalid PIN");');
content = content.replace(/alert\('Action successful\.'\);/g, "showSuccess('Action successful.');");

// Alert with redirect logic
content = content.replace(/alert\('Registration Successful'\);\s*window\.location\.href\s*=\s*'login\.html';/g,
"showSuccess('Registration Successful', () => {\n" +
"                window.location.href = 'login.html';\n" +
"            });");

// Success callbacks
content = content.replace(/alert\('Proposal Submitted successfully!'\);/g, "showSuccess('Proposal Submitted successfully!');");
content = content.replace(/alert\('Order Status Updated'\);\s*loadFreelancerOrders\(\);/g, "showSuccess('Order Status Updated', () => loadFreelancerOrders());");
content = content.replace(/alert\('Review Submitted Successfully! Their Credibility grew\.'\);\s*loadClientOrders\(\);/g, "showSuccess('Review Submitted Successfully! Their Credibility grew.', () => loadClientOrders());");
content = content.replace(/alert\('Job Posted Successfully'\);/g, "showSuccess('Job Posted Successfully');");
content = content.replace(/alert\('Service Purchased Successfully! Complete and then rate the freelancer\.'\);/g, "showSuccess('Service Purchased Successfully! Complete and then rate the freelancer.');");
content = content.replace(/alert\("Announcement Broadcasted!"\);/g, 'showSuccess("Announcement Broadcasted!");');

// applyToJob prompt
content = content.replace(/const bidAmount = prompt\("Enter your bid amount \(\\\$\):"\);\s*if\(!bidAmount\) return;/g,
"showInputModal(\"Submit Proposal\", \"Enter your bid amount ($):\", async (bidAmount) => {\n" +
"        if(!bidAmount) return;");

// find corresponding catch block for applyToJob
content = content.replace(/showError\('Server connection error'\);\s*}\s*}/, "showError('Server connection error');\n        }\n    });\n}");

// reviewOrder prompt
content = content.replace(/const ratingStr = prompt\("Rate the freelancer out of 5:"\);\s*if\(!ratingStr\) return;\s*const rating = parseInt\(ratingStr\);/g,
"showInputModal(\"Submit Review\", \"Rate the freelancer out of 5:\", async (ratingStr) => {\n" +
"        if(!ratingStr) return;\n" +
"        const rating = parseInt(ratingStr);");

// find corresponding catch block for reviewOrder
content = content.replace(/showSuccess\('Review Submitted Successfully! Their Credibility grew\.', \(\) => loadClientOrders\(\)\);\s*}\s*} catch\(e\) {}\s*}/,
"showSuccess('Review Submitted Successfully! Their Credibility grew.', () => loadClientOrders());\n        }\n    } catch(e) {}\n    });\n}");

// Admin pin prompt
content = content.replace(/const pin = prompt\("Enter Admin PIN"\);\s*if \(pin === 'CSK_ADMIN_2026'\) {\s*window\.location\.href = 'admin\.html';\s*} else if \(pin !== null && pin !== ""\) {\s*showError\("Invalid PIN"\);\s*}\s*resetSequence\(\);/g,
"showInputModal(\"Admin Gateway\", \"Enter Admin PIN\", (pin) => {\n" +
"                    if (pin === 'CSK_ADMIN_2026') {\n" +
"                        window.location.href = 'admin.html';\n" +
"                    } else if (pin !== null && pin !== '') {\n" +
"                        showError('Invalid PIN');\n" +
"                    }\n" +
"                    resetSequence();\n" +
"                });");

fs.writeFileSync(path, content, 'utf8');

console.log('Script updated successfully.');
