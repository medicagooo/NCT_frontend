const express = require('express');
const {
  applySensitivePageHeaders,
  createRateLimiter
} = require('../../config/security');
const { logAuditEvent } = require('../services/auditLogService');
const { buildFormPageViewModel } = require('../services/formPageViewModel');

function createStandaloneFormPageRoutes({
  apiUrl,
  formProtectionSecret,
  pageReadRateLimitMax,
  rateLimitRedisUrl,
  title
}) {
  const router = express.Router();
  const pageReadLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: pageReadRateLimitMax,
    redisUrl: rateLimitRedisUrl,
    storePrefix: 'standalone-form-page-read-rate-limit:',
    getMessage(req) {
      return req.t('server.tooManyRequests');
    },
    onLimit(req, status, message) {
      logAuditEvent(req, 'page_read_rate_limited', { status, message });
    }
  });

  function renderStandaloneFormPage(req, res) {
    const pageTitle = req.t('pageTitles.form', { title });
    const viewModel = buildFormPageViewModel({
      apiUrl,
      formProtectionSecret,
      req,
      title: pageTitle
    });

    applySensitivePageHeaders(res);

    return res.render('standalone_form', {
      ...viewModel,
      submitAction: '/submit'
    });
  }

  router.get(['/', '/form/standalone'], pageReadLimiter, renderStandaloneFormPage);

  router.get('/healthz', (_req, res) => {
    res
      .type('text/plain; charset=utf-8')
      .set('Cache-Control', 'no-store')
      .send('ok');
  });

  return router;
}

module.exports = createStandaloneFormPageRoutes;
