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

  // 3. Projects Catalog Carousel & Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const projectsGrid = document.getElementById('projectsGrid');
  const projectsPrevBtn = document.getElementById('projectsPrevBtn');
  const projectsNextBtn = document.getElementById('projectsNextBtn');

  function updateCarouselArrows() {
    if (!projectsGrid) return;
    const maxScroll = projectsGrid.scrollWidth - projectsGrid.clientWidth;
    if (projectsPrevBtn) projectsPrevBtn.disabled = projectsGrid.scrollLeft <= 5;
    if (projectsNextBtn) projectsNextBtn.disabled = projectsGrid.scrollLeft >= maxScroll - 5;
  }

  if (projectsGrid) {
    projectsGrid.addEventListener('scroll', updateCarouselArrows);
    window.addEventListener('resize', updateCarouselArrows);
  }

  if (projectsPrevBtn && projectsGrid) {
    projectsPrevBtn.addEventListener('click', () => {
      const cardWidth = projectsGrid.querySelector('.project-card')?.offsetWidth || 340;
      projectsGrid.scrollBy({ left: -(cardWidth + 28), behavior: 'smooth' });
    });
  }

  if (projectsNextBtn && projectsGrid) {
    projectsNextBtn.addEventListener('click', () => {
      const cardWidth = projectsGrid.querySelector('.project-card')?.offsetWidth || 340;
      projectsGrid.scrollBy({ left: cardWidth + 28, behavior: 'smooth' });
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      if (projectsGrid) {
        projectsGrid.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(updateCarouselArrows, 300);
      }
    });
  });

  // Initial state check for carousel arrows
  updateCarouselArrows();

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
        if (modalId === 'quizModal') {
          // Triggered directly via Header or Hero button
          targetModal.setAttribute('data-from-quiz', 'false');
        } else if (modalId === 'consultModal') {
          const projectCard = trigger.closest('.project-card');
          if (projectCard) {
            const title = projectCard.querySelector('.project-title')?.textContent?.trim() || '';
            targetModal.setAttribute('data-project-name', title);
            const modalTitleEl = document.getElementById('consultModalTitle');
            if (modalTitleEl) {
              modalTitleEl.textContent = title ? `Узнать больше о проекте "${title}"` : 'Узнать больше о проекте';
            }
          }
        }
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

  const quizLabelMap = {
    area: {
      'up-100': 'до 100 м²',
      '100-150': '100–150 м²',
      '150-200': '150–200 м²',
      '200-plus': 'от 200 м²'
    },
    type: {
      'box': 'Под усадку / Коробка',
      'warm': 'Теплый контур',
      'turnkey': 'Под ключ'
    },
    material: {
      'gasblock': 'Газоблок',
      'brick': 'Кирпич',
      'ceramic': 'Керамоблок'
    }
  };

  // Option selection handling with auto-advance
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

      // Auto advance to next step or finish
      setTimeout(() => {
        if (currentStep < totalSteps) {
          currentStep++;
          updateQuizUI();
        } else {
          // Open Quiz Lead Submission Modal (marked as submitted from quiz flow)
          const quizModal = document.getElementById('quizModal');
          if (quizModal) {
            quizModal.setAttribute('data-from-quiz', 'true');
            quizModal.classList.add('active');
            document.body.style.overflow = 'hidden';
          }
        }
      }, 200);
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
        // Open Quiz Lead Submission Modal (marked as submitted from quiz flow)
        const quizModal = document.getElementById('quizModal');
        if (quizModal) {
          quizModal.setAttribute('data-from-quiz', 'true');
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

  // Parse URL GET parameters for tracking
  const urlParams = new URLSearchParams(window.location.search);
  const trackingParams = {
    partner: urlParams.get('partner') || 'direct',
    source: urlParams.get('source') || 'website'
  };

  // 7. Contact & Lead Form Submission Handlers (Web3Forms API Integration)
  const leadForms = document.querySelectorAll('.lead-form');
  const WEB3FORMS_ACCESS_KEY = "4946df71-ee36-487a-ac81-6b07b05fd0fc";

  leadForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      const formData = new FormData(form);
      formData.append("access_key", WEB3FORMS_ACCESS_KEY);

      // Delete consent & privacy checkboxes from payload so they aren't sent in email
      formData.delete("consent");
      formData.delete("privacy");

      // Append background tracking parameters
      formData.append("partner", trackingParams.partner);
      formData.append("source", trackingParams.source);

      // Append preferred messenger if present in active toggle (using Latin key to avoid email encoding corruption)
      const activeMessenger = form.querySelector('.radio-toggle.active');
      if (activeMessenger) {
        const messengerName = activeMessenger.getAttribute('data-type') || activeMessenger.textContent.trim();
        formData.append("Messenger", messengerName);
      }

      const formType = form.getAttribute('data-form-type');

      if (formType === 'quiz') {
        const quizModal = form.closest('#quizModal');
        const isFromQuiz = quizModal ? quizModal.getAttribute('data-from-quiz') === 'true' : false;

        if (isFromQuiz) {
          formData.append("subject", "Zayavka na raschet stoimosti (Quiz) - PSH76");
          formData.append("Quiz_Area", quizLabelMap.area[quizState.area] || quizState.area);
          formData.append("Quiz_Package", quizLabelMap.type[quizState.type] || quizState.type);
          formData.append("Quiz_Material", quizLabelMap.material[quizState.material] || quizState.material);
        } else {
          formData.append("subject", "Zayavka s saita - PSH76");
        }
      } else if (formType === 'project') {
        const modal = form.closest('#consultModal');
        const projectName = modal ? modal.getAttribute('data-project-name') : '';
        if (projectName) {
          formData.append("subject", `Zayavka po proektu "${projectName}" - PSH76`);
          formData.append("Project", projectName);
        } else {
          formData.append("subject", "Zayavka po proektu - PSH76");
        }
      } else {
        formData.append("subject", "Zayavka na konsultatsiyu - PSH76");
      }

      submitBtn.textContent = "Отправка...";
      submitBtn.disabled = true;

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
          form.reset();

          // Close any active modal
          modalOverlays.forEach(modal => modal.classList.remove('active'));

          // Show Success Modal
          const successModal = document.getElementById('successModal');
          if (successModal) {
            successModal.classList.add('active');
            document.body.style.overflow = 'hidden';
          } else {
            alert("Спасибо! Ваша заявка успешно отправлена.");
          }
        } else {
          alert("Ошибка при отправке: " + (data.message || "Попробуйте позже."));
        }
      } catch (error) {
        console.error("Web3Forms submission error:", error);
        alert("Произошла ошибка при отправке заявки. Проверьте подключение к интернету и попробуйте снова.");
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
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

  // 9. Phone Number Mask (+7 (XXX) XXX-XX-XX)
  function initPhoneMasks() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');

    function getInputNumbersValue(input) {
      return input.value.replace(/\D/g, '');
    }

    function onPhoneInput(e) {
      let input = e.target;
      let inputNumbersValue = getInputNumbersValue(input);
      let formattedInputValue = "";
      let selectionStart = input.selectionStart;

      if (!inputNumbersValue) {
        return input.value = "";
      }

      if (input.value.length !== selectionStart) {
        if (e.data && /\D/g.test(e.data)) {
          input.value = inputNumbersValue;
        }
        return;
      }

      if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
        if (inputNumbersValue[0] === "9") inputNumbersValue = "7" + inputNumbersValue;
        let firstSymbols = (inputNumbersValue[0] === "8") ? "8" : "+7";
        formattedInputValue = firstSymbols + " ";

        if (inputNumbersValue.length > 1) {
          formattedInputValue += "(" + inputNumbersValue.substring(1, 4);
        }
        if (inputNumbersValue.length >= 5) {
          formattedInputValue += ") " + inputNumbersValue.substring(4, 7);
        }
        if (inputNumbersValue.length >= 8) {
          formattedInputValue += "-" + inputNumbersValue.substring(7, 9);
        }
        if (inputNumbersValue.length >= 10) {
          formattedInputValue += "-" + inputNumbersValue.substring(9, 11);
        }
      } else {
        formattedInputValue = "+" + inputNumbersValue.substring(0, 16);
      }

      input.value = formattedInputValue;
    }

    function onPhoneKeyDown(e) {
      let input = e.target;
      if (e.keyCode === 8 && getInputNumbersValue(input).length === 1) {
        input.value = "";
      }
    }

    function onPhonePaste(e) {
      let input = e.target,
        inputNumbersValue = getInputNumbersValue(input);
      let pasted = e.clipboardData || window.clipboardData;
      if (pasted) {
        let pastedText = pasted.getData('Text');
        if (/\D/g.test(pastedText)) {
          input.value = inputNumbersValue;
          return;
        }
      }
    }

    phoneInputs.forEach(input => {
      input.addEventListener('input', onPhoneInput);
      input.addEventListener('keydown', onPhoneKeyDown);
      input.addEventListener('paste', onPhonePaste);
    });
  }

  initPhoneMasks();
});
