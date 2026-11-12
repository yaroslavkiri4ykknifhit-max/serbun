(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = $('#header');
  const progress = $('#progressFill');
  const heroImage = $('#heroVisual');

  // Small visual touches, with one animation frame per scroll event.
  let frameQueued = false;
  function onScroll() {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 25);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${total > 0 ? Math.min(100, Math.max(0, (y / total) * 100)) : 0}%`;
      if (!reducedMotion && innerWidth > 760 && y < 1000) {
        heroImage.style.transform = `scale(1.04) translate3d(0, ${Math.min(55, y * 0.075)}px, 0)`;
      }
      frameQueued = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // Mobile menu: accessible expanded state and keyboard dismissal.
  const toggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  const openMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mobileMenu.classList.toggle('open', open);
    mobileMenu.inert = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) $('.mobile-menu a')?.focus();
  };
  toggle?.addEventListener('click', () => openMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('.mobile-menu a').forEach(link => link.addEventListener('click', () => openMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      openMenu(false);
      toggle.focus();
    }
  });
  matchMedia('(min-width: 761px)').addEventListener?.('change', e => { if (e.matches) openMenu(false); });

  // Graceful appearance of content in viewport.
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible');
        observer.unobserve(target);
      });
    }, { threshold: .06, rootMargin: '0px 0px -26px 0px' });
    $$('[data-reveal]').forEach(el => revealObserver.observe(el));
  } else {
    $$('[data-reveal]').forEach(el => el.classList.add('is-visible'));
  }

  // Active navigation links.
  const sections = ['formats', 'approach', 'about'].map(id => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('.nav a').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { threshold: .1, rootMargin: '-27% 0px -62% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Service card glow follows mouse inside each card only.
  if (!reducedMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.service-card').forEach(card => card.addEventListener('pointermove', e => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - box.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - box.top}px`);
    }));
  }

  // Process tabs: each click changes the actual content, not a visual decoration.
  const steps = [
    {
      number: '01', kicker: 'ЭТАП 01 / ЗНАКОМИМСЯ',
      title: 'Сначала слушаем.',
      body: 'Обсуждаем повод, людей, площадку, дату и бюджет. Уточняем, какое ощущение должно остаться у гостей после вечера.',
      outcome: 'На выходе: понятная задача и следующий шаг.'
    },
    {
      number: '02', kicker: 'ЭТАП 02 / ИЩЕМ ИДЕЮ',
      title: 'Собираем программу.',
      body: 'Выбираем настроение события, продумываем ход вечера, формат выступлений и моменты, которые станут его основой.',
      outcome: 'На выходе: концепция, формат и предварительный план.'
    },
    {
      number: '03', kicker: 'ЭТАП 03 / ГОТОВИМ ДЕТАЛИ',
      title: 'Связываем всё вместе.',
      body: 'Уточняем состав команды, задачи подрядчиков, технические требования и последовательность действий. Проверяем важное заранее.',
      outcome: 'На выходе: рабочий сценарий и подготовленная команда.'
    },
    {
      number: '04', kicker: 'ЭТАП 04 / ВСТРЕЧАЕМ ГОСТЕЙ',
      title: 'Теперь можно прожить момент.',
      body: 'Контролируем ход программы и реагируем на то, что происходит вживую. Ваша задача — быть в событии, а не заниматься организационными вопросами.',
      outcome: 'На выходе: событие, которое состоялось так, как задумано.'
    }
  ];
  const tabs = $$('.process-tab');
  function showStep(index, focus = false) {
    const step = steps[index];
    if (!step) return;
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.classList.toggle('is-current', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    $('#processNumber').textContent = step.number;
    const body = $('#processPanelBody');
    body.innerHTML = '';
    const kicker = document.createElement('span'); kicker.className = 'process-kicker'; kicker.textContent = step.kicker;
    const h3 = document.createElement('h3'); h3.textContent = step.title;
    const p = document.createElement('p'); p.textContent = step.body;
    const outcome = document.createElement('span'); outcome.className = 'process-output'; outcome.textContent = step.outcome;
    body.append(kicker, h3, p, outcome);
    body.classList.remove('is-switching');
    void body.offsetWidth;
    if (!reducedMotion) body.classList.add('is-switching');
    $('#processPanel').setAttribute('aria-labelledby', `processTab${index}`);
    $('#processLineFill').style.width = `${(index + 1) * 25}%`;
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showStep(index));
    tab.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? steps.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + steps.length) % steps.length;
      showStep(next, true);
    });
  });

  // Accordion keeps the content manageable.
  $$('.faq-list details').forEach(detail => detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    $$('.faq-list details').filter(other => other !== detail).forEach(other => { other.open = false; });
  }));

  // Animated 20 years statistic.
  if ('IntersectionObserver' in window && !reducedMotion) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const duration = 950;
        function tick(now) {
          const x = Math.min(1, (now - start) / duration);
          const easing = 1 - Math.pow(1 - x, 3);
          el.textContent = String(Math.round(target * easing));
          if (x < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    }, { threshold: .25 });
    $$('[data-count]').forEach(el => counterObserver.observe(el));
  }

  // Connect settings can be edited in config.js without changing any HTML.
  const cfg = window.SITE_CONFIG || {};
  const yt = String(cfg.youtube || 'https://www.youtube.com/@aktivacia');
  if (/^https:\/\//.test(yt)) {
    ['youtubeLink', 'footerYoutube'].forEach(id => { const el = document.getElementById(id); if (el) el.href = yt; });
  }
  const whatsapp = String(cfg.whatsapp || '').replace(/\D/g, '');
  const telegram = String(cfg.telegram || '').replace(/^@/, '').trim();
  const email = String(cfg.email || '').trim();
  const channelsReady = Boolean(whatsapp || telegram || email);
  const formFootnote = $('#formFootnote');
  if (channelsReady) formFootnote.textContent = 'После заполнения выберите удобный способ связи. Сайт откроет ваш мессенджер или почту с подготовленным текстом.';

  const webhookUrl = String(cfg.leadWebhook || '').trim();
  const consent = $('#leadConsent');
  if (webhookUrl) {
    consent.closest('.lead-consent').style.display = 'flex';
    $('#briefSubmitText').textContent = 'Отправить заявку';
    formFootnote.textContent = 'Заявка поступит команде Александра.';
  }

  // The site never pretends to send a request if contact settings are absent.
  const form = $('#briefForm');
  const dialog = $('#briefDialog');
  const output = $('#briefOutput');
  const copyButton = $('#copyBrief');
  const actions = $('#dialogActions');
  const dialogNote = $('#dialogNote');
  let activeBrief = '';
  const addDialogLink = (label, href) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = `${label} ↗`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    actions.appendChild(a);
  };
  form?.addEventListener('input', e => {
    const field = e.target.closest('.field');
    if (field) field.classList.remove('is-invalid');
  });
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#guestName');
    const contact = $('#guestContact');
    let firstInvalid = null;
    [name, contact].forEach(el => {
      const invalid = !el.value.trim();
      el.closest('.field').classList.toggle('is-invalid', invalid);
      if (invalid && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }
    const type = $('#eventType').value || 'Пока не определились';
    const date = $('#eventDate').value.trim() || 'Уточним';
    const message = $('#eventMessage').value.trim() || 'Обсудим лично';
    activeBrief = `Здравствуйте, Александр! Хочу обсудить мероприятие.\n\nИмя: ${name.value.trim()}\nКонтакт: ${contact.value.trim()}\nФормат: ${type}\nДата: ${date}\nДетали: ${message}`;
    if(webhookUrl){
      if(!consent?.checked){ consent?.focus(); return; }
      const button = form.querySelector('[type=submit]');
      button.disabled=true;
      const old=button.innerHTML;
      button.textContent='Отправляем...';
      try{
        const response=await fetch(webhookUrl,{
          method:'POST',
          headers:{'Content-Type':'text/plain;charset=UTF-8'},
          body:JSON.stringify({
            name:name.value.trim(),contact:contact.value.trim(),type,date,
            message, consent:true,companyWebsite:$('#companyWebsite')?.value||''
          })
        });
        const data=await response.json();
        if(!response.ok || !data.ok)throw new Error(data.error||'Сервер не подтвердил приём заявки');
        output.value=`Имя: ${name.value.trim()}\nКонтакт: ${contact.value.trim()}\nФормат: ${type}\nДата: ${date}\nДетали: ${message}`;
        $('#dialogMessage').textContent='Заявка отправлена. Александр или его команда свяжутся с вами.';
        dialogNote.textContent='Отправлено через форму сайта.';
        $$('.dialog-actions a').forEach(a=>a.remove());
        copyButton.textContent='Скопировать заявку';
        dialog.showModal();
        form.reset();
        return;
      }catch(e){
        alert('Не получилось отправить заявку. Попробуйте ещё раз или свяжитесь напрямую. '+e.message);
        return;
      }finally{button.disabled=false;button.innerHTML=old;}
    }

    output.value = activeBrief;
    $('#dialogMessage').textContent = channelsReady ? 'Выберите, куда отправить сообщение. Текст заявки подготовлен.' : 'Текст заявки готов. Позвоните Александру по номеру в разделе контактов.';
    dialogNote.textContent = channelsReady ? 'Если выбираете Telegram, сначала скопируйте текст и вставьте его в чат.' : 'Скопируйте текст, чтобы сохранить детали мероприятия.';
    $$('.dialog-actions a').forEach(a => a.remove());
    if (whatsapp) addDialogLink('WhatsApp', `https://wa.me/${whatsapp}?text=${encodeURIComponent(activeBrief)}`);
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) addDialogLink('Почта', `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Заявка на мероприятие')}&body=${encodeURIComponent(activeBrief)}`);
    if (telegram && /^[a-zA-Z0-9_]{5,32}$/.test(telegram)) addDialogLink('Telegram', `https://t.me/${telegram}`);
    copyButton.textContent = 'Скопировать текст';
    dialog.showModal();
  });
  async function copyText(value) {
    try { await navigator.clipboard.writeText(value); return true; }
    catch {
      output.focus(); output.select();
      try { return document.execCommand('copy'); } catch { return false; }
    }
  }
  copyButton?.addEventListener('click', async () => {
    const copied = await copyText(activeBrief);
    copyButton.textContent = copied ? 'Скопировано ✓' : 'Выделите текст выше и скопируйте';
  });
  $('#closeDialog')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
})();
