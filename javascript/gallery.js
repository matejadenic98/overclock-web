// Globalne varijable za praćenje slika u Lightboxu
let currentImagesArray = [];
let currentImageIndex = 0;
let currentScrollY = 0;

document.addEventListener("DOMContentLoaded", function () {
  
  // 1. FILTRIRANJE PROJEKATA
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.showcase-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedTag = btn.getAttribute('data-tag');

      projectCards.forEach(card => {
        const cardTags = card.getAttribute('data-tags');
        if (selectedTag === 'all' || cardTags.includes(selectedTag)) {
          card.classList.remove('hidden-card');
        } else {
          card.classList.add('hidden-card');
        }
      });
    });
  });

  // 2. UPRAVLJANJE SLIKAMA U KARTICAMA I LIGHTBOX INTEGRACIJA
  projectCards.forEach(card => {
    const mainImg = card.querySelector('.showcase-main-img');
    const thumbs = card.querySelectorAll('.s-thumb');

    // Klik na malu sličicu menja glavnu sliku u okviru kartice
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const newSrc = thumb.getAttribute('src');
        mainImg.style.opacity = '0.4';
        setTimeout(() => {
          mainImg.setAttribute('src', newSrc);
          mainImg.style.opacity = '1';
        }, 150);

        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    // Klik na glavnu sliku otvara Lightbox sa svim sličicama te kartice
    if (mainImg) {
      mainImg.closest('.showcase-image-wrapper').style.cursor = 'zoom-in';
      mainImg.closest('.showcase-image-wrapper').addEventListener('click', () => {
        // Skupljamo sve sličice iz te kartice u niz za Lightbox slider
        currentImagesArray = Array.from(thumbs).map(i => ({ src: i.src, alt: i.alt }));
        
        // Ako nema thumbnail-ova, uzimamo bar glavnu sliku
        if (currentImagesArray.length === 0) {
          currentImagesArray = [{ src: mainImg.src, alt: mainImg.alt }];
        }

        const currentSrc = mainImg.getAttribute('src');
        currentImageIndex = currentImagesArray.findIndex(item => item.src === currentSrc);
        if (currentImageIndex === -1) currentImageIndex = 0;

        openLightbox();
      });
    }
  });

  // 3. LIGHTBOX ELEMENTI I KONTROLE
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  function openLightbox() {
    if (!lightbox) return;
    lightbox.style.display = 'flex';
    lockScroll(); // Zaključava skrol pozadine[cite: 3, 4]

    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    updateLightboxImage();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    unlockScroll(); // Otključava skrol pozadine[cite: 3, 4]

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

    // Ažuriranje brojača u plutajućoj kapsuli
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

  // 4. MOBILNI SWIPE GESTOVI
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
    const swipeThreshold = 40;
    if (touchEndX < touchStartX - swipeThreshold) {
      if (lightboxNext) lightboxNext.click();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      if (lightboxPrev) lightboxPrev.click();
    }
  }
});

// 5. FUNKCIJE ZA ZAKLJUČAVANJE I OTKLJUČAVANJE SKROLANJA (Bez treptanja)
function lockScroll() {
  // Računamo širinu scrollbara kako stranica ne bi "skočila" ulevo kada scrollbar nestane
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  document.body.style.paddingRight = `${scrollbarWidth}px`;
  
  // Stavljamo zabranu skrolovanja bez ikakvog pomeranja stranice
  document.documentElement.classList.add('is-locked');
  document.body.classList.add('is-locked');
}

function unlockScroll() {
  // Sklanjamo zabrane i vraćamo sve u normalu
  document.body.style.paddingRight = '';
  
  document.documentElement.classList.remove('is-locked');
  document.body.classList.remove('is-locked');
}
  /* =========================================
     4. GLATKI POVRATAK NA VRH
     ========================================= */
  const backToTopBtn = document.querySelector('.back-to-top-btn');

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      // Ako ste na galeriji, href vodi na Hero početnog ekrana
      if (document.body.classList.contains('gallery-page')) {
        // Ništa ne radi, HTML odrađuje posao
      } else {
        // Ako ste na početnom ekranu, glatko skrolovanje
        e.preventDefault(); 
        window.scrollTo({
          top: 0,
          behavior: 'smooth' 
        });
      }
    });
  }

document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.showcase-card');
  const dividers = document.querySelectorAll('.tech-divider');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Menjanje aktivnog dugmeta
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const selectedTag = button.getAttribute('data-tag');

      // 1. Filtriranje kartica
      cards.forEach(card => {
        const cardTags = card.getAttribute('data-tags') || '';

        if (selectedTag === 'all' || cardTags.includes(selectedTag)) {
          card.classList.remove('hidden-card');
          card.style.display = ''; // Vraća podrazumevani prikaz
        } else {
          card.classList.add('hidden-card');
          card.style.display = 'none'; // Osigurava da kartica ne zauzima prostor
        }
      });

      // 2. Ažuriranje separatora na osnovu trenutno VIDLJIVIH kartica
      updateDividers();
    });
  });

  // Funkcija koja pametno prikazuje separatore samo između vidljivih kartica
  function updateDividers() {
    // Sakrivamo sve separatore prvo
    dividers.forEach(div => (div.style.display = 'none'));

    // Pronalazimo sve kartice koje su trenutno vidljive
    const visibleCards = Array.from(cards).filter(
      card => !card.classList.contains('hidden-card')
    );

    // Dodeljujemo separatore samo između vidljivih kartica
    visibleCards.forEach((card, index) => {
      // Ako nije poslednja vidljiva kartica, prikaži separator ispod nje
      if (index < visibleCards.length - 1) {
        // Tražimo prvi sledeći .tech-divider u DOM-u iza ove kartice
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

  // Pokrećemo proveru i pri inicijalnom učitavanju stranice
  updateDividers();
});
