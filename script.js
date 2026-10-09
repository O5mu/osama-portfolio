// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Hairline under the header once the page scrolls
const header = document.querySelector('.top');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Copy-to-clipboard buttons
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = 'Copied';
      btn.classList.add('is-done');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('is-done');
      }, 1800);
    } catch {
      window.location.href = 'mailto:' + btn.dataset.copy;
    }
  });
});
