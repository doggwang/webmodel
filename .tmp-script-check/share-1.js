
        document.querySelectorAll('button:not([type])').forEach((button) => {
            button.type = 'button';
        });

        const copyBtn = document.getElementById('copy-btn');
        const copySuccess = document.getElementById('copy-success');
        const shareLinkInput = document.getElementById('share-link-input');
        const validityBtns = document.querySelectorAll('[data-validity-btn]');
        const passwordToggle = document.getElementById('password-toggle');
        const passwordInput = document.getElementById('password-input');

        async function copyShareLink() {
            try {
                await navigator.clipboard.writeText(shareLinkInput.value);
            } catch (error) {
                shareLinkInput.focus();
                shareLinkInput.select();
                document.execCommand('copy');
                shareLinkInput.setSelectionRange(0, 0);
                shareLinkInput.blur();
            }

            copySuccess.classList.remove('hidden');
            setTimeout(() => {
                copySuccess.classList.add('hidden');
            }, 2000);
        }

        copyBtn.addEventListener('click', copyShareLink);

        validityBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                validityBtns.forEach((item) => {
                    item.classList.remove('border-2', 'border-orange-500', 'bg-orange-50', 'text-orange-500');
                    item.classList.add('border', 'border-gray-300');
                });
                btn.classList.remove('border', 'border-gray-300');
                btn.classList.add('border-2', 'border-orange-500', 'bg-orange-50', 'text-orange-500');
            });
        });

        passwordToggle.addEventListener('change', () => {
            passwordInput.disabled = !passwordToggle.checked;
            if (passwordToggle.checked) {
                passwordInput.focus();
            }
        });
    