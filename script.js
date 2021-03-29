// Defining a baseURL and key as part of the request URL

const baseURL = 'https://core.ac.uk:443/api-v2/articles/search/';
const key = 'kzUnEaLtS35oMQ0lw2xmKYNuHZscJe4C';
let url;

// Grab references to all the DOM elements 

const searchQuery = document.querySelector('.search');
const searchForm = document.querySelector('form');

const nextBtn = document.querySelector('.next');
const previousBtn = document.querySelector('.prev');

const section = document.querySelector('section');
const nav = document.querySelector('nav');

// Hide the "Previous"/"Next" navigation, as it's not required immediately
nav.style.display = 'none';

// define the initial page number and status of the navigation being displayed
let pageNumber = 0;

// Event listeners
searchForm.addEventListener('submit', submitSearch);

// pagination
nextBtn.addEventListener('click', nextPage);
previousBtn.addEventListener('click', previousPage);

function nextPage(e) {
    pageNumber++;
    fetchResults(e);
};

function previousPage(e) {
    if (pageNumber > 0) {
        pageNumber--;
    } else {
        return;
    }
    fetchResults(e);
};


function submitSearch(e) {
    pageNumber = 0;
    fetchResults(e);
}

function fetchResults(e) {
    // Use preventDefault() to stop the form submitting
    e.preventDefault();

    // Assemble the full URL
    url = baseURL + searchQuery.value + '?page=1' + '&pageSize=10' + '&metadata=true' + '&fulltext=false' + '&urls=true' + '&apiKey=' + key;

    // Use fetch() to make the request to the API
    fetch(url).then(function (result) {
        return result.json();
    }).then(function (json) {
        displayResults(json);
    });
}

function displayResults(json) {
    while (section.firstChild) {
        section.removeChild(section.firstChild);
    }

    const articles = json.data;
    const totalArticles = document.createElement('div');

    if (!articles) {
        totalArticles.textContent = 'No articles found.'
        section.appendChild(totalArticles);
    } else {

        // display total number of articles found
        totalArticles.innerHTML = `<strong>${json.totalHits}</strong> articles found.`
        totalArticles.classList.add('totalArticles')
        section.appendChild(totalArticles);

        for (var i = 0; i < articles.length; i++) {

            let current = articles[i];

            const article = document.createElement('article');

            // display main article heading with link
            const heading = document.createElement('h2');
            const link = document.createElement('a');
            if (current.downloadUrl) { // check if the download link exists
                link.href = current.downloadUrl;
            } else {
                link.href = current.fulltextUrls[1]; // provide alternative external link
            }
            link.setAttribute('target', '_blank')
            link.textContent = current.title;
            article.appendChild(heading);
            heading.appendChild(link);

            // display image media
            const img = document.createElement('img');
            img.src = 'http://core.ac.uk/image/' + current.id + '/medium';
            img.alt = current.title;
            article.appendChild(img);

            // display various details about articles
            const details = document.createElement('div');
            details.classList.add('details')
            if (current.publisher) { // check if publisher's name is available
                const publisherName = document.createElement('div')
                publisherName.innerHTML = `<strong>Published by: </strong> ${current.publisher}</div>`
                details.appendChild(publisherName)
            }
            if (current.authors) { // check if author names are available
                const authorNames = document.createElement('div')
                authorNames.innerHTML = `<strong>Authors: </strong> ${current.authors}</div>`
                details.appendChild(authorNames)
            }
            if (current.year.toString().slice(0, 2) === '20') { // check if year is valid
                const yearPublished = document.createElement('div')
                yearPublished.innerHTML = `<strong>Year: </strong> ${current.year.toString().slice(0, 4)}</div>`
                details.appendChild(yearPublished)
            }
            if (current.description) {
                const snippet = document.createElement('div')
                snippet.textContent = current.description.slice(0, 500) + '...'
                details.appendChild(snippet)
            }
            article.appendChild(details);

            // display keywords
            const keywords = document.createElement('div');
            if (current.topics.length > 0) {
                keywords.classList.add('keywords')
                keywords.innerHTML = `<strong>Topics: </strong>`;
                for (let j = 0; j < current.topics.length; j += 1) {
                    const span = document.createElement('span');
                    span.textContent += current.topics[j] + ' ';
                    keywords.appendChild(span);
                }
            }
            article.appendChild(keywords);

            const clearfix = document.createElement('div');
            clearfix.setAttribute('class', 'clearfix');
            article.appendChild(clearfix);

            section.appendChild(article);

        }
    }

    // display pagination if 10 articles are found
    if (articles.length >= 10) {
        nav.style.display = 'block';
    } else {
        nav.style.display = 'none';
    }
}
