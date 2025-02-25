import * as pdfjsLib from './libs/pdfjs/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = './libs/pdfjs/pdf.worker.mjs';

async function extractFirstImage(pdfUrl) {
    try {
        // Load the PDF
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        // Get the first page of the PDF
        const page = await pdf.getPage(1);

        // Create a canvas to render the page
        const viewport = page.getViewport({scale: 1});
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d');

        // Render the page onto the canvas
        const render = page.render({canvasContext: context, viewport: viewport});
        await render.promise;

        // Convert canvas content to a Base64 image
        return canvas.toDataURL('image/jpeg');
    } catch (error) {
        console.error('Error extracting image: ', error.message || error);
        throw error;
    }
}

export {extractFirstImage};