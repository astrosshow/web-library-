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

    // Store PDF file as a URL to 'data-pdf-url'
    const pdfURL = URL.createObjectURL(file);
    bookDiv.setAttribute('data-pdf-url', pdfURL);

    // Open the PDF in a new tab when the book is clicked
    bookImage.addEventListener('click', () => {
        window.open(pdfURL, '_blank');
    })

    bookDiv.appendChild(bookImage);
    bookDiv.appendChild(bookTitle);

    return bookDiv;
}