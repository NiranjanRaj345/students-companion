document.addEventListener('DOMContentLoaded', function() {
    const isInPages = window.location.pathname.includes('/pages/');
    const componentPath = isInPages ? '../components/' : 'components/';
    
    // Load header
    fetch(componentPath + 'header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            
            // Initialize hamburger menu
            initializeHamburgerMenu();
            
            // Initialize theme toggles
            initializeThemeToggles();
            
            // Set active nav link based on current page
            const currentPath = window.location.pathname;
            const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
            
            navLinks.forEach(link => {
                // Remove any existing active classes
                link.classList.remove('active');
                
                // Get the href path and current page name
                const linkPath = link.getAttribute('href');
                const currentPage = currentPath.split('/').pop();
                
                // Check if we're on the home page
                if (currentPath === '/' || currentPage === 'index.html') {
                    if (linkPath.endsWith('index.html')) {
                        link.classList.add('active');
                    }
                }
                // Check for other pages
                else if (currentPath.includes(linkPath.split('/').pop())) {
                    link.classList.add('active');
                }
            });

            // Fix image paths based on current location
            const logoImg = document.querySelector('.logo img');
            if (logoImg) {
                logoImg.src = isInPages ? '../assets/images/logo.png' : 'assets/images/logo.png';
            }
        })
        .catch(error => console.error('Error loading header:', error));

    // Load footer
    fetch(componentPath + 'footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));

    // Add feedback button and modal
    const body = document.body;
    const feedbackComponent = document.createElement('div');
    feedbackComponent.innerHTML = `
        <!-- Feedback Float Button -->
        <div class="feedback-float-btn" id="feedbackBtn" title="Share Your Feedback">
            <i class="fas fa-comment-dots"></i>
        </div>

        <!-- Feedback Modal -->
        <div class="feedback-modal" id="feedbackModal">
            <div class="feedback-modal-content">
                <i class="fas fa-times feedback-modal-close" id="closeModal"></i>
                <div class="feedback-modal-body">
                    <div id="feedbackContainer"></div>
                </div>
            </div>
        </div>
    `;
    body.appendChild(feedbackComponent);
});

function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    if (hamburger && mobileOverlay) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('is-active');
            mobileOverlay.classList.toggle('is-active');
            hamburger.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu when clicking a link
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('is-active');
                mobileOverlay.classList.remove('is-active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) {
                hamburger.classList.remove('is-active');
                mobileOverlay.classList.remove('is-active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileOverlay.classList.contains('is-active')) {
                hamburger.classList.remove('is-active');
                mobileOverlay.classList.remove('is-active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }
}

function initializeThemeToggles() {
    const desktopToggle = document.getElementById('theme-toggle-desktop');
    const mobileToggle = document.getElementById('theme-toggle-mobile');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcons(currentTheme === 'dark');
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcons(true);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme === 'dark');
    }

    function updateThemeIcons(isDark) {
        const toggles = [desktopToggle, mobileToggle];
        toggles.forEach(toggle => {
            if (toggle) {
                const icon = toggle.querySelector('i');
                if (icon) {
                    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
                }
                if (toggle.id === 'theme-toggle-mobile') {
                    const span = toggle.querySelector('span');
                    if (span) {
                        span.textContent = isDark ? 'Light Mode' : 'Dark Mode';
                    }
                }
            }
        });
    }

    // Add event listeners to both toggles
    [desktopToggle, mobileToggle].forEach(toggle => {
        if (toggle) {
            toggle.addEventListener('click', toggleTheme);
        }
    });

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(e.matches);
    });
}