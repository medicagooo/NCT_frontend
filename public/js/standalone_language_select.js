(() => {
  const languageForms = document.querySelectorAll('[data-standalone-language-form]');

  if (languageForms.length === 0) {
    return;
  }

  languageForms.forEach((form) => {
    const select = form.querySelector('[data-standalone-language-select]');

    if (!select) {
      return;
    }

    const submitLanguageChange = () => {
      const nextLanguage = String(select.value || '').trim();

      if (!nextLanguage || nextLanguage === window.APP_LANG || form.dataset.submitting === 'true') {
        return;
      }

      form.dataset.submitting = 'true';

      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
        return;
      }

      form.submit();
    };

    select.addEventListener('input', submitLanguageChange);
    select.addEventListener('change', submitLanguageChange);
  });
})();
