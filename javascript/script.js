// Globalne varijable za praćenje slika u Lightboxu (Moraju biti na vrhu)
let currentImagesArray = [];
let currentImageIndex = 0;

document.addEventListener("DOMContentLoaded", function () {
  
  // 1. UPRAVLJANJE KARTICAMA PROJEKATA I GLERIJOM
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
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    updateLightboxImage();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
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
      if (e.target === lightbox || e.target === lightboxClose) {
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
  

  // 3. SIGURAN MEHANIZAM ZA GRADUALNO ZATAMNJIVANJE NAVIGACIJE
  const navElement = document.querySelector(".main-navigation");
  // Sigurna provera: uzmi parentElement samo ako navElement zapravo postoji
  const header = navElement ? navElement.parentElement : null; 
  const contactSection = document.querySelector(".contact-section") || document.querySelector("#kontakt");

  // Skripta radi samo ako su oba ključna elementa uspešno pronađena na stranici
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