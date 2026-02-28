/* return.js — Captivate 12 → Qualtrics redirect on button click */
(function(){
  // ---- CONFIG ----
  var QUALTRICS_RETURN_BASE = 'https://cornell.ca1.qualtrics.com/jfe/form/SV_1BRAmsPvFJ1G5ro';
  var PASS_THRESHOLD = 70; // change if your pass rule differs

  function gv(name){
    try { return window.cpAPIInterface.getVariableValue(name); }
    catch(e){ return null; }
  }
  function log(){
    if (window.console && console.log) {
      console.log.apply(console, ['[Return→Qualtrics]'].concat([].slice.call(arguments)));
    }
  }

  // Expose a single function Captivate can call
  window.returnToQualtrics = function(){
    // Read PID/condition that Qualtrics added to the training URL
    var usp = new URLSearchParams(location.search);
    var PID = usp.get('PID') || usp.get('pid') || '';           // accept PID or pid
    var condition = usp.get('condition') || '';

    // Read Captivate 12 runtime quiz variables
    var scorePercent = Number(gv('cpQuizInfoPercentage'));       // 0–100
    var correct      = Number(gv('cpQuizInfoCorrectAnswers'));   // integer
    var total        = Number(gv('cpQuizInfoTotalQuestions'));   // integer
    var passed       = (!isNaN(scorePercent) && scorePercent >= PASS_THRESHOLD);

    // Build the return URL
    var qs = [];
    if (PID)       qs.push('PID=' + encodeURIComponent(PID));
    if (condition) qs.push('condition=' + encodeURIComponent(condition));
    if (!isNaN(scorePercent)) qs.push('quizScore=' + scorePercent);
    qs.push('passed=' + (passed ? 'true' : 'false'));
    if (!isNaN(correct)) qs.push('correct=' + correct);
    if (!isNaN(total))   qs.push('total=' + total);

    var url = QUALTRICS_RETURN_BASE + '?' + qs.join('&');
    log('Navigating to:', url);
    location.href = url;
  };
})();
