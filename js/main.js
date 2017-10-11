$(document).ready(function(){

	console.log("Page Ready");

	$("#searchForm").on("submit", function(event){
		let searchText = $("#searchText").val();
		getMovies(searchText);
		event.preventDefault();
	});

});

//returns list of movies that closely match search query
function getMovies(searchText){
	axios.get("https://api.themoviedb.org/3/search/movie?api_key=e603619cc7ad76d78e846cf21cd944cf&language=en-US&query="+searchText+"&page=1&include_adult=false")
		//function that runs if API call succeeds
		.then(function(response){
			console.log(response);
			let movies = response.data.results;
			let output = "";

			//gets image, title, and link for each movie in results
			$.each(movies, function(index, movie){
				let image = "https://image.tmdb.org/t/p/w500"+movie.poster_path;
				let title = movie.title;
				let id = movie.id;
				
				//html formats each result
				output += `
					<div class="col-sm-6 col-md-3">
						<div class="well text-center">
							<img src="${image}" alt="Movie Poster of '${title}'" class="movie-img">
							<h5>${title}</h5>
							<a onclick="movieSelected('${id}')" class="btn btn-primary" href="#">Movie Details</a>
						</div>
					</div>
				`;
			});

			//output all results to html page
			$("#movies").html(output);

		})
		//function that runs if API call failed
		.catch(function(error){
			console.log(error);
		});
}

function movieSelected(id){
	sessionStorage.setItem("movieId", id);
	window.location = "movie.html";
	return false;
}

function getMovie(){
	let movieId = sessionStorage.getItem("movieId");

	axios.get("https://api.themoviedb.org/3/movie/"+movieId+"?api_key=e603619cc7ad76d78e846cf21cd944cf&language=en-US&append_to_response=credits")
		//function that runs if API call succeeded
		.then(function(response){
			console.log(response);
			let movie = response.data;
			let image = "https://image.tmdb.org/t/p/w500"+movie.poster_path;
			let releaseDate = movie.release_date.slice(0,4);
			let genresArr = []
			let director = movie.credits.crew[1].name;
			let castArr = [];

			

			//runs if genre info is available
			if(movie.genres.length > 0){
				//add each genre to genresArr
				$.each(movie.genres, function(index, element){
					genresArr.push(" "+element.name);
				});
			}else{
				genresArr.push("Not Available");
			}

			//runs if cast info is available
			if(movie.credits.cast.length > 0){
				//add each cast member to castArr
				$.each(movie.credits.cast, function(index, element){
					castArr.push(" "+element.name);
				});
			}else{
				castArr.push("Not Available");
			}
			
			
			

			let output = `
				<div class="row">
					<div class="col-md-4 col-sm-6">
						<img src="${image}" alt="Movie Poster of '${movie.title}'" class="thumbnail">
					</div>
					<div class="col-md-8 col-sm-6">
						<h2>${movie.title}</h2>
						<ul class="list-group movie-info">
							<li class="list-group-item"><strong>Released:</strong> ${releaseDate}</li>
							<li class="list-group-item"><strong>Genres:</strong> ${genresArr}</li>
							<li class="list-group-item"><strong>Director:</strong> ${director}</li>
							<li class="list-group-item"><strong>Cast:</strong> ${castArr}</li>
							<li class="list-group-item"><strong>Runtime:</strong> ${movie.runtime} minutes</li>
						</ul>
					</div>
				</div>
				<div class="row">
					<div class="well">
						<h3>Plot</h3>
						${movie.overview}
						<hr>
						<a href="http://imdb.com/title/${movie.imdb_id}" target="_blank" class="btn btn-primary">View IMDB</a>
						<a href="index.html" class="btn btn-default">Go Back To Search</a>
					</div>

				</div>
			`;

			$("#movie").html(output);
		})
		//function that runs if API call failed
		.catch(function(error){
			console.log(error);
		});
}