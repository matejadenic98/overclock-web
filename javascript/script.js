// Globalne varijable za praćenje slika u Lightboxu (Moraju biti na vrhu)
let currentImagesArray = [];
let currentImageIndex = 0;
let currentScrollY = 0;

document.addEventListener("DOMContentLoaded", function () {
  
  // 1. UPRAVLJANJE KARTICAMA PROJEKATA I GALERIJOM
  const projects = document.querySelectorAll('.gallery-project');
  if (projects.length > 0) {
    projects.forEach(project => {
      const slider = project.querySelector('.project-slider');
      const prevBtn = project.querySelector('.prev-arrow');
      const nextBtn = project.querySelector('.next-arrow');
      const allSlidesImgs = project.querySelectorAll('.slide img').length > 0 
          ? project.querySelectorAll('.slide img') 
          : project.querySelectorAll('img');

      if (slider && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' });
        });
      }

      if (allSlidesImgs.length > 0) {
        allSlidesImgs.forEach((img, index) => {
          img.style.cursor = 'zoom-in';
          img.addEventListener('click', () => {
            currentImagesArray = Array.from(allSlidesImgs).map(i => ({ src: i.src, alt: i.alt }));
            currentImageIndex = index;
            openLightbox();
          });
        });
      }
    });
  }

  // 2. LIGHTBOX ELEMENTI I FUNKCIJE
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  function openLightbox() {
    if (!lightbox) return;
    lightbox.style.display = 'flex';

    // Zaključavamo skrol pozadine
    lockScroll();

    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    updateLightboxImage();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');

    // Otključavamo skrol pozadine
    unlockScroll();

    setTimeout(() => {
        lightbox.style.display = 'none';
    }, 300);
  }

  function updateLightboxImage() {
    if (!lightboxImg || currentImagesArray.length === 0) return;
    const currentData = currentImagesArray[currentImageIndex];
    if (currentData) {
        lightboxImg.src = currentData.src;
        lightboxImg.alt = currentData.alt;
    }
    // NOVA LOGIKA ZA DOCK BROJAČ
    const currentNumEl = document.getElementById('current-slide-num');
    const totalNumEl = document.getElementById('total-slides-num');
    if (currentNumEl && totalNumEl) {
        currentNumEl.textContent = currentImageIndex + 1; /* Prikazuje trenutnu sliku */
        totalNumEl.textContent = currentImagesArray.length; /* Prikazuje ukupan broj slika u tom redu */
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
      // Proverava da li je kliknuta pozadina ILI bilo šta unutar X dugmeta
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

  // SWIPE GESTOVI ZA MOBILNI LIGHTBOX (Sada unutar DOMContentLoaded!)
  let touchStartX = 0;
  let touchEndX = 0;

  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 40; // Minimalna distanca u px da bi se priznao swipe
    if (touchEndX < touchStartX - swipeThreshold) {
      // Prevlačenje ulevo -> Sledeća slika
      if (lightboxNext) lightboxNext.click();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Prevlačenje udesno -> Prethodna slika
      if (lightboxPrev) lightboxPrev.click();
    }
  }

  // 3. SIGURAN MEHANIZAM ZA GRADUALNO ZATAMNJIVANJE NAVIGACIJE
  const navElement = document.querySelector(".main-navigation");
  const header = navElement ? navElement.parentElement : null; 
  const contactSection = document.querySelector(".contact-section") || document.querySelector("#kontakt");

  if (contactSection && header) {
    const options = {
        root: null,
        threshold: 0.2 
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting && window.scrollY > contactSection.offsetTop) {
                header.classList.add("nav-dark-theme");
            } else {
                header.classList.remove("nav-dark-theme");
            }
        });
    }, options);

    observer.observe(contactSection);
  }
});

// 4. FUNKCIJE ZA ZAKLJUČAVANJE I OTKLJUČAVANJE SKROLANJA
function lockScroll() {
  currentScrollY = window.scrollY || document.documentElement.scrollTop;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  document.documentElement.style.setProperty('--scroll-y', `-${currentScrollY}px`);
  document.body.style.paddingRight = `${scrollbarWidth}px`;
  document.body.classList.add('is-locked');
}

function unlockScroll() {
  document.body.classList.remove('is-locked');
  document.body.style.paddingRight = '';

  window.scrollTo({
    top: currentScrollY,
    left: 0,
    behavior: 'instant'
  });
}