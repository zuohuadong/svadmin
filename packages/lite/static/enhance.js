/**
 * @svadmin/lite — Optional Progressive Enhancement (ES5)
 *
 * This script is 100% OPTIONAL and written in ES5 for IE11 compatibility.
 * If included, it adds minor UX improvements. If not, everything still works.
 *
 * Include in your app.html:
 *   <script src="/enhance.js"></script>
 */
(function() {
  'use strict';

  // 1. Delete confirmation — close <details> when clicking outside
  document.addEventListener('click', function(e) {
    var details = document.querySelectorAll('details.lite-confirm-details');
    for (var i = 0; i < details.length; i++) {
      if (!details[i].contains(e.target)) {
        details[i].removeAttribute('open');
      }
    }
  });

  // 2. Highlight current table row on hover (for older browsers without :hover)
  var rows = document.querySelectorAll('.lite-table tbody tr');
  for (var j = 0; j < rows.length; j++) {
    rows[j].addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#f8fafc';
    });
    rows[j].addEventListener('mouseleave', function() {
      this.style.backgroundColor = '';
    });
  }

  // 3. Auto-focus first input on form pages
  var firstInput = document.querySelector('.lite-form-group input, .lite-form-group textarea');
  if (firstInput && firstInput.offsetParent !== null) {
    firstInput.focus();
  }

  // 4. Confirm before leaving dirty forms
  var form = document.querySelector('form.lite-card');
  if (form) {
    var dirty = false;
    var inputs = form.querySelectorAll('input, textarea, select');
    for (var k = 0; k < inputs.length; k++) {
      inputs[k].addEventListener('change', function() { dirty = true; });
    }
    window.addEventListener('beforeunload', function(e) {
      if (dirty) {
        e.returnValue = 'You have unsaved changes.';
        return e.returnValue;
      }
    });
    form.addEventListener('submit', function() { dirty = false; });
  }
})();
