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
        const pdfURL = result.filePath;
        if (!pdfURL) {
            console.error('Invalid PDF URL:', pdfURL);
        }
        const bookTitle = file.name.replace('.pdf', '');

        let imageThumbnail;

        try {
            console.log('PDF URL passed to extractFirstImage:', pdfURL);
            // Attempt to extract the first page's image
            imageThumbnail = await extractFirstImage(pdfURL);
        } catch (error) {
            console.error('Error while generating thumbnail:', error.message || error);
            // Fallback to default placeholder image
            imageThumbnail = 'assets/error.png';
        }

        // Create and display the book element
        const bookElement = createBookElement(bookTitle, file, imageThumbnail);
        booksContainer.appendChild(bookElement);

    } catch (error) {
        console.error(error.message || error);
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

async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:3000/pdfs'); // Fetch metadata from server
        const pdfs = await response.json();
        console.log('PDFs fetched:', pdfs);

        for (const pdf of pdfs) {
            try {
                const pdfURL = pdf.s3Url; // Use the public URL from the database
                const title = pdf.title;

                // Generate a thumbnail for the book
                let thumbnail;
                try {
                    thumbnail = await extractFirstImage(pdfURL);
                } catch (error) {
                    console.error('Error generating thumbnail, using default:', error.message || error);
                    thumbnail = 'assets/error.png'; // Fallback thumbnail
                }

                // Create and add the book element to the page
                const bookElement = createBookElement(title, pdfURL, thumbnail);
                booksContainer.appendChild(bookElement);
            } catch (error) {
                console.error('Error processing book:', error.message || error);
            }
        }
    } catch (error) {
        console.error('Failed to fetch PDFs:', error.message || error);
    }
}

fetchBooks().then(r => console.log('Books fetched')).catch(e => console.error('Error fetching books:', e.message || e));