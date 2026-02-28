// redirect.js
(function () {

  // Get ?param=value from URL
  function getQueryParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
  }

  // Read a Captivate variable safely
  function getCaptivateVar(name) {
    try {
      if (window.cpAPIInterface && typeof window.cpAPIInterface.getVariableValue === 'function') {
        return window.cpAPIInterface.getVariableValue(name);
      }
    } catch (e) {}
    return null;
  }

  // Pull only quizScore from Captivate
  function collectTrainingMetrics() {
    // Correct Captivate JS variable for points scored:
    var quizScore = Number(getCaptivateVar('cpQuizInfoPointsscored')) || 0;
    return { quizScore };
  }

  // Optional safety whitelist
  function isAllowedQualtricsHost(hostname) {
    return [
      'cornell.qualtrics.com',
      'qualtrics.com',
      'www.qualtrics.com'
    ].includes(hostname);
  }

  // Main function (called from Captivate on final button)
  window.redirectToQualtrics = function (opts) {
    var metrics = collectTrainingMetrics();

    // 1) Get returnUrl from training querystring (or optional fallback)
    var returnUrl =
      getQueryParam('returnUrl') ||
      (opts && opts.fallbackReturnUrl) ||
      (typeof window.FALLBACK_RETURN_URL === 'string' ? window.FALLBACK_RETURN_URL : '');

    if (!returnUrl) {
      alert('Missing return URL for Qualtrics.');
      return;
    }

    // 2) Build safe URL object
    var finalUrl;
    try {
      finalUrl = new URL(returnUrl, window.location.href);
    } catch (e) {
      alert('Invalid Qualtrics return URL.');
      return;
    }

    // 3) Optional: warn if not a Qualtrics domain
    if (!isAllowedQualtricsHost(finalUrl.hostname)) {
      console.warn('Non‑Qualtrics domain in returnUrl:', finalUrl.hostname);
    }

    // 4) Forward ONLY pid and condition if present in training URL
    var pid = getQueryParam('pid');
    if (pid) finalUrl.searchParams.set('pid', pid);

    var condition = getQueryParam('condition');
    if (condition) finalUrl.searchParams.set('condition', condition);

    // 5) Attach ONLY quizScore + completed
    finalUrl.searchParams.set('quizScore', String(metrics.quizScore));
    finalUrl.searchParams.set('completed', '1');

    // 6) Redirect back to Qualtrics
    console.log('Redirecting to:', finalUrl.toString());
    window.location.assign(finalUrl.toString());
  };

})();