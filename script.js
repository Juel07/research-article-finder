// Defining a baseURL and key as part of the request URL

const baseURL = 'https://core.ac.uk:443/api-v2/articles/search/';
const key = 'kzUnEaLtS35oMQ0lw2xmKYNuHZscJe4C';
let url;

// Grab references to all the DOM elements 

const searchTerm = document.querySelector('.search');
const startDate = document.querySelector('.start-date');
const endDate = document.querySelector('.end-date');
const searchForm = document.querySelector('form');

const nextBtn = document.querySelector('.next');
const previousBtn = document.querySelector('.prev');

const section = document.querySelector('section');
const nav = document.querySelector('nav');

// Hide the "Previous"/"Next" navigation to begin with, as we don't need it immediately
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
    url = baseURL + searchTerm.value + '?page=1' + '&pageSize=5' + '&metadata=true' + '&fulltext=false' + '&urls=true' + '&apiKey=' + key;

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

    if (articles.length === 10) {
        nav.style.display = 'block';
    } else {
        nav.style.display = 'none';
    }

    if (articles.length === 0) {
        const para = document.createElement('p');
        para.textContent = 'No articles found.'
        section.appendChild(para);
    } else {
        for (var i = 0; i < articles.length; i++) {
            let current = articles[i];

            const article = document.createElement('article');

            const heading = document.createElement('h2');
            const link = document.createElement('a');
            if (current.downloadUrl !== "") { // check if the download link exists
                link.href = current.downloadUrl;
            } else {
                link.href = current.fulltextUrls[1];
            }
            link.textContent = current.title;
            article.appendChild(heading);
            heading.appendChild(link);

            const img = document.createElement('img');
            img.src = 'http://core.ac.uk/image/' + current.id + '/medium';
            img.alt = current.title;
            article.appendChild(img);


            const details = document.createElement('div');
            details.classList.add('details')
            if (!current.publisher) { // check if the publisher name is available
                details.innerHTML = `
                <div><strong>Published by: </strong>Unknown</div><div><strong> Author: </strong> ${current.authors}</div> <div><strong> Year: </strong> ${current.year.toString().slice(0, 4)}</div>
                <div>${current.description.slice(0, 500)}...</div>`
            } else {
                details.innerHTML = `
                <div><strong>Published by: </strong> ${current.publisher}</div> <div><strong> Author: </strong> ${current.authors}</div> <div><strong> Year: </strong> ${current.year.toString().slice(0, 4)}</div>
                <div>${current.description.slice(0, 500)}...</div>`
            }
            article.appendChild(details);

            const keywords = document.createElement('div');
            keywords.classList.add('keywords')
            keywords.innerHTML = `<strong>Topics: </strong>`;
            for (let j = 0; j < current.topics.length; j += 1) {
                const span = document.createElement('span');
                span.textContent += current.topics[j] + ' ';
                keywords.appendChild(span);
            }
            article.appendChild(keywords);


            const clearfix = document.createElement('div');
            clearfix.setAttribute('class', 'clearfix');
            article.appendChild(clearfix);

            section.appendChild(article);
        }
    }
}
