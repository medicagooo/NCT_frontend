const { getAreaOptions } = require('../../config/areaSelector');
const {
  getLocalizedFormRules,
  getLocalizedIdentityOptions,
  getLocalizedOtherSexTypeOptions,
  getLocalizedSexOptions
} = require('../../config/formConfig');
const { sensitiveRobotsPolicy } = require('../../config/security');
const { issueFormProtectionToken } = require('./formProtectionService');

function buildFormPageViewModel({ apiUrl, formProtectionSecret, req, title: pageTitle }) {
  const t = req.t;
  const { provinces } = getAreaOptions(req.lang);

  return {
    title: pageTitle || t('pageTitles.form', { title: req.t('common.siteName') }),
    apiUrl,
    areaOptions: { provinces },
    formProtectionToken: issueFormProtectionToken({ secret: formProtectionSecret }),
    formRules: getLocalizedFormRules(t),
    identityOptions: getLocalizedIdentityOptions(t),
    otherSexTypeOptions: getLocalizedOtherSexTypeOptions(t),
    pageRobots: sensitiveRobotsPolicy,
    sexOptions: getLocalizedSexOptions(t)
  };
}

module.exports = {
  buildFormPageViewModel
};
