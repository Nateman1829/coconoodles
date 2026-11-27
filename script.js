// Coco Mogu and Fried Noodles: order form
// Builds the order from the drinks and noodles the customer adds,
// and emails it to the shop.

(function () {
  var ORDER_EMAIL = 'natejoaquinaguisanda@gmail.com';
  // Orders are emailed to ORDER_EMAIL by FormSubmit (formsubmit.co).
  var SEND_URL = 'https://formsubmit.co/ajax/' + ORDER_EMAIL;
  var DRINK_PRICE = 50;
  var NOODLE_PRICE = 60;

  var form = document.getElementById('order-form');
  if (!form) return;

  var $ = function (id) { return document.getElementById(id); };
  var totalEl = $('total');
  var errorEl = $('form-error');
  var statusEl = $('form-status');
  var previewEl = $('order-preview');
  var textEl = $('order-text');
  var addressField = $('address-field');
  var nameEl = $('name');
  var mobileEl = $('mobile');
  var addressEl = $('address');
  var notesEl = $('notes');

  var sendButton = $('send-order');
  var fallbackEl = $('send-fallback');
  var fallbackLink = $('fallback-link');
  var drinkQtyEl = $('d-qty');
  var noodleQtyEl = $('n-qty');
  var noodleOptions = $('noodle-options');
  var noodleLock = $('noodle-lock');

  var drinks = [];   // { flavor, ice, nata, qty }
  var noodles = [];  // { sauce, chili, qty }
  var drinkDirty = false;

  function qty(input, min) {
    var n = parseInt(input.value, 10);
    if (isNaN(n) || n < min) n = min;
    if (n > 50) n = 50;
    return n;
  }

  function picked(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  function sauces() {
    var list = [];
    form.querySelectorAll('input[name="sauce"]:checked').forEach(function (c) { list.push(c.value); });
    return list.length ? list.join(' + ') + ' sauce' : 'no sauce';
  }

  function setPicked(name, value) {
    var el = form.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.hidden = !msg;
  }

  // ---------- Order text and total ----------

  function buildOrder() {
    var lines = [];
    var total = 0;
    drinks.forEach(function (d) {
      total += d.qty * DRINK_PRICE;
      lines.push('- ' + d.qty + ' x Coco Mogu ' + d.flavor + ' (' + d.ice + ', ' + d.nata + ') = ₱' + d.qty * DRINK_PRICE);
    });
    noodles.forEach(function (n) {
      total += n.qty * NOODLE_PRICE;
      lines.push('- ' + n.qty + ' x HK-Style Fried Noodles with Siomai (' + n.sauce + ', ' + n.chili + ', ' + n.utensil + ') = ₱' + n.qty * NOODLE_PRICE);
    });

    var isDelivery = picked('mode') === 'delivery';
    var message = ['Hi Coco Mogu and Fried Noodles! I would like to order:']
      .concat(lines)
      .concat([
        'Total: ₱' + total,
        '',
        'Name: ' + (nameEl.value.trim() || '-'),
        'Mobile: ' + (mobileEl.value.trim() || '-'),
        isDelivery ? 'Delivery to: ' + (addressEl.value.trim() || '-') : 'For pickup'
      ]);
    if (notesEl.value.trim()) message.push('Notes: ' + notesEl.value.trim());
    message.push('Payment: ' + (picked('payment') || 'GCash'));

    return { count: lines.length, total: total, isDelivery: isDelivery, text: message.join('\n') };
  }

  function update() {
    var order = buildOrder();
    totalEl.textContent = '₱' + order.total;
    addressField.hidden = !order.isDelivery;
    if (!previewEl.hidden) textEl.value = order.text;
    statusEl.textContent = '';

    // Noodle options unlock once at least one noodles is chosen.
    var locked = qty(noodleQtyEl, 0) === 0;
    noodleOptions.disabled = locked;
    noodleLock.hidden = !locked;
  }

  // ---------- Lists of added items ----------

  function renderList(listEl, items, describe) {
    listEl.textContent = '';
    items.forEach(function (item, i) {
      var li = document.createElement('li');
      var text = document.createElement('span');
      text.textContent = describe(item);
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove ' + describe(item));
      remove.addEventListener('click', function () {
        items.splice(i, 1);
        renderAll();
        update();
      });
      li.appendChild(text);
      li.appendChild(remove);
      listEl.appendChild(li);
    });
  }

  function renderAll() {
    renderList($('drink-list'), drinks, function (d) {
      return d.qty + ' × ' + d.flavor + ' · ' + d.ice + ' · ' + d.nata + ' — ₱' + d.qty * DRINK_PRICE;
    });
    renderList($('noodle-list'), noodles, function (n) {
      return n.qty + ' × Fried Noodles · ' + n.sauce + ' · ' + n.chili + ' · ' + n.utensil + ' — ₱' + n.qty * NOODLE_PRICE;
    });
  }

  function mergeInto(items, item, keys) {
    var same = items.filter(function (x) {
      return keys.every(function (k) { return x[k] === item[k]; });
    })[0];
    if (same) same.qty = Math.min(50, same.qty + item.qty);
    else items.push(item);
  }

  // ---------- Coco Mogu ----------

  function addDrink() {
    var flavor = picked('flavor');
    if (!flavor) {
      showError($('drink-error'), 'Please choose a flavor first.');
      return false;
    }
    showError($('drink-error'), '');
    mergeInto(drinks, {
      flavor: flavor,
      ice: picked('ice') || 'regular ice',
      nata: picked('nata') || 'with nata de coco',
      qty: qty(drinkQtyEl, 1)
    }, ['flavor', 'ice', 'nata']);
    form.querySelectorAll('input[name="flavor"]').forEach(function (r) { r.checked = false; });
    setPicked('ice', 'regular ice');
    setPicked('nata', 'with nata de coco');
    drinkQtyEl.value = 1;
    drinkDirty = false;
    renderAll();
    update();
    return true;
  }

  // ---------- Fried noodles ----------

  function addNoodles() {
    var n = qty(noodleQtyEl, 0);
    if (!n) {
      showError($('noodle-error'), 'Please choose how many noodles first.');
      return false;
    }
    showError($('noodle-error'), '');
    mergeInto(noodles, {
      sauce: sauces(),
      chili: picked('chili') || 'no chili garlic',
      utensil: picked('utensil') || 'spoon and fork',
      qty: n
    }, ['sauce', 'chili', 'utensil']);
    noodleQtyEl.value = 0;
    form.querySelectorAll('input[name="sauce"]').forEach(function (c) { c.checked = false; });
    setPicked('chili', 'no chili garlic');
    setPicked('utensil', 'spoon and fork');
    renderAll();
    update();
    return true;
  }

  // ---------- Events ----------

  form.querySelectorAll('.step').forEach(function (button) {
    button.addEventListener('click', function () {
      var input = $(button.dataset.for);
      var min = input === drinkQtyEl ? 1 : 0;
      input.value = Math.max(min, Math.min(50, qty(input, min) + Number(button.dataset.step)));
      if (input === noodleQtyEl) showError($('noodle-error'), '');
      update();
    });
  });

  $('add-drink').addEventListener('click', addDrink);
  $('add-noodles').addEventListener('click', addNoodles);

  form.querySelectorAll('input[name="flavor"]').forEach(function (r) {
    r.addEventListener('change', function () {
      drinkDirty = true;
      showError($('drink-error'), '');
    });
  });

  form.addEventListener('input', update);
  form.addEventListener('change', update);

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Something chosen but not added yet: add it, then let them check the new total.
    var added = [];
    if (drinkDirty && picked('flavor')) {
      var flavor = picked('flavor');
      if (addDrink()) added.push(flavor + ' Coco Mogu');
    }
    if (qty(noodleQtyEl, 0) > 0 && addNoodles()) added.push('fried noodles');
    if (added.length) {
      showError(errorEl, 'We added your ' + added.join(' and ') + ' to the order. Check the total, then tap Send order by email again.');
      return;
    }

    var order = buildOrder();
    var problems = [];
    if (!order.count) problems.push('add at least one drink or noodles');
    if (!nameEl.value.trim()) problems.push('enter your name');
    if (!mobileEl.value.trim()) problems.push('enter your mobile number so we can confirm your order');
    if (order.isDelivery && !addressEl.value.trim()) problems.push('enter your delivery address');
    if (problems.length) {
      showError(errorEl, 'Please ' + problems.join(', ') + '.');
      return;
    }
    showError(errorEl, '');

    previewEl.hidden = false;
    textEl.value = order.text;

    var subject = 'New order from ' + nameEl.value.trim() + ' (₱' + order.total + ')';
    var mailto = 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(order.text);
    fallbackLink.href = mailto;

    sendButton.disabled = true;
    sendButton.textContent = 'Sending…';
    statusEl.textContent = '';
    fallbackEl.hidden = true;

    // Send the order straight to the shop's email through FormSubmit.
    fetch(SEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        _template: 'box',
        Name: nameEl.value.trim(),
        Mobile: mobileEl.value.trim(),
        Order: order.text,
        Total: '₱' + order.total
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && (data.success === true || data.success === 'true')) {
          statusEl.textContent = 'Order sent! We got your order and will contact you at ' + mobileEl.value.trim() + ' to confirm. Salamat!';
          sendButton.textContent = 'Order sent ✓';
        } else {
          throw new Error((data && data.message) || 'not sent');
        }
      })
      .catch(function () {
        sendButton.disabled = false;
        sendButton.textContent = 'Send order';
        statusEl.textContent = 'Sorry, we couldn\'t send your order automatically.';
        fallbackEl.hidden = false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(order.text).catch(function () {});
        } catch (e) {}
      });
  });

  update();
})();
