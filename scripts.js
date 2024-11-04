import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = [...books];

// Utility functions
const createElement = (tag, classNames = '', attributes = {}, innerHTML = '') => {
    const element = document.createElement(tag);
    if (classNames) element.className = classNames;
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    element.innerHTML = innerHTML;
    return element;
};

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

const renderDropdown = (data, selectElement, defaultText) => {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(createElement('option', '', { value: 'any' }, defaultText));
    for (const [id, name] of Object.entries(data)) {
        fragment.appendChild(createElement('option', '', { value: id }, name));
    }
    selectElement.appendChild(fragment);
};

const applyTheme = (theme) => {
    const isNight = theme === 'night';
    document.documentElement.style.setProperty('--color-dark', isNight ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', isNight ? '10, 10, 20' : '255, 255, 255');
};

// Initial render
renderBooks(matches);
renderDropdown(genres, document.querySelector('[data-search-genres]'), 'All Genres');
renderDropdown(authors, document.querySelector('[data-search-authors]'), 'All Authors');

// Theme preference
const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
document.querySelector('[data-settings-theme]').value = theme;
applyTheme(theme);

// Update "Show more" button
const updateShowMoreButton = () => {
    const remaining = matches.length - (page * BOOKS_PER_PAGE);
    const button = document.querySelector('[data-list-button]');
    button.innerHTML = `<span>Show more</span><span class="list__remaining"> (${remaining > 0 ? remaining : 0})</span>`;
    button.disabled = remaining <= 0;
};
updateShowMoreButton();

// Event Listeners
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

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

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    applyTheme(theme);
    document.querySelector('[data-settings-overlay]').open = false;
});

// Search form
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
document.querySelector('[data-list-button]').addEventListener('click', () => {
    const newPageBooks = matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);
    renderBooks(newPageBooks);
    page += 1;
    updateShowMoreButton();
});

// Book preview handling
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

