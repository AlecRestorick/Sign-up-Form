function addValidationIndicator(input, isValid) {

    const existingTick = input.parentNode.querySelector('.valid-tick');
    const existingIndicator = input.parentNode.querySelector('.validation-indicator');
    
    if (existingTick) {
        existingTick.remove();
    }
    if (existingIndicator) {
        existingIndicator.remove();
    }

    const indicator = document.createElement('span');
    
    if (isValid) {
        indicator.classList.add('valid-tick');
        indicator.textContent = '✓';
        indicator.style.color = 'green';
        indicator.style.animation = 'fadeInTick 0.3s forwards';
    } else {
        indicator.classList.add('validation-indicator');
        indicator.textContent = '✗';
        indicator.style.color = 'red';
        indicator.style.animation = 'fadeInIndicator 0.3s forwards';
    }

    indicator.style.position = 'absolute';
    indicator.style.right = '10px';
    indicator.style.top = '50%';
    indicator.style.transform = 'translateY(-50%)';
    indicator.style.fontSize = '1.5rem';
    indicator.style.opacity = '0';
    indicator.style.pointerEvents = 'none';

    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(indicator);
}

const indicatorAnimationStyle = document.createElement('style');
indicatorAnimationStyle.textContent = `
@keyframes fadeInIndicator {
    from {
        opacity: 0;
        transform: translateY(-40%) scale(0.5);
    }
    to {
        opacity: 1;
        transform: translateY(-40%) scale(1);
    }
}

@keyframes fadeInTick {
    from {
        opacity: 0;
        transform: translateY(-40%) scale(0.5);
    }
    to {
        opacity: 1;
        transform: translateY(-40%) scale(1);
    }
}
`;
document.head.appendChild(indicatorAnimationStyle);

const validationConfig = {
    'first-name': {
        emptyMessage: 'First name is required',
        pattern: /^[A-Za-z\s'-]+$/,
        errorMessage: 'Please enter a valid first name'
    },
    'last-name': {
        emptyMessage: 'Last name is required',
        pattern: /^[A-Za-z\s'-]+$/,
        errorMessage: 'Please enter a valid last name'
    },
    'email': {
        emptyMessage: 'Email is required',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: 'Please enter a valid email address'
    },
    'phone-number': {
        emptyMessage: 'Phone number is required',
        pattern: /^\d{10}$/,
        errorMessage: 'Please enter a 10-digit phone number'
    },
    'password': {
        emptyMessage: 'Password is required',
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-@$!%*?&])[A-Za-z\d@$!%*?&-]{6,}$/,
        errorMessage: 'Password must be 6+ characters long, must include 1 uppercase letter, 1 lowercase letter, a number & a special character'
    },
    'confirm-password': {
        emptyMessage: 'Please confirm your password',
        custom: (value) => {
            const passwordInput = document.getElementById('password');
            return {
                isValid: value === passwordInput.value,
                message: 'Passwords do not match'
            };
        }
    }
};

function validateInput(input, validationRules) {
    const errorSpan = input.nextElementSibling || 
        (() => {
            const span = document.createElement('span');
            span.classList.add('error-message');
            input.parentNode.insertBefore(span, input.nextSibling);
            return span;
        })();

    input.classList.remove('valid', 'invalid');
    errorSpan.textContent = '';

    if (input.value.trim() === '') {
        input.classList.add('invalid');
        addValidationIndicator(input, false);
        errorSpan.textContent = validationRules.emptyMessage;
        return false;
    }

    if (validationRules.pattern && !validationRules.pattern.test(input.value)) {
        input.classList.add('invalid');
        addValidationIndicator(input, false);
        errorSpan.textContent = validationRules.errorMessage;
        return false;
    }

    if (validationRules.custom) {
        const customValidation = validationRules.custom(input.value);
        if (!customValidation.isValid) {
            input.classList.add('invalid');
            addValidationIndicator(input, false);
            errorSpan.textContent = customValidation.message;
            return false;
        }
    }

    input.classList.add('valid');
    addValidationIndicator(input, true);
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('input');

    const inputStates = {};

    inputs.forEach(input => {
        inputStates[input.id] = {
            touched: false,
            timer: null
        };

        input.addEventListener('focus', () => {
            inputStates[input.id].touched = true;
        });

        input.addEventListener('input', () => {
            if (inputStates[input.id].timer) {
                clearTimeout(inputStates[input.id].timer);
            }

            inputStates[input.id].timer = setTimeout(() => {
                if (inputStates[input.id].touched) {
                    validateInput(input, validationConfig[input.id]);
                }
            }, 1500);
        });

        input.addEventListener('blur', () => {
            if (inputStates[input.id].touched) {
                if (inputStates[input.id].timer) {
                    clearTimeout(inputStates[input.id].timer);
                }
                validateInput(input, validationConfig[input.id]);
            }
        });
    });

    form.addEventListener('submit', (event) => {
        let isFormValid = true;

        inputs.forEach(input => {
            if (!validateInput(input, validationConfig[input.id])) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            event.preventDefault();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('input');
    const submitButton = form.querySelector('button[type="submit"]');
    const loginLink = form.querySelector('a[aria-label="Log in to existing account"]');

    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                validateInput(input, validationConfig[input.id]);
                
                if (input.classList.contains('valid')) {
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    } else {
                        submitButton.focus();
                    }
                }
            }

            if (event.key === 'Escape') {
                input.value = '';
                const errorSpan = input.nextElementSibling;
                if (errorSpan) {
                    errorSpan.textContent = '';
                }
                input.classList.remove('valid', 'invalid');
                
                const existingTick = input.parentNode.querySelector('.valid-tick');
                const existingIndicator = input.parentNode.querySelector('.validation-indicator');
                if (existingTick) existingTick.remove();
                if (existingIndicator) existingIndicator.remove();
            }
        });
    });

    submitButton.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            submitButton.click();
        }
    });

    loginLink.setAttribute('tabindex', '0');
    loginLink.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            loginLink.click();
        }
    });

    form.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            submitButton.click();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    
    const tooltip = document.createElement('div');
    tooltip.id = 'password-requirements-tooltip';
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#f9f9f9';
    tooltip.style.border = '1px solid #ddd';
    tooltip.style.padding = '10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.zIndex = '10';
    tooltip.style.maxWidth = '300px';
    tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    tooltip.style.fontWeight = '300';
    
    passwordInput.parentNode.appendChild(tooltip);
    passwordInput.parentNode.style.position = 'relative';

    function createRequirementsList() {
        const list = document.createElement('ul');
        list.style.marginLeft = '20px';
        list.style.paddingTop = '5px';

        const lengthReq = document.createElement('li');
        lengthReq.textContent = 'Minimum 6 characters long';
        list.appendChild(lengthReq);

        const detailsItem = document.createElement('li');
        detailsItem.textContent = 'Must include at least:';
        
        const subList = document.createElement('ul');
        subList.style.marginLeft = '20px';
        
        const uppercaseReq = document.createElement('li');
        uppercaseReq.textContent = '1 uppercase letter';
        subList.appendChild(uppercaseReq);
        
        const lowercaseReq = document.createElement('li');
        lowercaseReq.textContent = '1 lowercase letter';
        subList.appendChild(lowercaseReq);
        
        const numberReq = document.createElement('li');
        numberReq.textContent = '1 number';
        subList.appendChild(numberReq);
        
        const specialCharReq = document.createElement('li');
        specialCharReq.textContent = '1 special character (-@$!%*?&)';
        subList.appendChild(specialCharReq);
        
        detailsItem.appendChild(subList);
        list.appendChild(detailsItem);

        return list;
    }

    function showTooltip() {
        tooltip.style.display = 'block';
        tooltip.style.top = `${passwordInput.offsetHeight + 50}px`;
        tooltip.style.left = '0';
        
        const titleElement = document.createElement('strong');
        titleElement.textContent = 'Password Requirements:';
        
        tooltip.textContent = '';
        tooltip.appendChild(titleElement);
        tooltip.appendChild(createRequirementsList());
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    passwordInput.addEventListener('focus', showTooltip);
    passwordInput.addEventListener('blur', hideTooltip);
});



