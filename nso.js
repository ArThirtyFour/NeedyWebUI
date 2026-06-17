(function() {
  'use strict';

  var NSO = {
    version: '1.0.0',
    init: function() {
      this.initTimeSlider();
      this.initProgressBars();
      this.initTabs();
      this.initToast();
      this.initStreamChat();
      this.initSidebar();
      this.initDropdowns();
      this.initAccordions();
      this.initReveal();
    },

    switchBg: function(cls) {
      document.querySelectorAll('.noonbg, .duskbg, .nightbg').forEach(function(el) {
        el.className = cls;
      });
    },

    initTimeSlider: function() {
      var slider = document.getElementById('nsoTimeSlider');
      var current = document.getElementById('nsoTimeCurrent');
      var remain = document.getElementById('nsoTimeRemain');
      if (!slider || !current || !remain) return;
      var fmt = function(mins) {
        return String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');
      };
      var sync = function() {
        var min = Number(slider.min);
        var max = Number(slider.max);
        var val = Number(slider.value);
        slider.style.setProperty('--value', slider.value);
        current.textContent = fmt(val);
        var left = Math.max(max - val, 0);
        remain.textContent = 'Remaining: ' + Math.floor(left / 60) + 'h ' + String(left % 60).padStart(2, '0') + 'm';
      };
      slider.addEventListener('input', sync);
      sync();
    },

    initProgressBars: function() {
      var clamp = function(v, min, max) { return Math.min(Math.max(v, min), max); };
      var graphState = new WeakMap();
      var ensureGraph = function(el) {
        var state = graphState.get(el);
        if (state) return state;
        var canvas = el.querySelector('.nso-progress-canvas');
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvas.className = 'nso-progress-canvas';
          el.appendChild(canvas);
        }
        state = { canvas: canvas, history: [] };
        graphState.set(el, state);
        return state;
      };
      var drawGraph = function(el) {
        var state = ensureGraph(el);
        var canvas = state.canvas;
        var w = Math.max(1, Math.floor(el.clientWidth));
        var h = Math.max(1, Math.floor(el.clientHeight));
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        var max = Number(el.dataset.max || 100) || 100;
        var pixel = 3;
        var gw = Math.max(8, Math.floor(w / pixel));
        var gh = Math.max(8, Math.floor(h / pixel));
        var samples = gw;
        while (state.history.length < samples) state.history.push(Number(el.dataset.value || 0));
        if (state.history.length > samples) state.history.splice(0, state.history.length - samples);
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (!state.buffer) state.buffer = document.createElement('canvas');
        var buffer = state.buffer;
        if (buffer.width !== gw || buffer.height !== gh) { buffer.width = gw; buffer.height = gh; }
        var bctx = buffer.getContext('2d');
        if (!bctx) return;
        var fill = getComputedStyle(el).getPropertyValue('--nso-progress-fill').trim() || '#58a6d5';
        bctx.imageSmoothingEnabled = false;
        bctx.clearRect(0, 0, gw, gh);
        for (var x = 0; x < state.history.length; x += 1) {
          var value = clamp(state.history[x], 0, max);
          var y = gh - Math.round((value / max) * gh);
          var yy = Math.min(Math.max(y, 0), gh - 1);
          bctx.fillStyle = fill;
          bctx.fillRect(x, yy, 1, gh - yy);
        }
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(buffer, 0, 0, w, h);
      };
      var render = function(el, value) {
        var max = Number(el.dataset.max || 100) || 100;
        var next = clamp(Number(value) || 0, 0, max);
        el.dataset.value = String(next);
        var state = ensureGraph(el);
        state.history.push(next);
        drawGraph(el);
      };
      var animate = function(el, to, duration, onUpdate, onDone) {
        var max = Number(el.dataset.max || 100) || 100;
        var from = clamp(Number(el.dataset.value || 0), 0, max);
        var target = clamp(Number(to) || 0, 0, max);
        var start = performance.now();
        var step = function(t) {
          var p = Math.min((t - start) / Math.max(duration, 1), 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var current = from + (target - from) * eased;
          render(el, current);
          if (onUpdate) onUpdate(current, max);
          if (p < 1) requestAnimationFrame(step);
          else if (onDone) onDone();
        };
        requestAnimationFrame(step);
      };
      window.setNsoProgress = function(target, value, opts) {
        opts = opts || {};
        var el = typeof target === 'string' ? document.getElementById(target) : target;
        if (!el) return;
        if (opts.animate) { animate(el, value, Number(opts.duration) || 450, opts.onUpdate, opts.onDone); }
        else { render(el, value); if (opts.onUpdate) { var m = Number(el.dataset.max || 100) || 100; opts.onUpdate(Number(el.dataset.value || 0), m); } if (opts.onDone) opts.onDone(); }
      };
      document.querySelectorAll('.nso-progress[data-value]').forEach(function(el) { render(el, Number(el.dataset.value)); });
      window.addEventListener('resize', function() { document.querySelectorAll('.nso-progress[data-value]').forEach(function(el) { drawGraph(el); }); });
      var runPath = function(elId, txtId, points, duration, pause) {
        var el = document.getElementById(elId);
        var txt = document.getElementById(txtId);
        if (!el || !txt || !Array.isArray(points) || points.length < 2) return;
        var idx = 0;
        var step = function() { idx = (idx + 1) % points.length; window.setNsoProgress(el, points[idx], { animate: true, duration: duration, onUpdate: function(c, m) { txt.textContent = Math.round(c) + '/' + m; }, onDone: function() { setTimeout(step, pause); } }); };
        var max = Number(el.dataset.max || 100) || 100;
        txt.textContent = Math.round(Number(el.dataset.value || 0)) + '/' + max;
        setTimeout(step, pause);
      };
      runPath('barStress', 'barStressValue', [72, 8, 76, 22, 64], 900, 140);
      runPath('barAffection', 'barAffectionValue', [96, 35, 92, 48, 88], 1200, 180);
      runPath('barDarkness', 'barDarknessValue', [80, 12, 84, 20, 70], 1000, 160);
    },

    initTabs: function() {
      document.querySelectorAll('.nso-tabs__tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          var nav = tab.closest('.nso-tabs__nav');
          nav.querySelectorAll('.nso-tabs__tab').forEach(function(t) { t.classList.remove('nso-tabs__tab--active'); });
          tab.classList.add('nso-tabs__tab--active');
          var container = tab.closest('.nso-tabs');
          container.querySelectorAll('.nso-tabs__panel').forEach(function(p) { p.classList.remove('nso-tabs__panel--active'); });
          var target = document.getElementById(tab.dataset.tab);
          if (target) target.classList.add('nso-tabs__panel--active');
        });
      });
    },

    initToast: function() {
      window.showToast = function(msg, type) {
        var container = document.getElementById('toast-container');
        var toast = document.createElement('div');
        toast.className = 'nso-toast nso-toast--' + (type || 'info');
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(function() { toast.classList.add('nso-toast--out'); setTimeout(function() { toast.remove(); }, 400); }, 2500);
      };
    },

    initStreamChat: function() {
      var streamChatColor = '#4D23CD';
      var colorEls = document.querySelectorAll('#streamColors .nso-stream__chat-color');
      colorEls.forEach(function(c) {
        c.addEventListener('click', function() {
          colorEls.forEach(function(x) { x.classList.remove('nso-stream__chat-color--active'); });
          c.classList.add('nso-stream__chat-color--active');
          streamChatColor = c.dataset.color;
          var input = document.getElementById('streamChatInput');
          if (input) input.style.color = streamChatColor;
        });
      });
      var sendBtn = document.getElementById('streamChatSend');
      var chatInput = document.getElementById('streamChatInput');
      if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', function() {
          var text = chatInput.value.trim();
          if (!text) return;
          var list = document.getElementById('streamChatList');
          var msg = document.createElement('div');
          msg.className = 'nso-stream__chat-msg nso-stream__chat-msg--highlight';
          msg.innerHTML = '<span class="nso-stream__chat-user" style="color:' + streamChatColor + ';">you</span> <span class="nso-stream__chat-text" style="color:' + streamChatColor + ';">' + text.replace(/</g, '&lt;') + '</span>';
          list.appendChild(msg);
          list.scrollTop = list.scrollHeight;
          chatInput.value = '';
        });
        chatInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') sendBtn.click();
        });
      }
    },

    initSidebar: function() {
      var toggles = document.querySelectorAll('[data-sidebar-toggle]');
      toggles.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var target = document.querySelector(btn.dataset.sidebarToggle);
          if (target) target.classList.toggle('nso-sidebar--open');
        });
      });
      document.addEventListener('click', function(e) {
        var sidebar = document.querySelector('.nso-sidebar--open');
        if (!sidebar) return;
        if (!sidebar.contains(e.target) && !e.target.closest('[data-sidebar-toggle]')) {
          sidebar.classList.remove('nso-sidebar--open');
        }
      });
    },

    initDropdowns: function() {
      document.addEventListener('click', function(e) {
        var dd = e.target.closest('.nso-dropdown');
        if (dd) {
          document.querySelectorAll('.nso-dropdown--open').forEach(function(d) {
            if (d !== dd) d.classList.remove('nso-dropdown--open');
          });
          dd.classList.toggle('nso-dropdown--open');
          e.stopPropagation();
        } else {
          document.querySelectorAll('.nso-dropdown--open').forEach(function(d) { d.classList.remove('nso-dropdown--open'); });
        }
      });
    },

    initAccordions: function() {
      document.querySelectorAll('.nso-accordion').forEach(function(acc) {
        var header = acc.querySelector('.nso-accordion__header');
        if (!header) return;
        header.addEventListener('click', function() {
          acc.classList.toggle('nso-accordion--open');
        });
      });
    },

    initReveal: function() {
      var els = document.querySelectorAll('.reveal');
      if (!els.length || !window.IntersectionObserver) return;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      els.forEach(function(el) { observer.observe(el); });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { NSO.init(); });
  } else {
    NSO.init();
  }

  window.NSO = NSO;
})();
