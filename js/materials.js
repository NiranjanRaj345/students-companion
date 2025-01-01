document.addEventListener('DOMContentLoaded', () => {
    // Google Sheets Public URL Configuration
    const GOOGLE_SHEETS_CONFIG = {
        // Use the published Google Sheet URL for JSON
        SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6myXOUb96NmT-q5gW6FxtYKgNLulMQxKIBWRrVvzBN6F8y4vcfFYnpnxxi5_a36UW-JM7-PtUAKjk/pub?output=csv',
        // Columns mapping
        COLUMNS: {
            TITLE: 0,
            DEPARTMENT: 1,
            TYPE: 2,
            URL: 3,
            TIMESTAMP: 4
        }
    };

    // DOM Elements
    const searchInput = document.getElementById('searchMaterials');
    const departmentSelect = document.getElementById('departmentSelect');
    const materialTypeSelect = document.getElementById('materialType');
    const materialsGrid = document.getElementById('materialsGrid');
    const noMaterials = document.getElementById('noMaterials');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Materials data
    let materialsData = [];

    // Initial load
    loadMaterials();

    // Event listeners for filters
    searchInput.addEventListener('input', filterMaterials);
    departmentSelect.addEventListener('change', filterMaterials);
    materialTypeSelect.addEventListener('change', filterMaterials);

    function loadMaterials() {
        showLoading();
        
        fetch(GOOGLE_SHEETS_CONFIG.SHEET_URL)
            .then(response => response.text())
            .then(csvText => {
                // Parse CSV manually
                const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim()));
                
                // Remove header row
                rows.shift();

                // Transform sheet data
                materialsData = rows
                    .filter(row => row.length >= 5 && row[0]) // Ensure row has enough columns and title exists
                    .map(row => ({
                        title: row[GOOGLE_SHEETS_CONFIG.COLUMNS.TITLE],
                        department: (row[GOOGLE_SHEETS_CONFIG.COLUMNS.DEPARTMENT] || '').toLowerCase(),
                        type: (row[GOOGLE_SHEETS_CONFIG.COLUMNS.TYPE] || '').toLowerCase(),
                        url: row[GOOGLE_SHEETS_CONFIG.COLUMNS.URL],
                        timestamp: row[GOOGLE_SHEETS_CONFIG.COLUMNS.TIMESTAMP] || new Date().toISOString()
                    }))
                    .filter(material => material.title && material.url); // Ensure minimum required fields

                filterMaterials();
            })
            .catch(error => {
                console.error('Error loading materials:', error);
                noMaterials.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading materials</p>
                    <p>${error.message}</p>
                `;
                noMaterials.style.display = 'block';
            })
            .finally(() => {
                hideLoading();
            });
    }

    function filterMaterials() {
        const searchTerm = (searchInput.value || '').toLowerCase();
        const selectedDepartment = departmentSelect.value;
        const selectedType = materialTypeSelect.value;

        let filteredMaterials = materialsData;

        if (selectedDepartment) {
            filteredMaterials = filteredMaterials.filter(
                material => material.department === selectedDepartment
            );
        }

        if (selectedType) {
            filteredMaterials = filteredMaterials.filter(
                material => material.type === selectedType
            );
        }

        if (searchTerm) {
            filteredMaterials = filteredMaterials.filter(
                material => material.title.toLowerCase().includes(searchTerm)
            );
        }

        displayMaterials(filteredMaterials);
    }

    function displayMaterials(materials) {
        if (materials.length === 0) {
            materialsGrid.style.display = 'none';
            noMaterials.style.display = 'block';
            noMaterials.innerHTML = `
                <i class="fas fa-folder-open"></i>
                <p>No materials found for the selected filters</p>
            `;
            return;
        }

        materialsGrid.style.display = 'grid';
        noMaterials.style.display = 'none';

        materialsGrid.innerHTML = materials.map(material => `
            <div class="material-card" onclick="window.open('${material.url}', '_blank')">
                <div class="material-content">
                    <div class="material-icon">
                        ${getIconForType(material.type)}
                    </div>
                    <h3 class="material-title">${material.title}</h3>
                    <div class="material-info">
                        <p><i class="fas fa-folder"></i> ${material.department.toUpperCase()}</p>
                        <p><i class="fas fa-clock"></i> ${getRelativeTime(material.timestamp)}</p>
                    </div>
                </div>
                <div class="material-overlay">
                    <i class="fas fa-external-link-alt"></i>
                    <span>Open</span>
                </div>
            </div>
        `).join('');
    }

    function getIconForType(type) {
        const icons = {
            'concept maps': '<i class="fas fa-project-diagram"></i>',
            'papers': '<i class="fas fa-file-alt"></i>'
        };
        return icons[type] || '<i class="fas fa-file"></i>';
    }

    function getRelativeTime(timestamp) {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const now = new Date();
        const date = new Date(timestamp);
        const diff = now - date;
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return rtf.format(-diffDays, 'day');
        if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), 'week');
        if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), 'month');
        return rtf.format(-Math.floor(diffDays / 365), 'year');
    }

    function showLoading() {
        loadingSpinner.style.display = 'block';
        materialsGrid.style.display = 'none';
        noMaterials.style.display = 'none';
    }

    function hideLoading() {
        loadingSpinner.style.display = 'none';
    }
});
