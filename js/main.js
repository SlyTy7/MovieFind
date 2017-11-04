$(document).ready(function(){

	console.log("Page Ready");

	//gets popular movies on page load
	getPopular();

	$("#searchForm").on("submit", function(event){
		let searchText = $("#searchText").val();
		getMovies(searchText);
		event.preventDefault();
	});

});

//returns list of currently popluar movies
function getPopular(){
	axios.get("https://api.themoviedb.org/3/movie/popular?api_key=e603619cc7ad76d78e846cf21cd944cf&language=en-US&page=1")
		.then(function(response){
			let popular = response.data.results;
			let output = `
				<h3>Current Popular Movies</h3>
				<hr>
			`;

			//gets image, title, and link for each movie in results
			$.each(popular, function(index, element){
				let image;
				let title = element.title;
				let id = element.id;

				//puts placeholder image if none available
				if(element.poster_path != null){
					image = "https://image.tmdb.org/t/p/w500"+element.poster_path
				}else if(element.poster_path == null){
					image = "http://via.placeholder.com/500x700?text=No+Image+Available"
				}

				//shortens title if too long
				console.log(title.length);
				if(title.length>35){
					title = title.substring(0, 31);
					title = title + "...";
				}

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

			$("#movies").html(output);
		})
		.catch(function(error){
			console.log(error);
		});
}


//returns list of movies that closely match search query
function getMovies(searchText){
	axios.get("https://api.themoviedb.org/3/search/movie?api_key=e603619cc7ad76d78e846cf21cd944cf&language=en-US&query="+searchText+"&page=1&include_adult=false")
		//function that runs if API call succeeds
		.then(function(response){
			let movies = response.data.results;
			let output = "";

			//gets image, title, and link for each movie in results
			$.each(movies, function(index, movie){
				let image;
				let title = movie.title;
				let id = movie.id;

				//checks to see if movie poster is available from API
				if(movie.poster_path != null){
					image = "https://image.tmdb.org/t/p/w500"+movie.poster_path
				}else if(movie.poster_path == null){
					image = "http://via.placeholder.com/500x700?text=No+Image+Available"
				}
				
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

//stores movieId in sessionstorage so it can be accessed on movie.html
function movieSelected(id){
	sessionStorage.setItem("movieId", id);
	window.location = "movie.html";
	return false;
}

//opens movie detail page for movie selected
function getMovie(){
	//grabs movieId from storage
	let movieId = sessionStorage.getItem("movieId");

	//API call to get in-depth movie information
	axios.get("https://api.themoviedb.org/3/movie/"+movieId+"?api_key=e603619cc7ad76d78e846cf21cd944cf&language=en-US&append_to_response=credits")
		//function that runs if API call succeeded
		.then(function(response){
			let movie = response.data;
			let image;			
			let genresArr = [];
			let director = "";
			let castArr = [];
			let productionArr = [];
			let releaseDate = movie.release_date.slice(0,4);
			let runtime = movie.runtime;


			//if no movie image available this enters a placeholder image
			if(movie.poster_path != null){
					image = "https://image.tmdb.org/t/p/w500"+movie.poster_path
			}else if(movie.poster_path == null){
					image = "http://via.placeholder.com/500x700?text=No+Image+Available"
			}

			//runs if genre info is available
			if(movie.genres.length > 0){
				//add each genre to genresArr
				$.each(movie.genres, function(index, element){
					genresArr.push(" "+element.name);
				});
			}else{
				genresArr.push("Not Available");
			}


			//runs if crew info available
			if(movie.credits.crew.length > 0){
				//iterates over each crew member
				$.each(movie.credits.crew, function(index, element){
					//finds the director, if none available it changes value of director
					if(element.job == "Director"){
						director = element.name;
						return false;
					}else{
						director = "Not Available";
					}
				});
			}else{
				director = "Not Available";
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
			//limits cast members displayed to first 10
			castArr = castArr.slice(0, 10);


			//runs if production info is available
			if(movie.production_companies.length > 0){
				//add each cast member to castArr
				$.each(movie.production_companies, function(index, element){
					productionArr.push(" "+element.name);
				});
			}else{
				productionArr.push("Not Available");
			}
			
			//runs if runtime info not available
			if(runtime < 1){
				runtime = "Not Available";
			}else if(runtime > 0){
				runtime = runtime+" min.";
			}
			
			

			let output = `
				<div class="row">
					<div class="col-md-4 col-sm-6">
						<img src="${image}" alt="Movie Poster of '${movie.title}'" class="thumbnail">
					</div>
					<div class="col-md-8 col-sm-6">
						<h2>${movie.title}</h2>
						<h6><i>${movie.tagline}</i></h6>
						<ul class="list-group movie-info">
							<li class="list-group-item"><strong>Genres:</strong> ${genresArr}</li>
							<li class="list-group-item"><strong>Director:</strong> ${director}</li>
							<li class="list-group-item"><strong>Cast:</strong> ${castArr}</li>
							<li class="list-group-item"><strong>Production:</strong> ${productionArr}</li>
							<li class="list-group-item"><strong>Release Year:</strong> ${releaseDate}</li>
							<li class="list-group-item"><strong>Runtime:</strong> ${runtime}</li>
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