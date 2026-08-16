(() => {
  const progress = document.querySelector('.page-progress span');
  const updateProgress = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.width = `${Math.min(100, Math.max(0, scrollY / scrollable * 100))}%`;
  };

  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  document.getElementById('print-resume').addEventListener('click', () => window.print());

  const copyButton = document.getElementById('copy-email');
  const toast = document.querySelector('.copy-toast');
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.copy);
      toast.classList.add('is-visible');
      setTimeout(() => toast.classList.remove('is-visible'), 1800);
    } catch (error) {
      location.href = `mailto:${copyButton.dataset.copy}`;
    }
  });

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-category]')];
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(item => item.classList.toggle('is-active', item === button));
      projects.forEach(project => {
        const categories = project.dataset.category.split(/\s+/);
        project.hidden = filter !== 'all' && !categories.includes(filter);
      });
    });
  });
})();
