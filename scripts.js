import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';
//state variables
let page = 1;//page: Keeps track of the current page of books displayed. Initially, it starts at 1.

//Stores the filtered list of books to be displayed. Initially, it holds all books.
let matches = [...books];//spread operator: Holds the list of books that match the current filters. Initially, it contains all the books


//This Utility function (createElement) creates HTML elements with optional classes, attributes, and inner HTML content
//This function simplifies the process of creating HTML elements dynamically.
//Takes parameters for tag (e.g., div, button), classNames (CSS classes), attributes (additional HTML attributes), and innerHTML (content to insert inside the element).
//Uses document.createElement to create the element, then applies the class names, attributes, and inner HTML if provided.
//Finally, returns the created element.
const createElement = (tag, classNames = '', attributes = {}, innerHTML = '') => {
    const element = document.createElement(tag);
    if (classNames) element.className = classNames;
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    element.innerHTML = innerHTML;
    return element;
};

//Purpose is to renders a list of book preview buttons, each containing a book's image, title, and author.
//Parameters: Takes a bookList to display.
//How: Loops through the bookList, creates a button for each book, and appends it to the DOM.
//The function renders a list of books as preview buttons.
//bookList.slice(0, BOOKS_PER_PAGE) limits the books displayed to the specified number of books per page.
//For each book, it creates a button containing an image, title, and author information, and appends it to the DOM.
//createElement is used to create each button dynamically.
const renderBooks = (bookList) => {
    const fragment = document.createDocumentFragment();
    for (const { author, id, image, title } of bookList.slice(0, BOOKS_PER_PAGE)) {
        const button = createElement('button', 'preview', { 'data-preview': id }, `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `);
        fragment.appendChild(button);
    }
    document.querySelector('[data-list-items]').appendChild(fragment);
};

//Purpose: Renders dropdown lists for genres and authors.
//How: It Creates an option for each genre/author, starting with a default "any" option.
//This function generates dropdown menus for selecting genres or authors.
//It starts by adding a default option (like "All Genres") with a value of 'any'.
//Then it loops through the data (either genres or authors) and creates an option element for each, which is added to the dropdown (selectElement).
const renderDropdown = (data, selectElement, defaultText) => {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(createElement('option', '', { value: 'any' }, defaultText));
    for (const [id, name] of Object.entries(data)) {
        fragment.appendChild(createElement('option', '', { value: id }, name));
    }
    selectElement.appendChild(fragment);
};

//Purpose: Applies a dark or light theme to the page by updating CSS custom properties (--color-dark and --color-light).
//This function applies a dark or light theme by modifying CSS custom properties (--color-dark, --color-light).
//It checks the theme value ('night' for dark mode, 'day' for light mode) and sets the CSS custom properties accordingly.
const applyTheme = (theme) => {
    const isNight = theme === 'night';
    document.documentElement.style.setProperty('--color-dark', isNight ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', isNight ? '10, 10, 20' : '255, 255, 255');
};

// Initial render
//Purpose: Initially, render all books, genres, and authors dropdowns on page load.
//Initially, the code renders all books, genres, and authors on the page.
//It uses renderBooks to display the books and renderDropdown to populate the genre and author dropdowns.
renderBooks(matches);
renderDropdown(genres, document.querySelector('[data-search-genres]'), 'All Genres');
renderDropdown(authors, document.querySelector('[data-search-authors]'), 'All Authors');

// Theme preference
//This code detects if the user prefers a dark theme (prefers-color-scheme: dark) using window.matchMedia.
//Based on this, it sets the theme ('night' for dark or 'day' for light) and applies it using the applyTheme function.
const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
document.querySelector('[data-settings-theme]').value = theme;
applyTheme(theme);

// Update "Show more" button
//The Purpose: Updates the "Show More" button text and disables it if there are no more books to load.
//This function updates the "Show More" button to show how many more books can be loaded.
//It calculates how many books are left to load and disables the button if there are no more books to show.
const updateShowMoreButton = () => {
    const remaining = matches.length - (page * BOOKS_PER_PAGE);
    const button = document.querySelector('[data-list-button]');
    button.innerHTML = `<span>Show more</span><span class="list__remaining"> (${remaining > 0 ? remaining : 0})</span>`;
    button.disabled = remaining <= 0;
};
updateShowMoreButton();


//Event Listeners:
//The code listens for various user interactions, such as opening search and settings overlays, submitting the search form, and handling the "load more" button click.
//data-search-cancel, data-settings-cancel, etc.:
//Purpose: Closes the search or settings overlay when the cancel button is clicked.
//These event listeners control the opening and closing of search and settings overlays.
//When the user clicks the cancel button, the corresponding overlay is closed (open = false).
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

//Purpose: Opens the search overlay when the search button is clicked and focuses the search title input.
document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});

//This event listener handles the search form submission.
//It filters the books array based on the selected genre, title, and author. The filtered list (matches) is re-rendered.
//It also resets the page number to 1 and updates the "Show More" button.
document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    applyTheme(theme);
    document.querySelector('[data-settings-overlay]').open = false;
});

// Search form
//Purpose: Handles the search form submission, filters books based on the selected genre, author, and title, and re-renders the book list
//This event listener handles the search form submission.
//It filters the books array based on the selected genre, title, and author. The filtered list (matches) is re-rendered.
//It also resets page number to 1 and updates the "Show More" button.
document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    matches = books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return genreMatch && titleMatch && authorMatch;
    });
    page = 1;
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', matches.length === 0);
    document.querySelector('[data-list-items]').innerHTML = '';
    renderBooks(matches);
    updateShowMoreButton();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
});

// Load more books
//Purpose: Loads more books when the "show More" button is clicked.updates the displayd books and increments the page number.
//This event listener handles the "Show More" button click.
//It loads more books by slicing the matches array based on the current page, increments the page number, and updates the "Show More" button.
document.querySelector('[data-list-button]').addEventListener('click', () => {
    const newPageBooks = matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);
    renderBooks(newPageBooks);
    page += 1;
    updateShowMoreButton();
});

// Book preview handling
//Purpose: Displays a book preview when a user clicks on a book preview button. It opens a detailed view of the book with its image, title, author, and description.
//This event listener handles clicks on book preview buttons.
//When a book is clicked, a detailed preview is shown in a modal with the book's image, title, author, and description.
document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const previewId = event.target.closest('[data-preview]')?.dataset?.preview;
    if (previewId) {
        const activeBook = books.find(book => book.id === previewId);
        if (activeBook) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = activeBook.image;
            document.querySelector('[data-list-image]').src = activeBook.image;
            document.querySelector('[data-list-title]').innerText = activeBook.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[activeBook.author]} (${new Date(activeBook.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = activeBook.description;
        }
    }
});

// Initial render for authors and genres
renderDropdown(genres, document.querySelector('[data-search-genres]'), 'All Genres');
renderDropdown(authors, document.querySelector('[data-search-authors]'), 'All Authors');
//The renderDropdown function will render a dropdown menu inside the DOM element with the data-search-genres attribute. 
//The dropdown will be populated with the items from genres, and the label 'All Genres' may be set as a default option.





