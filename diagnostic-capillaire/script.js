document.addEventListener('DOMContentLoaded', () => {
    // ─── Loading Screen ───
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hidden'), 1800);
    });
    // Fallback if load already fired
    if (document.readyState === 'complete') {
        setTimeout(() => loader.classList.add('hidden'), 1800);
    }

    // ─── Generate Floating Particles ───
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 12 + 's';
        p.style.animationDuration = (8 + Math.random() * 10) + 's';
        p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
        particlesContainer.appendChild(p);
    }

    // ─── Scroll Reveal ───
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ─── Header Scroll Effect ───
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 80);
    });

    // ─── Stat Counter Animation ───
    const animateCounters = () => {
        document.querySelectorAll('.stat-number').forEach(counter => {
            const target = counter.textContent;
            if (counter.dataset.animated) return;
            counter.dataset.animated = 'true';

            // Only animate pure numbers or percentages
            const numMatch = target.match(/^([\d.]+)/);
            if (!numMatch) return;

            const num = parseFloat(numMatch[1]);
            const suffix = target.replace(numMatch[1], '');
            const duration = 2000;
            const start = performance.now();

            const update = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = num >= 100
                    ? Math.floor(eased * num)
                    : (eased * num).toFixed(num % 1 ? 1 : 0);
                counter.textContent = current + suffix;
                if (progress < 1) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) statsObserver.observe(statsBar);

    // ─── File Upload Display ───
    const photoInput = document.getElementById('photo');
    const fileNameDisplay = document.getElementById('file-name');

    photoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = `✓ ${e.target.files[0].name}`;
            fileNameDisplay.style.color = '#4ade80';
        } else {
            fileNameDisplay.textContent = 'Cliquez ou glissez votre photo ici';
            fileNameDisplay.style.color = '';
        }
    });

    // ─── Form Submission ───
    const uploadForm = document.getElementById('upload-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusMessage = document.getElementById('status-message');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Analyse en cours…';
        statusMessage.className = 'status-message hidden';

        const formData = new FormData(uploadForm);

        try {
            const webhookUrl = 'https://hook.eu1.make.com/l6d4abesasg551cymc1fx5mst4k33v5j';
            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                statusMessage.textContent = '✓ Analyse lancée avec succès ! Votre diagnostic exclusif arrive dans votre boîte mail.';
                statusMessage.className = 'status-message success';
                statusMessage.classList.remove('hidden');
                uploadForm.reset();
                fileNameDisplay.textContent = 'Cliquez ou glissez votre photo ici';
                fileNameDisplay.style.color = '';
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            statusMessage.textContent = 'Un problème technique est survenu. Veuillez réessayer dans un instant.';
            statusMessage.className = 'status-message error';
            statusMessage.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});
