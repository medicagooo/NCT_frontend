(() => {
    const i18n = window.I18N;
    const formRules = window.FORM_RULES;
    const AGENT_IDENTITY = '受害者的代理人';
    const OTHER_SEX_OPTION = '__other_option__';
    const CUSTOM_OTHER_SEX_OPTION = '__custom_other_sex__';
    const mainForm = document.getElementById('mainForm');

    if (!mainForm || !i18n || !formRules) {
        return;
    }

    const identitySelect = document.getElementById('identitySelect');
    const birthFieldLabel = document.getElementById('birthFieldLabel');
    const birthYearSelect = document.getElementById('birthYearSelect');
    const experienceSectionHeading = document.getElementById('experienceSectionHeading');
    const sexLabel = document.getElementById('sexLabel');
    const sexSelect = document.getElementById('sexSelect');
    const otherSexFields = document.getElementById('otherSexFields');
    const otherSexTypeInputs = Array.from(document.querySelectorAll('input[name="sex_other_type"]'));
    const otherSexTypeValidityTarget = otherSexTypeInputs[0] || null;
    const otherSexInput = document.getElementById('otherSexInput');
    const provinceSelect = document.getElementById('provinceSelect');
    const citySelect = document.getElementById('citySelect');
    const countySelect = document.getElementById('countySelect');
    const schoolNameInput = document.getElementById('school_input');
    const dateStartInput = document.getElementById('date_start');
    const dateEndInput = document.getElementById('date_end');
    const contactInformationInput = document.getElementById('contactInformationInput');
    const submitButton = mainForm.querySelector('button[type="submit"]');

    function clearValidity(input) {
        input.setCustomValidity('');
    }

    function formatMessage(template, variables = {}) {
        return String(template || '').replace(/\{(\w+)\}/g, (_, key) => (
            Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : `{${key}}`
        ));
    }

    function isAgentMode() {
        return identitySelect.value === AGENT_IDENTITY;
    }

    function clearOtherSexTypeValidity() {
        otherSexTypeInputs.forEach((input) => clearValidity(input));
    }

    function getSelectedOtherSexType() {
        const selectedInput = otherSexTypeInputs.find((input) => input.checked);
        return selectedInput ? selectedInput.value : '';
    }

    function syncOtherSexInputState() {
        const shouldEnableInput = sexSelect.value === OTHER_SEX_OPTION
            && getSelectedOtherSexType() === CUSTOM_OTHER_SEX_OPTION;

        otherSexInput.disabled = !shouldEnableInput;

        if (!shouldEnableInput) {
            clearValidity(otherSexInput);
        }
    }

    function getBirthFieldLabelText() {
        return isAgentMode() ? i18n.form.fields.victimBirthYear : i18n.form.fields.birthYear;
    }

    function getSexLabelText() {
        return isAgentMode() ? i18n.form.fields.victimSex : i18n.form.fields.sex;
    }

    function getBirthRequiredMessage() {
        return isAgentMode() ? i18n.form.validation.fillVictimBirthYear : i18n.form.validation.fillBirthDate;
    }

    function getSexRequiredMessage() {
        return isAgentMode() ? i18n.form.validation.selectVictimSex : i18n.form.validation.selectSex;
    }

    function bindRequiredMessage(input, messageOrFactory) {
        input.addEventListener('invalid', () => {
            if (input.validity.valueMissing) {
                input.setCustomValidity(
                    typeof messageOrFactory === 'function' ? messageOrFactory() : messageOrFactory
                );
            } else {
                input.setCustomValidity('');
            }
        });
        input.addEventListener('input', () => clearValidity(input));
        input.addEventListener('change', () => clearValidity(input));
    }

    function updateIdentityDependentFields() {
        birthFieldLabel.textContent = getBirthFieldLabelText();
        birthFieldLabel.htmlFor = 'birthYearSelect';
        sexLabel.textContent = getSexLabelText();
        experienceSectionHeading.textContent = isAgentMode()
            ? i18n.form.sections.victimExperience
            : i18n.form.sections.experience;

        clearValidity(birthYearSelect);
        clearValidity(sexSelect);
    }

    function toggleOtherSex() {
        const showOtherInput = sexSelect.value === OTHER_SEX_OPTION;
        otherSexFields.hidden = !showOtherInput;
        otherSexTypeInputs.forEach((input) => {
            input.disabled = !showOtherInput;
        });
        clearOtherSexTypeValidity();
        clearValidity(otherSexInput);

        if (!showOtherInput) {
            otherSexTypeInputs.forEach((input) => {
                input.checked = false;
            });
            otherSexInput.value = '';
            otherSexInput.disabled = true;
            return;
        }

        syncOtherSexInputState();
    }

    function validateBirthField() {
        clearValidity(birthYearSelect);

        if (!birthYearSelect.value) {
            return;
        }

        const year = Number(birthYearSelect.value);
        const isValid = Number.isInteger(year)
            && year >= formRules.birthYear.min
            && year <= formRules.birthYear.max;

        if (!isValid) {
            birthYearSelect.setCustomValidity(
                formatMessage(i18n.form.validation.invalidBirthDate, {
                    label: getBirthFieldLabelText()
                })
            );
        }
    }

    function validateCrossFields() {
        clearOtherSexTypeValidity();
        clearValidity(otherSexInput);
        clearValidity(dateEndInput);

        if (sexSelect.value === OTHER_SEX_OPTION) {
            const selectedOtherSexType = getSelectedOtherSexType();

            if (selectedOtherSexType && selectedOtherSexType !== CUSTOM_OTHER_SEX_OPTION && otherSexInput.value) {
                otherSexInput.value = '';
            }

            if (!selectedOtherSexType && otherSexTypeValidityTarget) {
                otherSexTypeValidityTarget.setCustomValidity(i18n.form.validation.specifyOtherSex);
            } else if (selectedOtherSexType === CUSTOM_OTHER_SEX_OPTION && !otherSexInput.value.trim()) {
                otherSexInput.setCustomValidity(i18n.form.validation.fillOtherSex);
            }
        }

        validateBirthField();

        const start = dateStartInput.value;
        const end = dateEndInput.value;
        if (end && start && new Date(end) < new Date(start)) {
            dateEndInput.setCustomValidity(i18n.form.validation.endDateBeforeStart);
        }
    }

    bindRequiredMessage(identitySelect, i18n.form.validation.selectIdentity);
    bindRequiredMessage(birthYearSelect, getBirthRequiredMessage);
    bindRequiredMessage(sexSelect, getSexRequiredMessage);
    bindRequiredMessage(provinceSelect, i18n.form.validation.selectProvince);
    bindRequiredMessage(citySelect, i18n.form.validation.selectCity);
    bindRequiredMessage(schoolNameInput, i18n.form.validation.fillSchoolName);
    bindRequiredMessage(dateStartInput, i18n.form.validation.fillDateStart);
    bindRequiredMessage(contactInformationInput, i18n.form.validation.fillContactInformation);

    identitySelect.addEventListener('change', updateIdentityDependentFields);
    identitySelect.addEventListener('change', validateCrossFields);
    birthYearSelect.addEventListener('change', validateCrossFields);
    citySelect.addEventListener('change', () => clearValidity(countySelect));

    sexSelect.addEventListener('change', toggleOtherSex);
    sexSelect.addEventListener('change', validateCrossFields);
    otherSexTypeInputs.forEach((input) => {
        input.addEventListener('change', () => {
            if (getSelectedOtherSexType() !== CUSTOM_OTHER_SEX_OPTION) {
                otherSexInput.value = '';
            }
            syncOtherSexInputState();
            validateCrossFields();

            if (input.checked && input.value === CUSTOM_OTHER_SEX_OPTION && !otherSexInput.disabled) {
                otherSexInput.focus();
            }
        });
    });
    otherSexInput.addEventListener('input', validateCrossFields);
    otherSexInput.addEventListener('change', validateCrossFields);
    dateStartInput.addEventListener('change', validateCrossFields);
    dateEndInput.addEventListener('change', validateCrossFields);
    updateIdentityDependentFields();
    toggleOtherSex();
    validateCrossFields();

    mainForm.addEventListener('submit', (event) => {
        validateCrossFields();
        if (!mainForm.checkValidity()) {
            event.preventDefault();
            mainForm.reportValidity();
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = i18n.form.buttons.submitting || i18n.common.loading;
        }
    });
})();
