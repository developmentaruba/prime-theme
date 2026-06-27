/* Social Profile Theme — main.js  v1.1 */
(function () {
	'use strict';

	var d    = window.spData || {};
	var ajax = d.ajaxUrl || '';
	var nonc = d.subscribeNonce || '';

	// -----------------------------------------------------------------------
	// Tab Switching + hash URLs
	// -----------------------------------------------------------------------
	function initTabs() {
		var nav     = document.getElementById('sp-tabs-nav');
		var content = document.getElementById('sp-tabs-content');
		if (!nav || !content) return;

		var buttons = Array.from(nav.querySelectorAll('.sp-tab-btn'));
		var panels  = Array.from(content.querySelectorAll('.sp-tab-panel'));

		function activateTab(slug, pushHash) {
			buttons.forEach(function (btn) {
				var on = btn.dataset.tab === slug;
				btn.classList.toggle('is-active', on);
				btn.setAttribute('aria-selected', on ? 'true' : 'false');
			});
			panels.forEach(function (p) {
				p.classList.toggle('is-active', p.dataset.tabSlug === slug);
			});
			if (pushHash !== false) {
				history.replaceState(null, '', '#' + slug);
			}
		}

		buttons.forEach(function (btn) {
			btn.addEventListener('click', function () { activateTab(btn.dataset.tab); });
		});

		// Activate from URL hash on load
		var hash = location.hash.replace('#', '');
		if (hash && buttons.some(function (b) { return b.dataset.tab === hash; })) {
			activateTab(hash, false);
		}

		window.addEventListener('hashchange', function () {
			var h = location.hash.replace('#', '');
			if (h) activateTab(h, false);
		});
	}

	// -----------------------------------------------------------------------
	// Email Collection Modal
	// -----------------------------------------------------------------------
	function initModal() {
		var overlay  = document.getElementById('sp-modal-overlay');
		var modal    = document.getElementById('sp-modal');
		var openBtn  = document.getElementById('sp-cta-btn');
		var closeBtn = document.getElementById('sp-modal-close');
		var form     = document.getElementById('sp-modal-form');
		var feedback = document.getElementById('sp-modal-feedback');
		var submitBtn = document.getElementById('sp-modal-submit');
		var btnLabel  = document.getElementById('sp-modal-btn-label');

		if (!overlay || !openBtn) return;

		function openModal() {
			overlay.hidden = false;
			document.body.style.overflow = 'hidden';
			// Focus first input
			var first = overlay.querySelector('input');
			if (first) setTimeout(function () { first.focus(); }, 50);
		}

		function closeModal() {
			overlay.hidden = true;
			document.body.style.overflow = '';
		}

		openBtn.addEventListener('click', openModal);

		closeBtn && closeBtn.addEventListener('click', closeModal);

		// Click outside modal to close
		overlay.addEventListener('click', function (e) {
			if (e.target === overlay) closeModal();
		});

		// Esc key
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && !overlay.hidden) closeModal();
		});

		// Form submit
		if (form) {
			form.addEventListener('submit', function (e) {
				e.preventDefault();
				var emailEl    = document.getElementById('sp-email-input');
				var dialCodeEl = document.getElementById('sp-dial-code');
				var phoneNumEl = document.getElementById('sp-phone-number');

				if (!emailEl || !emailEl.value.trim()) {
					showFeedback('Please enter your email address.', true);
					return;
				}

				var emailVal    = emailEl.value.trim();
				var dialCodeVal = dialCodeEl ? dialCodeEl.value.trim() : '+297';
				var phoneNumVal = phoneNumEl ? phoneNumEl.value.trim() : '';

				submitBtn.disabled = true;
				if (btnLabel) btnLabel.textContent = 'Signing up…';

				var body = new FormData();
				body.append('action',       'spm_subscribe');
				body.append('nonce',        nonc);
				body.append('email',        emailVal);
				body.append('dial_code',    dialCodeVal);
				body.append('phone_number', phoneNumVal);

				fetch(ajax, { method: 'POST', body: body, credentials: 'same-origin' })
					.then(function (r) { return r.json(); })
					.then(function (res) {
						submitBtn.disabled = false;
						if (btnLabel) btnLabel.textContent = 'Sign Up';
						if (res.success) {
							showFeedback(res.data.message || "You're in!", false);
							form.reset();
						} else {
							showFeedback((res.data && res.data.message) || 'Something went wrong.', true);
						}
					})
					.catch(function () {
						submitBtn.disabled = false;
						if (btnLabel) btnLabel.textContent = 'Sign Up';
						showFeedback('Network error — please try again.', true);
					});
			});
		}

		function showFeedback(msg, isError) {
			if (!feedback) return;
			feedback.textContent = msg;
			feedback.hidden = false;
			feedback.className = 'sp-modal__feedback' + (isError ? ' is-error' : '');
		}
	}

	// -----------------------------------------------------------------------
	// Country-code custom dropdown
	// -----------------------------------------------------------------------
	function initDialPicker() {
		var triggerBtn = document.getElementById('sp-dial-btn');
		var dropdown   = document.getElementById('sp-dial-dropdown');
		var hiddenCode = document.getElementById('sp-dial-code');
		var flagEl     = document.getElementById('sp-dial-flag');
		var numEl      = document.getElementById('sp-dial-num');
		var searchInp  = document.getElementById('sp-dial-search');
		var list       = document.getElementById('sp-dial-list');

		if (!triggerBtn || !dropdown) return;

		var isOpen = false;

		function openDrop() {
			isOpen = true;
			dropdown.style.display = 'block';
			triggerBtn.setAttribute('aria-expanded', 'true');
			if (searchInp) {
				searchInp.value = '';
				filterOptions('');
				setTimeout(function () { searchInp.focus(); }, 20);
			}
		}

		function closeDrop() {
			isOpen = false;
			dropdown.style.display = 'none';
			triggerBtn.setAttribute('aria-expanded', 'false');
		}

		triggerBtn.addEventListener('click', function (e) {
			e.stopPropagation();
			isOpen ? closeDrop() : openDrop();
		});

		// div[role=button] needs keyboard activation
		triggerBtn.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				e.stopPropagation();
				isOpen ? closeDrop() : openDrop();
			}
		});

		document.addEventListener('click', function (e) {
			if (!isOpen) return;
			var box = document.getElementById('sp-phone-row');
			if (box && box.contains(e.target)) return;
			closeDrop();
		});

		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && isOpen) { closeDrop(); triggerBtn.focus(); }
		});

		if (searchInp) {
			searchInp.addEventListener('input', function () {
				filterOptions(searchInp.value.trim().toLowerCase());
			});
		}

		function filterOptions(q) {
			if (!list) return;
			list.querySelectorAll('.sp-dial-option').forEach(function (li) {
				var name = (li.dataset.name || '').toLowerCase();
				var code = (li.dataset.code || '');
				li.classList.toggle('is-hidden', !(!q || name.includes(q) || code.includes(q)));
			});
		}

		if (list) {
			list.addEventListener('click', function (e) {
				e.stopPropagation();
				var opt = e.target.closest('.sp-dial-option');
				if (opt) selectOption(opt);
			});
			list.addEventListener('keydown', function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					var opt = e.target.closest('.sp-dial-option');
					if (opt) { e.preventDefault(); selectOption(opt); }
				}
			});
		}

		function selectOption(opt) {
			var code = opt.dataset.code || '+297';
			var flag = opt.dataset.flag || '🇦🇼';
			if (flagEl)     flagEl.textContent = flag;
			if (numEl)      numEl.textContent  = code;
			if (hiddenCode) hiddenCode.value   = code;
			if (list) {
				list.querySelectorAll('.sp-dial-option').forEach(function (li) {
					li.classList.toggle('is-selected', li === opt);
				});
			}
			closeDrop();
			var numInput = document.getElementById('sp-phone-number');
			if (numInput) numInput.focus();
		}

		// Default: Aruba selected
		if (list) {
			var defaultOpt = list.querySelector('.sp-dial-option[data-name="Aruba"]');
			if (defaultOpt) defaultOpt.classList.add('is-selected');
		}
	}

	// -----------------------------------------------------------------------
	// Live Preview (admin iframe postMessage)
	// -----------------------------------------------------------------------
	function initPreview() {
		if (!d.isPreview) return;

		window.addEventListener('message', function (e) {
			if (e.origin !== window.location.origin) return;
			var msg = e.data;
			if (!msg || msg.type !== 'sp_preview') return;
			applyPreview(msg.profile);
		});

		if (window.parent && window.parent !== window) {
			window.parent.postMessage({ type: 'sp_preview_ready' }, window.location.origin);
		}
	}

	function applyPreview(profile) {
		if (!profile) return;
		var c = profile.colors || {};
		var r = document.documentElement;

		if (c.bg)       r.style.setProperty('--sp-bg',       c.bg);
		if (c.accent)   r.style.setProperty('--sp-accent',   c.accent);
		if (c.button)   r.style.setProperty('--sp-button',   c.button);
		if (c.card)     r.style.setProperty('--sp-card',     c.card);
		if (c.text)     r.style.setProperty('--sp-text',     c.text);
		if (c.btn_text) r.style.setProperty('--sp-btn-text', c.btn_text);

		set('sp-name',     profile.name);
		set('sp-subtitle', profile.subtitle);
		set('sp-bio',      profile.bio);
		set('sp-location', profile.location);

		if (profile.avatar) {
			var img  = document.getElementById('sp-avatar-img');
			var wrap = document.getElementById('sp-avatar-wrap');
			if (img) {
				img.src = profile.avatar;
			} else if (wrap) {
				var el = document.createElement('img');
				el.id  = 'sp-avatar-img';
				el.src = profile.avatar;
				wrap.innerHTML = '';
				wrap.appendChild(el);
				wrap.classList.remove('sp-avatar--placeholder');
			}
		}

		if (profile.cta_text) {
			var cta = document.getElementById('sp-cta-btn');
			if (cta) {
				// Replace text node without clobbering the SVG arrow
				var first = cta.firstChild;
				if (first && first.nodeType === 3) first.textContent = profile.cta_text + ' ';
			}
		}
	}

	function set(id, val) {
		if (!val) return;
		var el = document.getElementById(id);
		if (el) el.textContent = val;
	}

	// -----------------------------------------------------------------------
	// Boot
	// -----------------------------------------------------------------------
	document.addEventListener('DOMContentLoaded', function () {
		initTabs();
		initModal();
		initDialPicker();
		initPreview();
	});

})();
