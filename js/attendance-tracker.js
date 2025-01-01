document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const form = document.getElementById('attendanceForm');
    const totalClassesInput = document.getElementById('totalClasses');
    const attendedClassesInput = document.getElementById('attendedClasses');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const currentAttendanceDisplay = document.getElementById('currentAttendance');
    const allowableAbsencesDisplay = document.getElementById('allowableAbsences');
    const requiredClassesDisplay = document.getElementById('requiredClasses');
    const feedbackMessage = document.getElementById('feedbackMessage');

    // Fixed target attendance (80%)
    const TARGET_ATTENDANCE = 0.8;

    // Initialize charts
    let attendanceChart, progressChart;

    // Initialize charts on page load
    initializeCharts();

    // Calculate button click handler
    calculateBtn.addEventListener('click', () => {
        if (validateInputs()) {
            calculateAttendance();
        }
    });

    // Reset button click handler
    resetBtn.addEventListener('click', () => {
        resetCalculator();
    });

    // Input validation handlers
    totalClassesInput.addEventListener('input', () => {
        if (parseInt(attendedClassesInput.value) > parseInt(totalClassesInput.value)) {
            attendedClassesInput.value = totalClassesInput.value;
        }
    });

    attendedClassesInput.addEventListener('input', () => {
        const total = parseInt(totalClassesInput.value);
        const attended = parseInt(attendedClassesInput.value);
        if (attended > total) {
            attendedClassesInput.value = total;
        }
    });

    function validateInputs() {
        const total = parseInt(totalClassesInput.value);
        const attended = parseInt(attendedClassesInput.value);

        clearErrors();

        if (!total || total < 1) {
            showError(totalClassesInput, 'Please enter a valid number of total classes');
            return false;
        }

        if (!attended || attended < 0) {
            showError(attendedClassesInput, 'Please enter a valid number of attended classes');
            return false;
        }

        if (attended > total) {
            showError(attendedClassesInput, 'Attended classes cannot exceed total classes');
            return false;
        }

        return true;
    }

    function calculateAttendance() {
        const total = parseInt(totalClassesInput.value);
        const attended = parseInt(attendedClassesInput.value);

        // Calculate current attendance percentage
        const currentAttendance = (attended / total) * 100;

        // Calculate required classes to meet target
        const requiredClassesToMeetTarget = Math.ceil((TARGET_ATTENDANCE * total - attended) / (1 - TARGET_ATTENDANCE));

        // Calculate remaining classes that can be missed while still meeting target
        const remainingClassesCanBeMissed = Math.max(0, attended - (TARGET_ATTENDANCE * total));

        // Update displays
        currentAttendanceDisplay.textContent = `${currentAttendance.toFixed(1)}%`;
        allowableAbsencesDisplay.textContent = remainingClassesCanBeMissed;
        requiredClassesDisplay.textContent = requiredClassesToMeetTarget > 0 ? requiredClassesToMeetTarget : '0';

        // Update feedback message
        updateFeedbackMessage(currentAttendance, TARGET_ATTENDANCE * 100, requiredClassesToMeetTarget);

        // Update charts
        updateCharts(attended, total - attended, TARGET_ATTENDANCE);
    }

    function updateFeedbackMessage(current, target, required) {
        let message = '';
        if (current >= target) {
            message = `Great job! Your attendance (${current.toFixed(1)}%) is above the target (${target}%).`;
            if (current === 100) {
                message += ' Perfect attendance!';
            }
        } else {
            message = `Your current attendance is ${current.toFixed(1)}%. `;
            message += `You need to attend ${required} more classes to reach ${target}% target.`;
        }
        feedbackMessage.textContent = message;
    }

    function initializeCharts() {
        // Attendance Pie Chart
        const attendanceCtx = document.getElementById('attendanceChart').getContext('2d');
        attendanceChart = new Chart(attendanceCtx, {
            type: 'pie',
            data: {
                labels: ['Attended', 'Missed'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#4a90e2', '#e74c3c']
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
                        text: 'Attendance Distribution'
                    }
                }
            }
        });

        // Progress Bar Chart
        const progressCtx = document.getElementById('progressChart').getContext('2d');
        progressChart = new Chart(progressCtx, {
            type: 'bar',
            data: {
                labels: ['Progress'],
                datasets: [{
                    label: 'Current',
                    data: [0],
                    backgroundColor: '#4a90e2'
                }, {
                    label: 'Target (80%)',
                    data: [0],
                    backgroundColor: '#2ecc71'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Percentage'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Attendance Progress'
                    }
                }
            }
        });
    }

    function updateCharts(attended, missed, target) {
        // Update Pie Chart
        attendanceChart.data.datasets[0].data = [attended, missed];
        attendanceChart.update();

        // Update Progress Chart
        const currentPercentage = (attended / (attended + missed)) * 100;
        progressChart.data.datasets[0].data = [currentPercentage];
        progressChart.data.datasets[1].data = [target * 100];
        progressChart.update();
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
        currentAttendanceDisplay.textContent = '-';
        allowableAbsencesDisplay.textContent = '-';
        requiredClassesDisplay.textContent = '-';
        feedbackMessage.textContent = 'Enter your attendance details to see analysis';
        clearErrors();
        
        // Reset charts
        attendanceChart.data.datasets[0].data = [0, 0];
        attendanceChart.update();
        progressChart.data.datasets[0].data = [0];
        progressChart.data.datasets[1].data = [0];
        progressChart.update();
    }
});