document.body.classList.add('js');
document.getElementById('year').textContent = new Date().getFullYear();
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.section, .manifesto, .topic, .show').forEach((el) => observer.observe(el));
