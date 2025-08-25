// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const mobileOverlay = document.getElementById('mobileOverlay');
const sidebar = document.getElementById('sidebar');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const applicationsList = document.getElementById('applicationsList');
const jobForm = document.getElementById('jobForm');
const cancelAdd = document.getElementById('cancelAdd');
const addNewJob = document.getElementById('addNewJob');
const backToDashboard = document.getElementById('backToDashboard');
const editJob = document.getElementById('editJob');
const deleteJob = document.getElementById('deleteJob');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const saveProfileBtn = document.getElementById('saveProfile');
const exportDataBtn = document.getElementById('exportData');
const importDataBtn = document.getElementById('importData');
const uploadAvatarBtn = document.getElementById('uploadAvatar');
const themeOptions = document.querySelectorAll('.theme-option');

// Chart instances
let monthlyChart, statusChart;

// State management
let applications = JSON.parse(localStorage.getItem('careerPulseApplications')) || [];
let currentViewId = null;
let isEditing = false;

// Resource data
const resources = {
    pakistan: [
        {
            name: "Rozee.pk",
            description: "Pakistan's leading job portal with thousands of opportunities across all industries.",
            region: "Pakistan",
            url: "https://www.rozee.pk"
        },
        {
            name: "Mustakbil",
            description: "One of the oldest job portals in Pakistan with diverse job listings.",
            region: "Pakistan",
            url: "https://www.mustakbil.com"
        },
        {
            name: "LinkedIn Jobs (PK)",
            description: "Filter LinkedIn jobs for Pakistan-specific opportunities.",
            region: "Pakistan",
            url: "https://www.linkedin.com/jobs"
        },
        {
            name: "10Pearls Careers",
            description: "Career opportunities at 10Pearls, a leading software development company.",
            region: "Pakistan",
            url: "https://10pearls.com/careers/"
        },
        {
            name: "Systems Limited",
            description: "Career opportunities at Systems Limited, a leading IT company in Pakistan.",
            region: "Pakistan",
            url: "https://www.systemsltd.com/careers"
        },
        {
            name: "Pakistani CV Format",
            description: "Guide to creating a CV that works best in the Pakistani job market.",
            region: "Pakistan",
            url: "https://www.example.com/pakistani-cv-format"
        }
    ],
    international: [
        {
            name: "LinkedIn Jobs",
            description: "Global job search with opportunities from companies worldwide.",
            region: "Global",
            url: "https://www.linkedin.com/jobs"
        },
        {
            name: "Indeed",
            description: "One of the world's largest job sites with millions of listings.",
            region: "Global",
            url: "https://www.indeed.com"
        },
        {
            name: "Wellfound (AngelList)",
            description: "Startup job platform with opportunities at innovative companies.",
            region: "Global",
            url: "https://wellfound.com"
        },
        {
            name: "RemoteOK",
            description: "Remote job opportunities from companies around the world.",
            region: "Global",
            url: "https://remoteok.io"
        },
        {
            name: "Visa Guide",
            description: "Comprehensive information about work visas for different countries.",
            region: "Global",
            url: "https://www.visaguide.world"
        },
        {
            name: "Glassdoor",
            description: "Find jobs and get insider information on companies and salaries.",
            region: "Global",
            url: "https://www.glassdoor.com"
        }
    ]
};

// Initialize the app
function init() {
    renderApplications();
    updateStats();
    renderResources();
    setupEventListeners();
    loadSettings();
    // Set applied date to today by default
    document.getElementById('appliedDate').valueAsDate = new Date();
}

// Render applications to the dashboard
function renderApplications() {
    applicationsList.innerHTML = '';
    
    if (applications.length === 0) {
        applicationsList.innerHTML = `
            <div class="text-center" style="padding: 40px 20px; color: var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size: 60px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>No applications yet</h3>
                <p>Get started by adding your first job application</p>
            </div>
        `;
        return;
    }
    
    // Sort applications by date (newest first)
    const sortedApplications = [...applications].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedApplications.forEach(app => {
        const statusClass = `status-${app.status.toLowerCase().replace(/\s+/g, '-')}`;
        const appDate = new Date(app.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const appCard = document.createElement('div');
        appCard.className = 'application-card';
        appCard.dataset.id = app.id;
        appCard.innerHTML = `
            <div class="application-info">
                <h3><i class="fas fa-building"></i> ${app.company}</h3>
                <p><i class="fas fa-briefcase"></i> ${app.title}</p>
                <p><i class="far fa-calendar"></i> Applied on ${appDate}</p>
            </div>
            <span class="application-status ${statusClass}">
                <i class="fas ${getStatusIcon(app.status)}"></i>
                ${app.status}
            </span>
        `;
        applicationsList.appendChild(appCard);
        
        // Add click event to view details
        appCard.addEventListener('click', () => viewApplication(app.id));
    });
}

// Get icon for status
function getStatusIcon(status) {
    const icons = {
        'Pending': 'fa-clock',
        'Interview Scheduled': 'fa-calendar-check',
        'Rejected': 'fa-times',
        'Offer Received': 'fa-handshake',
        'Hired': 'fa-trophy'
    };
    return icons[status] || 'fa-tag';
}

// Update statistics
function updateStats() {
    const appliedCount = applications.length;
    const pendingCount = applications.filter(app => app.status === 'Pending').length;
    const interviewingCount = applications.filter(app => app.status === 'Interview Scheduled').length;
    const offerCount = applications.filter(app => app.status === 'Offer Received').length;
    const rejectedCount = applications.filter(app => app.status === 'Rejected').length;
    const hiredCount = applications.filter(app => app.status === 'Hired').length;
    
    document.getElementById('applied-count').textContent = appliedCount;
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('interviewing-count').textContent = interviewingCount;
    document.getElementById('offer-count').textContent = offerCount;
    document.getElementById('rejected-count').textContent = rejectedCount;
    document.getElementById('hired-count').textContent = hiredCount;
}

// Render resources
function renderResources() {
    const pakistanContainer = document.getElementById('pakistan-resources');
    const internationalContainer = document.getElementById('international-resources');
    
    if (!pakistanContainer || !internationalContainer) return;
    
    // Clear existing content
    pakistanContainer.innerHTML = '';
    internationalContainer.innerHTML = '';
    
    // Render Pakistan resources
    resources.pakistan.forEach(resource => {
        const resourceCard = document.createElement('div');
        resourceCard.className = 'resource-card';
        resourceCard.innerHTML = `
            <div class="resource-header">
                <div class="resource-title">${resource.name}</div>
                <span class="resource-region">${resource.region}</span>
            </div>
            <p class="resource-description">${resource.description}</p>
            <a href="${resource.url}" target="_blank" class="resource-link">
                Visit Resource <i class="fas fa-external-link-alt"></i>
            </a>
        `;
        pakistanContainer.appendChild(resourceCard);
    });
    
    // Render International resources
    resources.international.forEach(resource => {
        const resourceCard = document.createElement('div');
        resourceCard.className = 'resource-card';
        resourceCard.innerHTML = `
            <div class="resource-header">
                <div class="resource-title">${resource.name}</div>
                <span class="resource-region">${resource.region}</span>
            </div>
            <p class="resource-description">${resource.description}</p>
            <a href="${resource.url}" target="_blank" class="resource-link">
                Visit Resource <i class="fas fa-external-link-alt"></i>
            </a>
        `;
        internationalContainer.appendChild(resourceCard);
    });
}

// View application details
function viewApplication(id) {
    const app = applications.find(a => a.id === id);
    if (app) {
        currentViewId = id;
        document.getElementById('detail-company').textContent = app.company;
        document.getElementById('detail-title').textContent = app.title;
        document.getElementById('detail-status').textContent = app.status;
        
        // Update status class
        const statusClass = `status-${app.status.toLowerCase().replace(/\s+/g, '-')}`;
        document.getElementById('detail-status').className = `application-status ${statusClass}`;
        document.getElementById('detail-status').innerHTML = `<i class="fas ${getStatusIcon(app.status)}"></i> ${app.status}`;
        
        const appDate = new Date(app.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('detail-date').textContent = appDate;
        document.getElementById('detail-notes').textContent = app.notes;
        
        showPage('details');
    }
}

// Show the specified page
function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('open');
        mobileOverlay.classList.remove('active');
    }
    
    // Initialize charts if analytics page is shown
    if (pageId === 'analytics') {
        setTimeout(() => initCharts(), 100);
    }
}

// Initialize charts for analytics
function initCharts() {
    // Destroy existing charts if they exist
    if (monthlyChart) monthlyChart.destroy();
    if (statusChart) statusChart.destroy();
    
    // Prepare data for charts
    const monthlyData = getMonthlyApplicationData();
    const statusData = getStatusData();
    
    // Monthly applications chart
    const monthlyCtx = document.getElementById('monthlyChart');
    if (monthlyCtx) {
        monthlyChart = new Chart(monthlyCtx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Applications',
                    data: monthlyData.values,
                    backgroundColor: 'rgba(94, 114, 228, 0.7)',
                    borderColor: 'rgba(94, 114, 228, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Applications per Month'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    // Status distribution chart
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: statusData.labels,
                datasets: [{
                    data: statusData.values,
                    backgroundColor: [
                        'rgba(214, 164, 54, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(20, 184, 166, 0.7)',
                        'rgba(34, 197, 94, 0.7)'
                    ],
                    borderColor: [
                        'rgba(214, 164, 54, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(20, 184, 166, 1)',
                        'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Applications by Status'
                    }
                }
            }
        });
    }
}

// Get monthly application data for charts
function getMonthlyApplicationData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyCounts = new Array(12).fill(0);
    
    applications.forEach(app => {
        const appDate = new Date(app.date);
        if (appDate.getFullYear() === currentYear) {
            monthlyCounts[appDate.getMonth()]++;
        }
    });
    
    return {
        labels: months,
        values: monthlyCounts
    };
}

// Get status distribution data for charts
function getStatusData() {
    const statusCounts = {
        'Pending': 0,
        'Interview Scheduled': 0,
        'Rejected': 0,
        'Offer Received': 0,
        'Hired': 0
    };
    
    applications.forEach(app => {
        statusCounts[app.status]++;
    });
    
    return {
        labels: Object.keys(statusCounts),
        values: Object.values(statusCounts)
    };
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('careerPulseSettings')) || {};
    
    // Theme
    if (settings.theme === 'light') {
        document.body.classList.add('light-mode');
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
        
        // Update theme options
        themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === 'light') {
                option.classList.add('active');
            }
        });
    }
    
    // Notifications
    if (settings.notifications) {
        document.getElementById('emailNotifications').checked = settings.notifications.email || true;
        document.getElementById('appNotifications').checked = settings.notifications.app || true;
        document.getElementById('statusNotifications').checked = settings.notifications.status || true;
    }
    
    // Profile
    if (settings.profile) {
        document.getElementById('userName').value = settings.profile.name || '';
        document.getElementById('userEmail').value = settings.profile.email || '';
    }
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        theme: document.body.classList.contains('light-mode') ? 'light' : 'dark',
        notifications: {
            email: document.getElementById('emailNotifications').checked,
            app: document.getElementById('appNotifications').checked,
            status: document.getElementById('statusNotifications').checked
        },
        profile: {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value
        }
    };
    
    localStorage.setItem('careerPulseSettings', JSON.stringify(settings));
    showToast('Settings saved successfully!');
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        
        if (document.body.classList.contains('light-mode')) {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
        }
        
        saveSettings();
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        mobileOverlay.classList.toggle('active');
    });

    // Mobile overlay click to close sidebar
    mobileOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        mobileOverlay.classList.remove('active');
    });

    // Close sidebar on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            sidebar.classList.remove('open');
            mobileOverlay.classList.remove('active');
        }
    });

    // Theme options
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            if (option.dataset.theme === 'light') {
                document.body.classList.add('light-mode');
                const icon = themeToggle.querySelector('i');
                const text = themeToggle.querySelector('span');
                icon.className = 'fas fa-sun';
                text.textContent = 'Light Mode';
            } else if (option.dataset.theme === 'dark') {
                document.body.classList.remove('light-mode');
                const icon = themeToggle.querySelector('i');
                const text = themeToggle.querySelector('span');
                icon.className = 'fas fa-moon';
                text.textContent = 'Dark Mode';
            } else {
                // System theme - use prefers-color-scheme
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.body.classList.add('light-mode');
                    const icon = themeToggle.querySelector('i');
                    const text = themeToggle.querySelector('span');
                    icon.className = 'fas fa-sun';
                    text.textContent = 'Light Mode';
                } else {
                    document.body.classList.remove('light-mode');
                    const icon = themeToggle.querySelector('i');
                    const text = themeToggle.querySelector('span');
                    icon.className = 'fas fa-moon';
                    text.textContent = 'Dark Mode';
                }
            }
            
            saveSettings();
        });
    });

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page);
        });
    });

    // Form submission
    jobForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const companyName = document.getElementById('companyName').value;
        const jobTitle = document.getElementById('jobTitle').value;
        const status = document.getElementById('status').value;
        const appliedDate = document.getElementById('appliedDate').value;
        const notes = document.getElementById('notes').value;
        
        if (isEditing && currentViewId) {
            // Update existing application
            const appIndex = applications.findIndex(app => app.id === currentViewId);
            if (appIndex !== -1) {
                applications[appIndex] = {
                    id: currentViewId,
                    company: companyName,
                    title: jobTitle,
                    status: status,
                    date: appliedDate,
                    notes: notes
                };
                
                localStorage.setItem('careerPulseApplications', JSON.stringify(applications));
                showToast('Application updated successfully!');
            }
        } else {
            // Add new application
            const newApplication = {
                id: Date.now(), // Unique ID
                company: companyName,
                title: jobTitle,
                status: status,
                date: appliedDate,
                notes: notes
            };
            
            applications.push(newApplication);
            localStorage.setItem('careerPulseApplications', JSON.stringify(applications));
            showToast('Application saved successfully!');
        }
        
        renderApplications();
        updateStats();
        showPage('dashboard');
        
        // Reset form and editing state
        jobForm.reset();
        document.getElementById('appliedDate').valueAsDate = new Date();
        isEditing = false;
        currentViewId = null;
    });

    // Cancel add
    cancelAdd.addEventListener('click', () => {
        showPage('dashboard');
        isEditing = false;
        currentViewId = null;
    });

    // Add new job button
    addNewJob.addEventListener('click', () => {
        showPage('add-job');
        isEditing = false;
        currentViewId = null;
        jobForm.reset();
        document.getElementById('appliedDate').valueAsDate = new Date();
    });

    // Back to dashboard from details
    backToDashboard.addEventListener('click', () => {
        showPage('dashboard');
    });

    // Edit job
    editJob.addEventListener('click', () => {
        if (currentViewId) {
            const app = applications.find(a => a.id === currentViewId);
            if (app) {
                document.getElementById('companyName').value = app.company;
                document.getElementById('jobTitle').value = app.title;
                document.getElementById('status').value = app.status;
                document.getElementById('appliedDate').value = app.date;
                document.getElementById('notes').value = app.notes;
                
                isEditing = true;
                showPage('add-job');
            }
        }
    });

    // Delete job
    deleteJob.addEventListener('click', () => {
        if (currentViewId) {
            if (confirm('Are you sure you want to delete this application?')) {
                applications = applications.filter(app => app.id !== currentViewId);
                localStorage.setItem('careerPulseApplications', JSON.stringify(applications));
                showToast('Application deleted', 'error');
                renderApplications();
                updateStats();
                showPage('dashboard');
            }
        }
    });

    // Save profile
    saveProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;
        
        if (!name || name.trim().length < 2) {
            showToast('Name must be at least 2 characters long', 'error');
            return;
        }
        
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        saveSettings();
    });

    // Export data
    exportDataBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(applications, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'careerpulse-data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showToast('Data exported successfully!');
    });

    // Import data
    importDataBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (Array.isArray(importedData)) {
                        applications = importedData;
                        localStorage.setItem('careerPulseApplications', JSON.stringify(applications));
                        renderApplications();
                        updateStats();
                        showToast('Data imported successfully!');
                    } else {
                        showToast('Invalid data format', 'error');
                    }
                } catch (error) {
                    showToast('Error importing data', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    });

    // Upload avatar
    uploadAvatarBtn.addEventListener('click', () => {
        showToast('Avatar upload functionality would be implemented here');
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);