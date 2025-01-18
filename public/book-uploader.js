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

    const file = files[0];

    if (file.type !== 'application/pdf') {
        alert('Not a valid PDF file.');
    }

    // Match 'file' with multer's field name
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to upload PDF file.')
        }

        const result = await response.json();
        alert(result.message);

        // Generate PDF URL
        const pdfURL = `http://localhost:3000${result.filePath}`;
        const bookTitle = file.name.replace('.pdf', '');

        let imageThumbnail;

        try {
            // Attempt to extract the first page's image
            imageThumbnail = await extractFirstImage(pdfURL);
        } catch (error) {
            console.error('Error while generating thumbnail:', error.message || error);
            // Fallback to default placeholder image
            imageThumbnail = '/error.png'; // Replace with a valid image path
        }

        // Create and display the book element
        const bookElement = createBookElement(bookTitle, file, imageThumbnail);
        booksContainer.appendChild(bookElement);

    } catch (error) {
        console.error('Error uploading PDF file: ', error.message || error);
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