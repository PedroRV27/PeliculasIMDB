window.onload = function () {
    const apiKey = 'd0b614eb';
    let currentPage = 1;
    let isLoading = false;
    let typingTimer;
    const doneTypingInterval = 500;
    let currentSearchType = 'movie';

    document.getElementById('searchInput').addEventListener('input', function () {
        clearTimeout(typingTimer);

        const searchTerm = this.value.trim();

        if (searchTerm.length >= 3) {
            typingTimer = setTimeout(function () {
                currentPage = 1;
                searchMovies(currentPage, currentSearchType);
            }, doneTypingInterval);
        } else {
            const moviesContainer = document.getElementById('moviesContainer');
            moviesContainer.innerHTML = '';
            document.getElementById('loadingMessage').style.display = 'none';
            isLoading = false;
        }
    });

    document.getElementById('searchButton').addEventListener('click', function () {
        const searchTerm = document.getElementById('searchInput').value.trim();

        if (searchTerm.length >= 3) {
            currentPage = 1;
            searchMovies(currentPage, currentSearchType);
        }
    });

    document.getElementById('searchType').addEventListener('change', function () {
        currentSearchType = this.value;
        currentPage = 1;
        searchMovies(currentPage, currentSearchType);
    });

    function checkScrollAndLoad() {
        const moviesContainer = document.getElementById('moviesContainer');
        const lastMovieCard = moviesContainer.lastElementChild;

        if (
            lastMovieCard &&
            window.innerHeight + window.scrollY >= lastMovieCard.offsetTop + lastMovieCard.offsetHeight - 300 &&
            !isLoading
        ) {
            document.getElementById('loadingMessage').style.display = 'block';
            currentPage++;
            isLoading = true;
            searchMovies(currentPage, currentSearchType);
        }
    }

    window.addEventListener('scroll', checkScrollAndLoad);

    function searchMovies(page, type) {
        document.getElementById('loadingMessage').style.display = 'flex';
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            const searchTerm = searchInput.value;

            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    displayMovies(data.Search);
                } else {
                    console.error('Error al buscar películas y series:', xhr.statusText);
                }
            };

            xhr.onerror = function () {
                console.error('Error de red al buscar películas y series.');
            };

            xhr.open('GET', `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}&page=${page}&type=${type}`, true);
            xhr.send();
        }, 1500);
    }

    function displayMovies(movies) {
        const moviesContainer = document.getElementById('moviesContainer');

        if (currentPage === 1) {
            moviesContainer.innerHTML = '';
        }

        if (movies && movies.length > 0) {
            movies.forEach(movie => {
                const movieCard = createMovieCard(movie);
                moviesContainer.appendChild(movieCard);
            });
        } else {
            if (currentPage === 1) {
                moviesContainer.innerHTML = '<p>No se encontraron resultados.</p>';
            }
        }

        document.getElementById('loadingMessage').style.display = 'none';
        isLoading = false;
    }

    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'img/default.jpg'}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
        `;
        movieCard.addEventListener('click', () => showMovieDetails(movie.imdbID));
        return movieCard;
    }

    function showMovieDetails(movieId) {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status === 200) {
                const movie = JSON.parse(xhr.responseText);
                displayMovieDetails(movie);
            } else {
                console.error('Error al obtener detalles de la película o serie:', xhr.statusText);
            }
        };

        xhr.onerror = function () {
            console.error('Error de red al obtener detalles de la película o serie.');
        };

        xhr.open('GET', `https://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`, true);
        xhr.send();
    }

    function displayMovieDetails(movie) {
        const moviesContainer = document.getElementById('moviesContainer');
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal()">&times;</span>
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'img/default.jpg'}" alt="${movie.Title}">
                <h2>${movie.Title} (${movie.Year})</h2>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Actores:</strong> ${movie.Actors}</p>
                <p><strong>Sinopsis:</strong> ${movie.Plot}</p>
                <p><strong>Valoración:</strong> ${movie.imdbRating}</p>
                ${movie.Ratings ? displayAdditionalRatings(movie.Ratings) : ''}
            </div>
        `;
        moviesContainer.appendChild(modal);


        modal.style.display = 'flex';
    }

    function displayAdditionalRatings(ratings) {
        let ratingsHTML = '<p><strong>Otras Valoraciones:</strong></p>';
        ratings.forEach(rating => {
            ratingsHTML += `<p>${rating.Source}: ${rating.Value}</p>`;
        });
        return ratingsHTML;
    }

 
    searchMovies(currentPage, currentSearchType);
};

function closeModal() {
    const moviesContainer = document.getElementById('moviesContainer');
    const modal = document.querySelector('.modal');
    if (modal) {
        moviesContainer.removeChild(modal);
    }
}
