document.addEventListener('DOMContentLoaded', () => {
  let curtain = document.getElementById('page-transition-curtain');
  if (!curtain) {
    curtain = document.createElement('div');
    curtain.id = 'page-transition-curtain';
    document.body.appendChild(curtain);
  }

  const pageLinks = document.querySelectorAll('a[href$=".html"]');

  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetUrl = link.getAttribute('href');

      if (targetUrl && !targetUrl.startsWith('#') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();

        // Podižemo zavesu sa dna
        curtain.classList.add('slide-up');

        setTimeout(() => {
          window.location.href = targetUrl;
        }, 350);
      }
    });
  });
});

window.addEventListener('pageshow', (event) => {
  const curtain = document.getElementById('page-transition-curtain');
  if (curtain) {
    curtain.classList.remove('slide-up');
  }
});