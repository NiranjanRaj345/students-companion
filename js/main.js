document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme !== null) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }

    // Theme toggle functionality
    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // Update icon based on current theme
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            themeToggle.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';

            // Add click event listener
            themeToggle.addEventListener('click', function() {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Update toggle icon
                themeToggle.querySelector('i').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            });
        }
    }

    // Mobile menu functionality
    function initMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenu && navLinks) {
            mobileMenu.addEventListener('click', function() {
                navLinks.classList.toggle('active');
                mobileMenu.querySelector('i').className = navLinks.classList.contains('active') 
                    ? 'fas fa-times' 
                    : 'fas fa-bars';
            });
        }
    }

    // Initialize both theme toggle and mobile menu after components are loaded
    const checkComponentsLoaded = setInterval(function() {
        const header = document.querySelector('header');
        if (header) {
            clearInterval(checkComponentsLoaded);
            initThemeToggle();
            initMobileMenu();
        }
    }, 100);
});