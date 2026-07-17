/* Social Profile Theme — main.js  v1.1 */
(function () {
	'use strict';

	var d    = window.spData || {};
	var ajax = d.ajaxUrl || '';

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

				var nonceBody = new FormData();
				nonceBody.append('action', 'spm_get_nonce');

				fetch(ajax, { method: 'POST', body: nonceBody, credentials: 'same-origin' })
					.then(function (r) { return r.json(); })
					.then(function (nonceRes) {
						if (!nonceRes.success || !nonceRes.data || !nonceRes.data.nonce) {
							throw new Error('nonce-failed');
						}

						var body = new FormData();
						body.append('action',       'spm_subscribe');
						body.append('nonce',        nonceRes.data.nonce);
						body.append('email',        emailVal);
						body.append('dial_code',    dialCodeVal);
						body.append('phone_number', phoneNumVal);

						return fetch(ajax, { method: 'POST', body: body, credentials: 'same-origin' });
					})
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
	// Ticket Modal
	// -----------------------------------------------------------------------
	function initTicketModal() {
		var overlay  = document.getElementById('sp-ticket-overlay');
		var closeBtn = document.getElementById('sp-ticket-close');
		var optsWrap = document.getElementById('sp-ticket-opts');
		var titleEl  = document.getElementById('sp-ticket-title');
		if (!overlay || !optsWrap) return;

		function openTicketModal(data) {
			titleEl.textContent = data.btn_text || 'Get Tickets';

			var subEl = document.getElementById('sp-ticket-subtitle');
			if (!subEl) {
				subEl = document.createElement('p');
				subEl.id = 'sp-ticket-subtitle';
				subEl.className = 'sp-ticket-subtitle';
				titleEl.parentNode.insertBefore(subEl, optsWrap);
			}
			subEl.innerHTML = '<strong>' + escHtml(data.title) + '</strong> — pick your way in below 🎟️';

			optsWrap.innerHTML = '';

			var arrow = '<svg class="sp-ticket-opt__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>';

			data.options.forEach(function (opt) {
				if (opt.type === 'location') {
					var locIcon = '<span class="sp-ticket-opt__icon"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></span>';
					var locBody = '<div class="sp-ticket-opt__body"><span class="sp-ticket-opt__label">' + escHtml(opt.place_name || 'Physical Location') + '</span>';
					if (opt.address) {
						locBody += '<span class="sp-ticket-opt__value">' + escHtml(opt.address) + '</span>';
					}
					locBody += '</div>';
					var el;
					if (opt.maps_url) {
						el = document.createElement('a');
						el.href = opt.maps_url;
						el.target = '_blank';
						el.rel = 'noopener noreferrer';
					} else {
						el = document.createElement('div');
					}
					el.className = 'sp-ticket-opt sp-ticket-opt--location';
					el.innerHTML = locIcon + locBody;
					optsWrap.appendChild(el);
				} else if (opt.type === 'payaw') {
					var el = document.createElement('div');
					el.className = 'sp-ticket-opt sp-ticket-opt--link sp-ticket-opt--payaw';
					el.style.cursor = 'pointer';
					el.innerHTML =
						'<span class="sp-ticket-opt__icon sp-ticket-opt__icon--payaw"><img src="/wp-content/uploads/2026/06/unnamed.png" alt="Pay.aw" width="36" height="36" style="border-radius:8px;display:block;"></span>' +
						'<div class="sp-ticket-opt__body"><span class="sp-ticket-opt__label">Get your tickets on Pay.aw</span><span class="sp-ticket-opt__sublabel">Fast, Secure & Convenient</span></div>' +
						arrow;
					el.addEventListener('click', function() { openPayAw(); });
					optsWrap.appendChild(el);
				} else if (opt.type === 'rsvp') {
					var el = document.createElement('a');
					el.className = 'sp-ticket-opt sp-ticket-opt--link sp-ticket-opt--whatsapp';
					el.href = 'https://wa.me/' + opt.whatsapp.replace(/[^0-9]/g,''); el.target = '_blank'; el.rel = 'noopener noreferrer';
					el.innerHTML =
						'<span class="sp-ticket-opt__icon"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.843L.053 23.447c-.077.305.195.578.5.5l5.604-1.479C7.882 23.442 9.876 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.504-5.169-1.383l-.371-.219-3.854 1.017 1.017-3.854-.22-.371C2.504 15.65 2 13.885 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg></span>' +
						'<div class="sp-ticket-opt__body"><span class="sp-ticket-opt__label">RSVP via WhatsApp</span><span class="sp-ticket-opt__sublabel">Message us to reserve your spot</span></div>' +
						arrow;
					optsWrap.appendChild(el);
				} else if (opt.type === 'vip') {
					var el = document.createElement('a');
					el.className = 'sp-ticket-opt sp-ticket-opt--link sp-ticket-opt--vip';
					el.href = 'tel:' + opt.phone.replace(/[\s\-\(\)]/g, '');
					el.innerHTML =
						'<span class="sp-ticket-opt__icon"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></span>' +
						'<div class="sp-ticket-opt__body"><span class="sp-ticket-opt__label">VIP Tables</span><span class="sp-ticket-opt__sublabel">' + escHtml(opt.phone) + '</span></div>' +
						arrow;
					optsWrap.appendChild(el);
				} else if (opt.type === 'link') {
					var el = document.createElement('a');
					el.className = 'sp-ticket-opt sp-ticket-opt--link sp-ticket-opt--link-custom';
					el.href = opt.url; el.target = '_blank'; el.rel = 'noopener noreferrer';
					var linkIcon = opt.icon_url
						? '<span class="sp-ticket-opt__icon sp-ticket-opt__icon--img"><img src="' + escHtml(opt.icon_url) + '" alt="" width="36" height="36" style="border-radius:8px;object-fit:cover;display:block;width:36px;height:36px;"></span>'
						: '<span class="sp-ticket-opt__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-.757-4.9a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg></span>';
					el.innerHTML =
						linkIcon +
						'<div class="sp-ticket-opt__body"><span class="sp-ticket-opt__label">' + escHtml(opt.label) + '</span><span class="sp-ticket-opt__sublabel">Tap to open link</span></div>' +
						arrow;
					optsWrap.appendChild(el);
				}
			});

			overlay.hidden = false;
			document.body.style.overflow = 'hidden';
		}

		function closeTicketModal() {
			overlay.hidden = true;
			document.body.style.overflow = '';
		}

		document.querySelectorAll('.sp-tickets-open').forEach(function (btn) {
			btn.addEventListener('click', function () {
				try {
					var data = JSON.parse(btn.dataset.tickets || '{}');
					openTicketModal(data);
				} catch(e) {}
			});
		});

		closeBtn && closeBtn.addEventListener('click', closeTicketModal);
		overlay.addEventListener('click', function (e) { if (e.target === overlay) closeTicketModal(); });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) closeTicketModal(); });
	}

	var PAYAW_DEFAULT = 'https://payaw.page.link/avwwkrXzLWcBaFYu9';

	function openPayAw(customUrl) {
		// Firebase Dynamic Link handles iOS app / Android app / web fallback automatically
		window.open(customUrl || PAYAW_DEFAULT, '_blank');
	}

	function escHtml(str) {
		var d = document.createElement('div');
		d.textContent = str || '';
		return d.innerHTML;
	}

	// -----------------------------------------------------------------------
	// Boot
	// -----------------------------------------------------------------------
	// -----------------------------------------------------------------------
	// Load More
	// -----------------------------------------------------------------------
	function initLoadMore() {
		document.querySelectorAll('[data-sp-limit]').forEach(function (list) {
			var limit = parseInt(list.dataset.spLimit, 10) || 5;
			var children = Array.from(list.children);
			if (children.length <= limit) return;

			// Hide items beyond the limit
			children.forEach(function (child, i) {
				if (i >= limit) child.classList.add('sp-hidden');
			});

			// Create Load More button
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'sp-load-more';
			btn.textContent = 'Load More';
			list.parentNode.insertBefore(btn, list.nextSibling);

			btn.addEventListener('click', function () {
				var hidden = list.querySelectorAll('.sp-hidden');
				var toShow = Array.from(hidden).slice(0, limit);
				toShow.forEach(function (el) { el.classList.remove('sp-hidden'); });
				if (list.querySelectorAll('.sp-hidden').length === 0) {
					btn.remove();
				}
			});
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		initTabs();
		initModal();
		initDialPicker();
		initPreview();
		initTicketModal();
		initLoadMore();
	});

})();
