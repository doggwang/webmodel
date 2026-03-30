
        document.querySelectorAll('button:not([type])').forEach((button) => {
            button.type = 'button';
        });

        function showError(errorId) {
            document.querySelectorAll('[data-error-panel]').forEach((element) => {
                element.classList.add('hidden');
            });
            document.getElementById(errorId).classList.remove('hidden');
        }

        document.querySelectorAll('[data-error-target]').forEach((button) => {
            button.addEventListener('click', () => {
                showError(button.dataset.errorTarget);
            });
        });
    