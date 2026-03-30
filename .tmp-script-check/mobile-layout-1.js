
        document.querySelectorAll('button:not([type])').forEach((button) => {
            button.type = 'button';
        });

        const mobileContainer = document.querySelector('.mobile-container');
        const moreToolsBtn = document.getElementById('more-tools-btn');
        const moreToolsPanel = document.getElementById('more-tools-panel');
        const hotspotPanel = document.getElementById('hotspot-panel');
        const measureHint = document.getElementById('measure-hint');
        const interactiveToolButtons = ['rotate-btn', 'pan-btn', 'measure-btn', 'area-btn', 'delete-all-btn']
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        function setActiveTool(activeButton) {
            interactiveToolButtons.forEach((button) => {
                button.classList.toggle('active', button === activeButton);
            });

            const shouldShowMeasureHint = activeButton && (activeButton.id === 'measure-btn' || activeButton.id === 'area-btn');
            measureHint.classList.toggle('hidden', !shouldShowMeasureHint);
        }

        function hideTransientPanels() {
            hotspotPanel.classList.add('hidden');
            moreToolsPanel.classList.add('hidden');
            moreToolsBtn.classList.remove('active');
        }

        moreToolsBtn.addEventListener('click', () => {
            moreToolsPanel.classList.toggle('hidden');
            moreToolsBtn.classList.toggle('active');
        });

        interactiveToolButtons.forEach((button) => {
            button.addEventListener('click', () => {
                setActiveTool(button);
            });
        });

        document.querySelectorAll('.scene-btn').forEach((button) => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.scene-btn').forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
            });
        });

        document.querySelectorAll('.hotspot').forEach((hotspot) => {
            hotspot.addEventListener('click', () => {
                hotspotPanel.classList.remove('hidden');
            });
        });

        mobileContainer.addEventListener('click', (event) => {
            if (!event.target.closest('.hotspot') && !event.target.closest('.info-panel') && !event.target.closest('.tool-btn')) {
                hideTransientPanels();
            }
        });
    