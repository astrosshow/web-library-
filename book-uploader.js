const uploadButton = document.getElementById('upload-button')
const uploadInput = document.getElementById('upload-pdf')
const booksContainer = document.getElementById('books-container')

uploadButton.addEventListener('click', () => {
    const files = uploadInput.files;

    if (!files.length) {
        alert('Please select a file to upload.')
    }

    Array.from(files).forEach((file) => {
        if (file.type !== 'application/pdf') {
            alert(`${file.name} is not a valid PDF.`)
        }

        const bookTitle = file.name.replace('.pdf', '')
        const bookElement = createBookElement(bookTitle, file);
        booksContainer.appendChild(bookElement)
    })

    uploadInput.value = '';
})

function createBookElement(title, file) {
    const bookDiv = document.createElement('div');
    bookDiv.className = 'book';

    const bookTitle = document.createElement('h3');
    bookTitle.textContent = title;

    const bookImage = document.createElement('img');
    // Hardcoded: Replace URL
    bookImage.src = 'https://via.placeholder.com/150';
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