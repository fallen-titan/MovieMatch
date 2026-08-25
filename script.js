const API_BASE = "https://api.themoviedb.org/3";

const IMAGE_BASE =
  "https://image.tmdb.org/t/p/w500";


let movies = [];

let currentPlayer = 1;

let currentIndex = 0;

let playerLikes = {
  1: [],
  2: []
};


const screens = {

  home:
    document.getElementById("homeScreen"),

  setup:
    document.getElementById("setupScreen"),

  player:
    document.getElementById("playerScreen"),

  match:
    document.getElementById("matchScreen"),

  results:
    document.getElementById("resultsScreen")

};


const movieCard =
  document.getElementById("movieCard");


/*
  Change application screen.
*/

function showScreen(screen) {

  Object.values(screens).forEach(
    screenElement => {

      screenElement.classList.remove(
        "active"
      );

    }
  );

  screen.classList.add("active");

}


/*
  Reset game data.
*/

function resetGame() {

  currentPlayer = 1;

  currentIndex = 0;

  playerLikes = {
    1: [],
    2: []
  };

}


/*
  Home -> Setup.
*/

document
  .getElementById("startBtn")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById("setupMessage")
        .textContent = "";

      showScreen(
        screens.setup
      );

    }
  );


/*
  Load movies from TMDB.
*/

document
  .getElementById("loadMoviesBtn")
  .addEventListener(
    "click",
    loadMovies
  );


async function loadMovies() {

  const token =
    document
      .getElementById("apiKey")
      .value
      .trim();

  const message =
    document
      .getElementById("setupMessage");


  if (!token) {

    message.textContent =
      "Please enter your TMDB API Read Access Token.";

    return;

  }


  message.textContent =
    "Loading movies...";


  try {

    const response =
      await fetch(
        `${API_BASE}/movie/popular?language=en-US&page=1`,
        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            accept:
              "application/json"

          }
        }
      );


    if (!response.ok) {

      throw new Error(
        "TMDB request failed"
      );

    }


    const data =
      await response.json();


    movies =
      data.results

        .filter(
          movie =>
            movie.poster_path
        )

        .slice(0, 20);


    if (movies.length < 10) {

      throw new Error(
        "Not enough movies returned"
      );

    }


    message.textContent = "";

    resetGame();

    showScreen(
      screens.player
    );


  }

  catch (error) {

    console.error(error);

    message.textContent =
      "Could not load movies. Check your token and internet connection.";

  }

}


/*
  Player selection.
*/

document
  .querySelectorAll(".player-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentPlayer =
          Number(
            button.dataset.player
          );

        currentIndex = 0;

        startMatching();

      }
    );

  });


/*
  Start matching.
*/

function startMatching() {

  currentIndex = 0;

  document
    .getElementById("playerLabel")
    .textContent =
    `Player ${currentPlayer}`;

  showScreen(
    screens.match
  );

  renderMovie();

}


/*
  Display movie.
*/

function renderMovie() {

  if (
    currentIndex >=
    movies.length
  ) {

    finishPlayer();

    return;

  }


  const movie =
    movies[currentIndex];


  document
    .getElementById("progress")
    .textContent =
    `${currentIndex + 1} / ${movies.length}`;


  document
    .getElementById("movieTitle")
    .textContent =
    movie.title;


  document
    .getElementById("movieYear")
    .textContent =
    movie.release_date
      ? movie.release_date.slice(0, 4)
      : "N/A";


  document
    .getElementById("movieRating")
    .textContent =
    movie.vote_average
      ? movie.vote_average.toFixed(1)
      : "N/A";


  document
    .getElementById("movieGenres")
    .textContent =
    `Popularity: ${Math.round(
      movie.popularity
    )}`;


  document
    .getElementById("movieDescription")
    .textContent =
    movie.overview ||
    "No description available.";


  document
    .getElementById("posterImage")
    .src =
    IMAGE_BASE +
    movie.poster_path;


  document
    .getElementById("posterImage")
    .alt =
    `${movie.title} poster`;


  movieCard.classList.remove(
    "swipe-left",
    "swipe-right"
  );

}


/*
  Like or dislike movie.
*/

function chooseMovie(liked) {

  if (
    currentIndex >=
    movies.length
  ) {

    return;

  }


  if (liked) {

    playerLikes[currentPlayer]
      .push(currentIndex);

  }


  movieCard.classList.add(
    liked
      ? "swipe-right"
      : "swipe-left"
  );


  setTimeout(
    () => {

      currentIndex++;

      renderMovie();

    },
    220
  );

}


/*
  Swipe buttons.
*/

document
  .getElementById("likeBtn")
  .addEventListener(
    "click",
    () =>
      chooseMovie(true)
  );


document
  .getElementById("dislikeBtn")
  .addEventListener(
    "click",
    () =>
      chooseMovie(false)
  );


/*
  Finish a player's turn.
*/

function finishPlayer() {

  if (
    currentPlayer === 1
  ) {

    currentPlayer = 2;

    currentIndex = 0;

    document
      .getElementById("playerLabel")
      .textContent =
      "Player 2";


    setTimeout(
      renderMovie,
      150
    );

  }

  else {

    showResults();

  }

}


/*
  Calculate matches.
*/

function showResults() {

  const firstPlayer =
    new Set(
      playerLikes[1]
    );


  const matches =
    playerLikes[2].filter(
      index =>
        firstPlayer.has(index)
    );


  const matchContainer =
    document
      .getElementById("matches");


  const noMatches =
    document
      .getElementById("noMatches");


  const resultTitle =
    document
      .getElementById("resultTitle");


  const resultSubtitle =
    document
      .getElementById("resultSubtitle");


  matchContainer.innerHTML = "";


  if (
    matches.length > 0
  ) {

    resultTitle.textContent =
      "It's a Match!";


    resultSubtitle.textContent =
      `You both liked ${
        matches.length
      } movie${
        matches.length === 1
          ? ""
          : "s"
      }.`;


    noMatches.classList.add(
      "hidden"
    );


    matchContainer.classList.remove(
      "hidden"
    );


    matches.forEach(
      index => {

        const movie =
          movies[index];


        const item =
          document.createElement(
            "div"
          );


        item.className =
          "match-item";


        item.innerHTML = `

          <img
            class="match-poster"
            src="${
              IMAGE_BASE +
              movie.poster_path
            }"
            alt="Movie poster"
          >

          <div>

            <h3>
              ${escapeHtml(
                movie.title
              )}
            </h3>

            <p>
              ${
                movie.release_date
                  ? movie.release_date.slice(
                      0,
                      4
                    )
                  : "N/A"
              }

              • ★

              ${
                movie.vote_average.toFixed(
                  1
                )
              }

            </p>

          </div>

        `;


        matchContainer.appendChild(
          item
        );

      }
    );

  }

  else {

    resultTitle.textContent =
      "No Matches";


    resultSubtitle.textContent =
      "Your movie tastes did not intersect this time.";


    matchContainer.classList.add(
      "hidden"
    );


    noMatches.classList.remove(
      "hidden"
    );

  }


  showScreen(
    screens.results
  );

}


/*
  Prevent movie titles from
  inserting unwanted HTML.
*/

function escapeHtml(text) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    text;

  return div.innerHTML;

}


/*
  Restart.
*/

document
  .getElementById("restartBtn")
  .addEventListener(
    "click",
    () => {

      resetGame();

      showScreen(
        screens.home
      );

    }
  );


/*
  Keyboard controls.

  Left arrow  = dislike
  Right arrow = like
*/

document.addEventListener(
  "keydown",
  event => {

    if (
      !screens.match
        .classList
        .contains("active")
    ) {

      return;

    }


    if (
      event.key ===
      "ArrowLeft"
    ) {

      chooseMovie(false);

    }


    if (
      event.key ===
      "ArrowRight"
    ) {

      chooseMovie(true);

    }

  }
);