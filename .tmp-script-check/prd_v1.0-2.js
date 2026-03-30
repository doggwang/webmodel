
        document.querySelectorAll('button:not([type])').forEach((button) => {
            button.type = 'button';
        });

        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.overlay');
        const contentPanel = document.querySelector('.content');
        const backToTopButton = document.getElementById('backToTop');
        let isBackToTopTicking = false;

        function toggleSidebar() {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
            contentPanel.classList.toggle('expanded');
        }

        function closeSidebar() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            contentPanel.classList.remove('expanded');
        }

        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        function handleIframeError(iframeId) {
            const container = document.getElementById(iframeId);
            const iframe = container.querySelector('iframe');
            const errorDiv = container.querySelector('.iframe-error');

            if (iframe && errorDiv) {
                iframe.style.display = 'none';
                errorDiv.style.display = 'block';
                container.classList.add('error');
            }
        }

        function zoomMermaid(button, delta) {
            const container = button.closest('.mermaid-container');
            const mermaidContent = container.querySelector('.mermaid-content');
            const currentScale = parseFloat(mermaidContent.dataset.scale) || 1;
            const newScale = Math.max(0.5, Math.min(2, currentScale + delta));
            mermaidContent.style.transform = `scale(${newScale})`;
            mermaidContent.dataset.scale = String(newScale);
        }

        function resetMermaid(button) {
            const container = button.closest('.mermaid-container');
            const mermaidContent = container.querySelector('.mermaid-content');
            mermaidContent.style.transform = 'scale(1)';
            mermaidContent.dataset.scale = '1';
        }

        function updateBackToTopVisibility() {
            backToTopButton.classList.toggle('visible', window.scrollY > 300);
            isBackToTopTicking = false;
        }

        window.addEventListener('scroll', () => {
            if (isBackToTopTicking) {
                return;
            }

            isBackToTopTicking = true;
            window.requestAnimationFrame(updateBackToTopVisibility);
        }, { passive: true });

        updateBackToTopVisibility();
    