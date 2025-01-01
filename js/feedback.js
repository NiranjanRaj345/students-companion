document.addEventListener('DOMContentLoaded', async () => {
    // Google Apps Script Web App URL (Replace with your deployed web app URL)
    const FEEDBACK_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzfMV_JbAeJNq6OXAnUNXusSojIZjYRQyQ6V_KI0b1tboOng3rLFYzGWW2Y21F90a6W/exec';

    // Modal elements
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const closeModal = document.getElementById('closeModal');
    const feedbackContainer = document.getElementById('feedbackContainer');

    // Load feedback form content
    await loadFeedbackContent();

    // Modal event listeners
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            feedbackModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    async function loadFeedbackContent() {
        try {
            // Create the feedback form HTML directly instead of fetching
            feedbackContainer.innerHTML = `
                <div class="feedback-tracker">
                    <h1>Share Your Feedback</h1>
                    <div class="input-section">
                        <form id="feedbackForm">
                            <div class="input-group">
                                <label for="name">Name *</label>
                                <input type="text" id="name" name="name" required>
                                <span id="nameError" class="error"></span>
                            </div>

                            <div class="input-group">
                                <label for="email">Email (Optional)</label>
                                <input type="email" id="email" name="email">
                                <span id="emailError" class="error"></span>
                            </div>

                            <div class="input-group">
                                <label for="feedbackType">Feedback Type *</label>
                                <select id="feedbackType" name="feedbackType" required>
                                    <option value="">Select feedback type</option>
                                    <option value="suggestion">Suggestion</option>
                                    <option value="issue">Issue Report</option>
                                    <option value="material">Study Material Related</option>
                                    <option value="other">Other</option>
                                </select>
                                <span id="feedbackTypeError" class="error"></span>
                            </div>

                            <div class="input-group">
                                <label for="message">Your Message *</label>
                                <textarea id="message" name="message" rows="5" required></textarea>
                                <div class="char-count">
                                    <span id="charCount">0</span>/500 characters
                                </div>
                                <span id="messageError" class="error"></span>
                            </div>

                            <div class="checkbox-group">
                                <input type="checkbox" id="requestResponse" name="requestResponse">
                                <label for="requestResponse">I would like to receive a response to my feedback</label>
                            </div>

                            <div class="button-group">
                                <button type="submit" class="primary-button">Submit Feedback</button>
                                <button type="reset" class="secondary-button">Reset</button>
                            </div>
                        </form>
                    </div>

                    <div id="successMessage" class="feedback-message" style="display: none;">
                        <i class="fas fa-check-circle"></i>
                        <h3>Thank you for your feedback!</h3>
                        <p>We appreciate your input and will use it to improve our services.</p>
                        <p class="response-note" style="display: none;">We'll get back to you via email soon.</p>
                    </div>
                </div>
            `;
            
            initializeFeedbackForm();
        } catch (error) {
            console.error('Error loading feedback content:', error);
        }
    }

    function initializeFeedbackForm() {
        // Cache DOM elements
        const form = document.getElementById('feedbackForm');
        const messageInput = document.getElementById('message');
        const charCount = document.getElementById('charCount');
        const submitBtn = document.querySelector('button[type="submit"]');
        const successMessage = document.getElementById('successMessage');
        const responseNote = document.querySelector('.response-note');

        // Track visited fields
        const visitedFields = new Set();

        // Initialize functionality
        setupCharacterCount();
        setupFormValidation();

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateForm(true)) return;

            toggleSubmitButton(true, submitBtn);

            try {
                const formData = gatherFormData();
                console.log('Sending data:', formData);

                await submitFormData(formData);
                handleSuccessfulSubmission(formData);

            } catch (error) {
                console.error('Submission error:', error);
                showErrorMessage(error.message || 'An unexpected error occurred. Please try again.');

            } finally {
                toggleSubmitButton(false, submitBtn);
            }
        });

        function setupCharacterCount() {
            messageInput.addEventListener('input', () => {
                const count = messageInput.value.length;
                charCount.textContent = count;
                charCount.style.color = count > 450 ? '#dc3545' : 'inherit';
                validateForm();
            });
        }

        function setupFormValidation() {
            const inputs = form.querySelectorAll('input:not([type="checkbox"]), textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    visitedFields.add(input.id);
                    validateField(input);
                });
                input.addEventListener('input', () => {
                    if (visitedFields.has(input.id)) {
                        validateField(input);
                    }
                    validateForm();
                });
            });
        }

        function validateField(field) {
            const errorElement = document.getElementById(`${field.id}Error`);
            let errorMessage = '';

            switch (field.id) {
                case 'name':
                    errorMessage = field.value.trim().length === 0 ? 'Name is required' :
                        field.value.trim().length > 50 ? 'Name must not exceed 50 characters' : '';
                    break;
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    errorMessage = field.value && !emailRegex.test(field.value) ? 'Please enter a valid email address' : '';
                    break;
                case 'feedbackType':
                    errorMessage = field.value ? '' : 'Please select a feedback type';
                    break;
                case 'message':
                    errorMessage = field.value.trim().length === 0 ? 'Message is required' :
                        field.value.trim().length > 500 ? 'Message must not exceed 500 characters' : '';
                    break;
            }

            field.classList.toggle('error', !!errorMessage);
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
            return !errorMessage;
        }

        function validateForm(showErrors = false) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (showErrors || visitedFields.has(field.id)) {
                    if (!validateField(field)) {
                        isValid = false;
                    }
                }
            });

            submitBtn.disabled = !isValid;
            return isValid;
        }

        function gatherFormData() {
            return {
                name: escapeHtml(document.getElementById('name').value.trim()),
                email: escapeHtml(document.getElementById('email').value.trim()),
                feedbackType: document.getElementById('feedbackType').value || 'General',
                message: escapeHtml(messageInput.value.trim()),
                requestResponse: document.getElementById('requestResponse').checked || false,
                timestamp: new Date().toISOString()
            };
        }

        async function submitFormData(formData) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            try {
                const response = await fetch(FEEDBACK_WEBAPP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.type !== 'opaque') {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timed out. Please check your internet connection.');
                }
                throw error;
            }
        }

        function handleSuccessfulSubmission(formData) {
            form.style.display = 'none';
            successMessage.style.display = 'block';
            responseNote.style.display = formData.requestResponse ? 'block' : 'none';
            form.reset();
            charCount.textContent = '0';
            
            // Close modal after 3 seconds
            setTimeout(() => {
                feedbackModal.classList.remove('active');
                document.body.style.overflow = '';
                // Reset form display after modal is closed
                setTimeout(() => {
                    form.style.display = 'block';
                    successMessage.style.display = 'none';
                }, 300);
            }, 3000);
        }

        function toggleSubmitButton(isDisabled, button) {
            button.disabled = isDisabled;
            button.innerHTML = isDisabled ?
                '<i class="fas fa-spinner fa-spin"></i> Submitting...' :
                'Submit Feedback';
        }

        function showErrorMessage(message) {
            const errorDiv = document.querySelector('.error-message') || document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

            if (!errorDiv.parentNode) {
                form.insertBefore(errorDiv, form.firstChild);
            }

            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
