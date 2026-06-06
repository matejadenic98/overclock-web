// Selektujemo sve kartice projekata na stranici
  document.querySelectorAll('.gallery-project').forEach(project => {
    const slider = project.querySelector('.project-slider');
    const prevBtn = project.querySelector('.prev-arrow');
    const nextBtn = project.querySelector('.next-arrow');

    // Ako u kartici postoje slajder i strelice, povezujemo ih
    if (slider && prevBtn && nextBtn) {
      
      // Klik na desnu strelicu -> pomeri slajder udesno za širinu jedne slike
      nextBtn.addEventListener('click', () => {
        slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
      });

      // Klik na levu strelicu -> pomeri slajder ulevo za širinu jedne slike
      prevBtn.addEventListener('click', () => {
        slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' });
      });
    }
  });

  // Globalne varijable za praćenje slika u Lightboxu
  let currentImagesArray = [];
  let currentImageIndex = 0;
  
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  // 1. POPULACIJA I UPRAVLJANJE KARTICAMA PROJEKATA
  document.querySelectorAll('.gallery-project').forEach(project => {
    const slider = project.querySelector('.project-slider');
    const prevBtn = project.querySelector('.prev-arrow');
    const nextBtn = project.querySelector('.next-arrow');
    const allSlidesImgs = project.querySelectorAll('.slide img');

    // Funkcije za strelice na samim karticama
    if (slider && prevBtn && nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Sprečava otvaranje modala na klik strelice
        slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
      });

      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' });
      });
    }

    // Klik na bilo koju sliku unutar ovog projekta otvara Lightbox
    allSlidesImgs.forEach((img, index) => {
      img.style.cursor = 'zoom-in'; // Dodajemo kursor lupe za zumiranje
      img.addEventListener('click', () => {
        // Kreiramo niz putanja svih slika samo iz OVOG projekta
        currentImagesArray = Array.from(allSlidesImgs).map(i => ({ src: i.src, alt: i.alt }));
        currentImageIndex = index;
        
        openLightbox();
      });
    });
  });

  // 2. LIGHTBOX FUNKCIJE
  function openLightbox() {
    lightbox.style.display = 'flex';
    // Mali timeout omogućava CSS-u da uhvati prelaz i glatko odradi animaciju
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    updateLightboxImage();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    // Čekamo da prođe CSS tranzicija (300ms) pa tek onda gasimo display
    setTimeout(() => {
        lightbox.style.display = 'none';
    }, 300);
  }

  function updateLightboxImage() {
    const currentData = currentImagesArray[currentImageIndex];
    if (currentData) {
        lightboxImg.src = currentData.src;
        lightboxImg.alt = currentData.alt;
    }
  }

  // Navigacija unutar modala (Sledeća slika)
  lightboxNext.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % currentImagesArray.length;
    updateLightboxImage();
  });

  // Navigacija unutar modala (Prethodna slika)
  lightboxPrev.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + currentImagesArray.length) % currentImagesArray.length;
    updateLightboxImage();
  });

  // Zatvaranje na klik sa strane (na crni prostor) ili na X dugme
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxClose) {
        closeLightbox();
    }
  });

  // DODATAK: Zatvaranje na ESC tastature i listanje na strelice tastature (Za vrhunski desktop osećaj)
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lightboxNext.click();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
  });