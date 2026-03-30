
        document.querySelectorAll('button:not([type])').forEach((button) => {
            button.type = 'button';
        });

        const uploadZone = document.getElementById('upload-zone');
        const uploadProgress = document.getElementById('upload-progress');
        const uploadSuccess = document.getElementById('upload-success');
        const uploadError = document.getElementById('upload-error');
        const retryButton = uploadError.querySelector('button');
        let uploadTimerId = null;

        function showUploadZone() {
            clearTimeout(uploadTimerId);
            uploadProgress.classList.add('hidden');
            uploadSuccess.classList.add('hidden');
            uploadError.classList.add('hidden');
            uploadZone.classList.remove('hidden');
        }

        function startMockUpload() {
            clearTimeout(uploadTimerId);
            uploadError.classList.add('hidden');
            uploadSuccess.classList.add('hidden');
            uploadZone.classList.add('hidden');
            uploadProgress.classList.remove('hidden');

            uploadTimerId = setTimeout(() => {
                uploadProgress.classList.add('hidden');
                uploadSuccess.classList.remove('hidden');
            }, 3000);
        }

        uploadZone.addEventListener('dragover', (event) => {
            event.preventDefault();
            uploadZone.classList.add('drag-over');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });

        uploadZone.addEventListener('drop', (event) => {
            event.preventDefault();
            uploadZone.classList.remove('drag-over');
            startMockUpload();
        });

        uploadZone.addEventListener('click', () => {
            startMockUpload();
        });

        uploadZone.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            startMockUpload();
        });

        retryButton.addEventListener('click', () => {
            showUploadZone();
        });
    