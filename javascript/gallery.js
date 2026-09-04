let currentImagesArray = [];
let currentImageIndex = 0;
let currentScrollY = 0;

document.addEventListener("DOMContentLoaded", function () {
  
  // 1. FILTRIRANJE PROJEKATA
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.showcase-card');
  const dividers = document.querySelectorAll('.tech-divider');

  function updateDividers() {
    dividers.forEach(div => (div.style.display = 'none'));
    const visibleCards = Array.from(projectCards).filter(
      card => !card.classList.contains('hidden-card')
    );
    visibleCards.forEach((card, index) => {
      if (index < visibleCards.length - 1) {
        let nextElem = card.nextElementSibling;
        while (nextElem && !nextElem.classList.contains('tech-divider')) {
          nextElem = nextElem.nextElementSibling;
        }
        if (nextElem && nextElem.classList.contains('tech-divider')) {
          nextElem.style.display = 'flex';
        }
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedTag = btn.getAttribute('data-tag');

      projectCards.forEach(card => {
        const cardTags = card.getAttribute('data-tags') || "";
        if (selectedTag === 'all' || cardTags.includes(selectedTag)) {
          card.classList.remove('hidden-card');
          card.style.display = '';
        } else {
          card.classList.add('hidden-card');
          card.style.display = 'none'; 
        }
      });
      updateDividers();
    });
  });
  updateDividers();

  // 2. UPRAVLJANJE SLIKAMA U KARTICAMA I LIGHTBOX INTEGRACIJA
  projectCards.forEach(card => {
    const mainImg = card.querySelector('.showcase-main-img');
    const thumbs = card.querySelectorAll('.s-thumb');

    // Sigurnosna provera: Čuvamo originalnu sliku za B/A mod
    if (mainImg && !mainImg.hasAttribute('data-after-src')) {
        mainImg.setAttribute('data-after-src', mainImg.getAttribute('src'));
    }

    // Klik na malu sličicu
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        if (!mainImg) return;
        
        // Elementi za Before/After (Mogu biti null na običnim karticama)
        const baBefore = card.querySelector('.ba-img-before');
        const baInput = card.querySelector('.ba-slider-input');
        const baLine = card.querySelector('.ba-slider-line');
        const baLabels = card.querySelectorAll('.ba-label');
        
        const isBA = thumb.getAttribute('data-ba') === 'true' || thumb.classList.contains('ba-trigger-thumb');

        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        mainImg.style.opacity = '0.4';

        setTimeout(() => {
          if (isBA) {
            // PALIMO B/A MOD
            if (baBefore) baBefore.style.display = 'block';
            if (baInput) baInput.style.display = 'block';
            if (baLine) baLine.style.display = 'block';
            baLabels.forEach(lbl => lbl.style.display = 'block');
            
            const afterSrc = mainImg.getAttribute('data-after-src');
            if (afterSrc) mainImg.setAttribute('src', afterSrc);
            
            const sliderValue = baInput ? baInput.value : 50;
            // PRAVILAN clip-path: "After" slika se otkriva sa desne strane!
            mainImg.style.clipPath = `polygon(${sliderValue}% 0, 100% 0, 100% 100%, ${sliderValue}% 100%)`;
          } else {
            // GASIMO B/A MOD (I isključujemo liniju da ne ide preko slika)
            if (baBefore) baBefore.style.display = 'none';
            if (baInput) baInput.style.display = 'none';
            if (baLine) baLine.style.display = 'none';
            baLabels.forEach(lbl => lbl.style.display = 'none');
            mainImg.style.clipPath = 'none'; 
            
            const newSrc = thumb.getAttribute('src');
            if (newSrc) {
              mainImg.setAttribute('src', newSrc);
            }
          }
          
          mainImg.style.opacity = '1';
        }, 150);
      });
    });

    // Otvaranje Lightboxa klikom na Hero sliku
    const heroSection = card.querySelector('.showcase-hero');
    if (heroSection && mainImg) {
      heroSection.addEventListener('click', (e) => {
        // Blokiramo otvaranje ako je kliknuto tačno na slajder dugme/liniju
        if (e.target.classList.contains('ba-slider-input') || e.target.closest('.ba-slider-button')) return;

        // Pravimo niz samo od pravih sličica koristeći čiste atribute
        currentImagesArray = Array.from(thumbs)
          .filter(i => i.getAttribute('data-ba') !== 'true' && !i.classList.contains('ba-trigger-thumb'))
          .map(i => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt') }));

        if (currentImagesArray.length === 0) {
          currentImagesArray = [{ src: mainImg.getAttribute('src'), alt: mainImg.getAttribute('alt') }];
        }
        
        // Gađamo tačno onu sliku koja je trenutno na Hero panelu
        const currentSrc = mainImg.getAttribute('src');
        currentImageIndex = currentImagesArray.findIndex(item => item.src === currentSrc);
        
        // Ako je iz nekog razloga nema, vraća na nultu
        if (currentImageIndex === -1) currentImageIndex = 0;
        
        openLightbox();
      });
    }
  });

  // 3. BEFORE / AFTER SLIDER LOGIKA (SA TIMEROM ZA TEKST OD 3 SEKUNDE)
  const sliders = document.querySelectorAll('.ba-slider-container');
  sliders.forEach(slider => {
      const input = slider.querySelector('.ba-slider-input');
      const imgAfter = slider.querySelector('.ba-img-after');
      const sliderLine = slider.querySelector('.ba-slider-line');
      const labelBefore = slider.querySelector('.ba-label-before');
      const labelAfter = slider.querySelector('.ba-label-after');

      // Inicijalni set za "After" na desnoj strani i da tekstovi budu sakriveni dok se ne pomera
      if (input && imgAfter && sliderLine) {
         imgAfter.style.clipPath = `polygon(${input.value}% 0, 100% 0, 100% 100%, ${input.value}% 100%)`;
      }
      
      // Timer promenljiva za svaku karticu ponaosob
      let hideTimeout = null;

      if (!input || !imgAfter || !sliderLine) return;

      input.addEventListener('input', (e) => {
          const sliderValue = e.target.value;
          
          // Pomeranje maske i linije
          imgAfter.style.clipPath = `polygon(${sliderValue}% 0, 100% 0, 100% 100%, ${sliderValue}% 100%)`;
          sliderLine.style.left = `${sliderValue}%`;

          // 1. Čim korisnik pomeri slajder, prikaži slova (i ispoštuj pravilo da nestaju blizu samih ivica)
          if (labelBefore) labelBefore.style.opacity = sliderValue < 15 ? '0' : '1';
          if (labelAfter) labelAfter.style.opacity = sliderValue > 85 ? '0' : '1';

          // 2. Restartujemo prethodni tajmer da se ne bi sudarili
          clearTimeout(hideTimeout);

          // 3. Palimo novi tajmer na 3 sekunde (3000 ms)
          hideTimeout = setTimeout(() => {
              if (labelBefore) labelBefore.style.opacity = '0';
              if (labelAfter) labelAfter.style.opacity = '0';
          }, 2000);
      });
  });

  // 4. LIGHTBOX ELEMENTI I KONTROLE
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  function openLightbox() {
    if (!lightbox) return;
    lightbox.style.display = 'flex';
    lockScroll();
    setTimeout(() => lightbox.classList.add('active'), 10);
    updateLightboxImage();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    unlockScroll();
    setTimeout(() => lightbox.style.display = 'none', 300);
  }

  function updateLightboxImage() {
    if (!lightboxImg || currentImagesArray.length === 0) return;
    const currentData = currentImagesArray[currentImageIndex];
    if (currentData) {
        lightboxImg.src = currentData.src;
        lightboxImg.alt = currentData.alt;
    }
    const currentNumEl = document.getElementById('current-slide-num');
    const totalNumEl = document.getElementById('total-slides-num');
    if (currentNumEl && totalNumEl) {
        currentNumEl.textContent = currentImageIndex + 1;
        totalNumEl.textContent = currentImagesArray.length;
    }
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
      if (currentImagesArray.length === 0) return;
      currentImageIndex = (currentImageIndex + 1) % currentImagesArray.length;
      updateLightboxImage();
    });
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
      if (currentImagesArray.length === 0) return;
      currentImageIndex = (currentImageIndex - 1 + currentImagesArray.length) % currentImagesArray.length;
      updateLightboxImage();
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || (lightboxClose && lightboxClose.contains(e.target))) {
          closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
    if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
  });

  // 5. ZAKLJUČAVANJE I OTKLJUČAVANJE SKROLANJA
  function lockScroll() {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.documentElement.classList.add('is-locked');
    document.body.classList.add('is-locked');
  }

  function unlockScroll() {
    document.body.style.paddingRight = '';
    document.documentElement.classList.remove('is-locked');
    document.body.classList.remove('is-locked');
  }

  // 6. POVRATAK NA VRH
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      if (!document.body.classList.contains('gallery-page')) {
        e.preventDefault(); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

// 7. MOBILNI OFF-CANVAS MENI LOGIKA (ČISTA I JEDNOSTAVNA)
  const openBtn = document.getElementById('mobile-filter-open');
  const closeBtn = document.getElementById('mobile-filter-close');
  const filtersMenu = document.getElementById('showcase-filters-menu');
  const overlay = document.getElementById('mobile-filter-overlay');

  function openFilters() {
    if (filtersMenu && overlay) {
      filtersMenu.classList.add('mobile-active');
      overlay.classList.add('active');
    }
  }

  function closeFilters(scrollToTop = false) {
    if (filtersMenu && overlay) {
      filtersMenu.classList.remove('mobile-active');
      overlay.classList.remove('active');

      if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }

  if (openBtn) openBtn.addEventListener('click', openFilters);
  if (closeBtn) closeBtn.addEventListener('click', () => closeFilters(false));
  if (overlay) overlay.addEventListener('click', () => closeFilters(false));

  // Klik na tag zatvara meni i prebacuje na vrh
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        closeFilters(true);
      }
    });
  });

  // OSETLJIVIJI SCROLL-BLUR-REVEAL SAMO ZA GALERIJU
document.addEventListener('DOMContentLoaded', () => {
  const galleryCards = document.querySelectorAll('.gallery-page .scroll-blur-reveal');

  if (galleryCards.length === 0) return;

  // rootMargin od 250px širi zonu detekcije za 20-25% ranije
  const galleryObserverOptions = {
    root: null,
    rootMargin: '250px 0px 100px 0px',
    threshold: 0.01
  };

  const galleryObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, galleryObserverOptions);

  galleryCards.forEach((card, index) => {
    // PRVA KARTICA: Otkriva se instant pri učitavanju stranice
    if (index === 0) {
      card.classList.add('revealed');
    } else {
      galleryObserver.observe(card);
    }
  });
});

// --- TOUCH / SWIPE PODRŠKA ZA LIGHTBOX NA MOBILNOM ---
  const lightboxModal = document.getElementById('lightbox-modal');
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  if (lightboxModal) {
    lightboxModal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleLightboxSwipe();
    }, { passive: true });
  }

  function handleLightboxSwipe() {
    const xDiff = touchStartX - touchEndX;
    const yDiff = touchStartY - touchEndY;
    const minSwipeDistance = 40; // Minimalna dužina poteza prstom

    // Proveravamo da li je potez bio pretežno horizontalan (da ne okida pri vertikalnom skrolu)
    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > minSwipeDistance) {
      if (xDiff > 0) {
        // Prevlačenje ulevo -> Sledeća slika
        const nextBtn = document.querySelector('.lightbox-next');
        if (nextBtn) nextBtn.click();
      } else {
        // Prevlačenje udesno -> Prethodna slika
        const prevBtn = document.querySelector('.lightbox-prev');
        if (prevBtn) prevBtn.click();
      }
    }
  }
  
});