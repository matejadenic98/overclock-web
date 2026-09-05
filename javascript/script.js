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
          img.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImagesArray = Array.from(allSlidesImgs).map(i => ({ src: i.getAttribute('src') || i.src, alt: i.getAttribute('alt') || i.alt }));
            currentImageIndex = index;
            openLightbox();
          });
        });
      }
    });
  }

  // 2. LIGHTBOX ELEMENTI I KONTROLE (PRESLA preslikana LOGIKA SA GALLERY.JS)
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  function openLightbox() {
    if (!lightbox) return;
    lightbox.style.display = 'flex';
    lockScroll();
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    updateLightboxImage();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
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

  // 3. TOUCH / SWIPE LOGIKA SA ISTIM PRAGOM I PREPOZNAVANJEM OSE KAO NA GALLERY.JS
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleLightboxSwipe();
    }, { passive: true });
  }

  function handleLightboxSwipe() {
    const xDiff = touchStartX - touchEndX;
    const yDiff = touchStartY - touchEndY;
    const minSwipeDistance = 40;

    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > minSwipeDistance) {
      if (xDiff > 0) {
        if (lightboxNext) lightboxNext.click();
      } else {
        if (lightboxPrev) lightboxPrev.click();
      }
    }
  }

  // 4. MEHANIZAM ZA NAVIGACIJU
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

// 5. ZAKLJUČAVANJE SKROLA (ISTOVETNO KAO U GALLERY.JS)
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