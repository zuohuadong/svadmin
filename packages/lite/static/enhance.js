/**
 * @svadmin/lite — Optional Progressive Enhancement
 *
 * This script is optional and uses ES5 syntax for broad compatibility.
 * If included, it adds minor UX improvements. If not, everything still works.
 *
 * Include in your app.html:
 *   <script src="/enhance.js"></script>
 */
(function() {
  'use strict';

  function closestByAttribute(element, attribute) {
    var current = element;
    while (current && current.nodeType === 1) {
      if (current.hasAttribute(attribute)) return current;
      current = current.parentElement;
    }
    return null;
  }

  function bindArrayRemoveButtons(fieldset) {
    var buttons = fieldset.querySelectorAll('[data-lite-array-remove]');
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      button.removeAttribute('hidden');
      if (button.getAttribute('data-lite-array-bound') === 'true') continue;
      button.setAttribute('data-lite-array-bound', 'true');
      button.addEventListener('click', function() {
        var item = closestByAttribute(this, 'data-lite-array-item');
        if (item && item.parentNode) item.parentNode.removeChild(item);
      });
    }
  }

  function enhanceArrayField(fieldset) {
    var addButton = fieldset.querySelector('[data-lite-array-add]');
    var template = fieldset.querySelector('template[data-lite-array-template]');
    bindArrayRemoveButtons(fieldset);
    if (!addButton || !template) return;

    addButton.removeAttribute('hidden');
    addButton.addEventListener('click', function() {
      var nextIndex = Number(fieldset.getAttribute('data-next-index') || '0');
      var holder = document.createElement('div');
      holder.innerHTML = template.innerHTML.replace(/__INDEX__/g, String(nextIndex));
      var item = holder.firstElementChild;
      if (!item || !addButton.parentNode) return;
      addButton.parentNode.insertBefore(item, addButton);
      fieldset.setAttribute('data-next-index', String(nextIndex + 1));
      bindArrayRemoveButtons(fieldset);
      var firstInput = item.querySelector('input:not([type="hidden"]), textarea, select');
      if (firstInput) firstInput.focus();
    });
  }

  function init() {
    document.documentElement.className += ' lite-js';

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
    form.addEventListener('change', function() { dirty = true; });
    window.addEventListener('beforeunload', function(e) {
      if (dirty) {
        e.returnValue = 'You have unsaved changes.';
        return e.returnValue;
      }
    });
    form.addEventListener('submit', function() { dirty = false; });
  }

  // 5. Dynamic array rows. The initial row and no-JS removal submitters
  // remain fully server-submittable when this optional script is absent.
  var arrays = document.querySelectorAll('[data-lite-array]');
  for (var k = 0; k < arrays.length; k++) enhanceArrayField(arrays[k]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
