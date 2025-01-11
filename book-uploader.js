import {extractFirstImage} from "./pdf-title-image.js";

// Get references to key DOM elements
const uploadButton = document.getElementById('upload-button')
const uploadInput = document.getElementById('upload-pdf')
const booksContainer = document.getElementById('books-container')

uploadButton.addEventListener('click', async () => {
    const files = uploadInput.files;

    if (!files.length) {
        alert('Please select a file to upload.')
    }

    for (const file of files) {
        if (file.type !== 'application/pdf') {
            alert('Not a valid PDF file.');
        }

        const bookTitle = file.name.replace('.pdf', '');

        // Extract first image from pdf
        const pdfURL = URL.createObjectURL(file);
        let bookImageURL = 'https://via.placeholder.com/150';

        try {
            bookImageURL = (await extractFirstImage(pdfURL)) || bookImageURL;
        } catch (error) {
            console.error(`Error extracting image from ${bookTitle}:`, error);
        }

        const bookElement = createBookElement(bookTitle, file, bookImageURL);
        booksContainer.appendChild(bookElement);
    }

    uploadInput.value = '';
})

function createBookElement(title, file, bookImageURL) {
    const bookDiv = document.createElement('div');
    bookDiv.className = 'book';

    const bookTitle = document.createElement('h3');
    bookTitle.textContent = title;

    const bookImage = document.createElement('img');
    // Hardcoded: Replace URL
    bookImage.src = bookImageURL;
    bookImage.alt = title;

    // PDF viewer
    const pdfViewer = document.createElement('iframe');
    pdfViewer.className = 'pdf-viewer';
    pdfViewer.src = ''

    bookImage.addEventListener('click', () => {
        if (pdfViewer.style.display === 'none') {
            pdfViewer.src = URL.createObjectURL(file);
            pdfViewer.style.display = 'block';
        } else {
            pdfViewer.style.display = 'none'
        }
    })

    bookDiv.appendChild(bookImage);
    bookDiv.appendChild(bookTitle);
    bookDiv.appendChild(pdfViewer);

    return bookDiv;
}