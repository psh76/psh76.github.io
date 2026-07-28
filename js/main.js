/* ==========================================================================
   QALA FORGE - INTERACTIVE JAVASCRIPT APP LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (burgerBtn && mobileDrawer) {
    burgerBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('active');
      const isOpen = mobileDrawer.classList.contains('active');
      burgerBtn.innerHTML = isOpen ? '✕' : '☰';
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
        burgerBtn.innerHTML = '☰';
      });
    });
  }

  // 2. Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.startsWith('#popup') || targetId.startsWith('#modal')) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 75;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 3. Projects Catalog Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Modal Window Controls
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const modalCloses = document.querySelectorAll('.modal-close');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  modalCloses.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      modalOverlays.forEach(modal => modal.classList.remove('active'));
      document.body.style.overflow = 'auto';
    });
  });

  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  });

  // 5. Interactive Multi-Step Quiz Calculator
  let currentStep = 1;
  const totalSteps = 3;
  const quizSteps = document.querySelectorAll('.quiz-step');
  const progressDots = document.querySelectorAll('.progress-dot');
  const progressFill = document.querySelector('.quiz-progress-fill');
  const prevBtn = document.getElementById('quizPrevBtn');
  const nextBtn = document.getElementById('quizNextBtn');

  // Quiz selections storage
  const quizState = {
    area: '150-200',
    type: 'box',
    material: 'gasblock'
  };

  // Option selection handling
  document.querySelectorAll('.quiz-option').forEach(option => {
    option.addEventListener('click', function () {
      const parentStep = this.closest('.quiz-step');
      parentStep.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');

      const paramKey = this.getAttribute('data-key');
      const paramVal = this.getAttribute('data-val');
      if (paramKey && paramVal) {
        quizState[paramKey] = paramVal;
      }
    });
  });

  function updateQuizUI() {
    quizSteps.forEach((step, idx) => {
      step.classList.toggle('active', idx + 1 === currentStep);
    });

    progressDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx + 1 <= currentStep);
    });

    if (progressFill) {
      progressFill.style.width = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;
    }

    if (prevBtn) {
      prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    if (nextBtn) {
      nextBtn.textContent = currentStep === totalSteps ? 'Получить расчёт' : 'Далее →';
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        currentStep++;
        updateQuizUI();
      } else {
        // Open Quiz Lead Submission Modal
        const quizModal = document.getElementById('quizModal');
        if (quizModal) {
          quizModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateQuizUI();
      }
    });
  }

  // 6. Messenger Radio Toggle in Contact Forms
  const radioToggles = document.querySelectorAll('.radio-toggle');
  radioToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const parent = toggle.closest('.radio-toggle-group');
      parent.querySelectorAll('.radio-toggle').forEach(t => t.classList.remove('active'));
      toggle.classList.add('active');
    });
  });

  // 7. Contact & Lead Form Submission Handlers
  const leadForms = document.querySelectorAll('.lead-form');
  leadForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        form.reset();

        // Close any active modal
        modalOverlays.forEach(modal => modal.classList.remove('active'));

        // Show Success Toast Modal
        const successModal = document.getElementById('successModal');
        if (successModal) {
          successModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }, 800);
    });
  });

  // 8. Cookie Banner Dismissal
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieOkBtn = document.getElementById('cookieOkBtn');

  if (cookieOkBtn && cookieBanner) {
    cookieOkBtn.addEventListener('click', () => {
      cookieBanner.style.display = 'none';
    });
  }
});
