document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cgpaForm');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const totalCreditsDisplay = document.getElementById('totalCredits');
    const cgpaDisplay = document.getElementById('cgpa');
    const feedbackMessage = document.getElementById('feedbackMessage');

    // Initialize charts
    let gradeDistributionChart, cgpaChart;

    // Grade points for each grade
    const gradePoints = {
        'S': 10,
        'A': 9,
        'B': 8,
        'C': 7,
        'D': 6,
        'E': 5
    };

    // Default credits per subject
    const creditsPerSubject = 4;

    // Initialize charts
    initializeCharts();

    // Calculate CGPA when the calculate button is clicked
    calculateBtn.addEventListener('click', () => {
        // Get all grade inputs
        const grades = {
            'S': parseInt(document.getElementById('gradeS').value) || 0,
            'A': parseInt(document.getElementById('gradeA').value) || 0,
            'B': parseInt(document.getElementById('gradeB').value) || 0,
            'C': parseInt(document.getElementById('gradeC').value) || 0,
            'D': parseInt(document.getElementById('gradeD').value) || 0,
            'E': parseInt(document.getElementById('gradeE').value) || 0
        };

        // Validate inputs
        if (!validateInputs(grades)) {
            return;
        }

        calculateCGPA(grades);
    });

    // Reset form and results
    resetBtn.addEventListener('click', () => {
        resetCalculator();
    });

    function calculateCGPA(grades) {
        // Calculate total subjects
        const totalSubjects = Object.values(grades).reduce((sum, count) => sum + count, 0);

        // Calculate total credits
        const totalCredits = totalSubjects * creditsPerSubject;

        // Calculate total grade points
        let totalGradePoints = 0;
        for (const [grade, count] of Object.entries(grades)) {
            totalGradePoints += gradePoints[grade] * count * creditsPerSubject;
        }

        // Calculate CGPA
        const cgpa = totalSubjects > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

        // Display results with animation
        animateValue(totalCreditsDisplay, 0, totalCredits, 1000);
        animateValue(cgpaDisplay, 0, parseFloat(cgpa), 1000);

        // Update feedback message
        updateFeedbackMessage(cgpa, grades);

        // Update charts
        updateCharts(grades, cgpa);
    }

    function initializeCharts() {
        // Grade Distribution Chart
        const gradeCtx = document.getElementById('gradeDistributionChart').getContext('2d');
        gradeDistributionChart = new Chart(gradeCtx, {
            type: 'pie',
            data: {
                labels: ['S', 'A', 'B', 'C', 'D', 'E'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#4CAF50', '#8BC34A', '#CDDC39',
                        '#FFEB3B', '#FFC107', '#FF9800'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Grade Distribution'
                    }
                }
            }
        });

        // CGPA Progress Chart
        const cgpaCtx = document.getElementById('cgpaChart').getContext('2d');
        cgpaChart = new Chart(cgpaCtx, {
            type: 'line',
            data: {
                labels: ['0', '2', '4', '6', '8', '10'],
                datasets: [{
                    label: 'Current CGPA',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#4a90e2',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#4a90e2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'CGPA'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'CGPA Progress'
                    }
                }
            }
        });
    }

    function updateCharts(grades, cgpa) {
        // Update Grade Distribution Chart
        gradeDistributionChart.data.datasets[0].data = [
            grades.S, grades.A, grades.B, grades.C, grades.D, grades.E
        ];
        gradeDistributionChart.update();

        // Update CGPA Chart with a smooth line
        const cgpaValue = parseFloat(cgpa);
        cgpaChart.data.datasets[0].data = [0, cgpaValue/2, cgpaValue, cgpaValue, cgpaValue, cgpaValue];
        cgpaChart.update();
    }

    function updateFeedbackMessage(cgpa, grades) {
        const totalSubjects = Object.values(grades).reduce((sum, count) => sum + count, 0);
        let message = '';

        if (cgpa >= 9.5) {
            message = `Outstanding! Your CGPA of ${cgpa} is excellent. Keep up the great work!`;
        } else if (cgpa >= 8.5) {
            message = `Great job! Your CGPA of ${cgpa} is very good.`;
        } else if (cgpa >= 7.5) {
            message = `Good work! Your CGPA of ${cgpa} shows consistent performance.`;
        } else if (cgpa >= 6.5) {
            message = `Your CGPA is ${cgpa}. There's room for improvement.`;
        } else {
            message = `Your CGPA is ${cgpa}. Consider seeking academic support to improve your grades.`;
        }

        feedbackMessage.textContent = message;
    }

    function validateInputs(grades) {
        let isValid = true;
        clearErrors();

        // Check for negative numbers
        for (const [grade, count] of Object.entries(grades)) {
            const input = document.getElementById(`grade${grade}`);
            if (count < 0) {
                showError(input, 'Please enter a positive number');
                isValid = false;
            }
        }

        // Check if at least one grade is entered
        const totalSubjects = Object.values(grades).reduce((sum, count) => sum + count, 0);
        if (totalSubjects === 0) {
            showError(document.getElementById('gradeS'), 'Please enter at least one grade count');
            isValid = false;
        }

        return isValid;
    }

    function showError(input, message) {
        input.classList.add('input-error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
        
        const errorInputs = document.querySelectorAll('.input-error');
        errorInputs.forEach(input => input.classList.remove('input-error'));
    }

    function resetCalculator() {
        form.reset();
        totalCreditsDisplay.textContent = '-';
        cgpaDisplay.textContent = '-';
        feedbackMessage.textContent = 'Enter your grade counts to calculate CGPA';
        clearErrors();

        // Reset charts
        gradeDistributionChart.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
        gradeDistributionChart.update();
        cgpaChart.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
        cgpaChart.update();
    }

    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                element.textContent = end;
            } else {
                element.textContent = current.toFixed(2);
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
});