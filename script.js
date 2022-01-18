$(document).ready(function() {
  console.log('page is loaded');
  // console.log("search ln3: ", localStorage.getItem("search"))

  // global vars ====================
  const numOfResults = 8;
  let slicePoint = 0;

  // helper functions ====================
  function toUrl(url) {
   return encodeURIComponent(url).trim().toLowerCase();
  }

  //reload prev search results
  if (localStorage.getItem("wasSearched") == "true") {
    let localData = JSON.parse(localStorage.getItem("localData"));
    displayData(localData, numOfResults, slicePoint);
  }

  //Like button listener Funct----------
    function likeBtnListener() {
      const button = $(this);
      const container = button.closest(".item-cont");
      const heart = container.find(".fa-heart");
      heart.toggleClass("none");
      // console.log("heart has class none: ", heart.hasClass("none"));
      // console.log(".like-btn was clicked");
    
      if(!heart.hasClass("none")) {
        button.html('Unlike');
      } else{
        button.html('Like');
      }
  
  //add the like to local storage 
    nasaId = container.find("[data-nasaid]").attr("data-nasaid");
      // console.log("nasaId: ", nasaId);
    let localData = JSON.parse(localStorage.getItem("localData"));
  
    if (heart.hasClass("none")) {
      for (let obj of localData) {
        if (obj.data[0].nasa_id == nasaId) {
          obj.data[0].liked = false;
          // console.log("ln 147, liked = ", obj.data[0].liked);
          localStorage.setItem("localData", JSON.stringify(localData));
          break;
        }
      };
    } else {
      for (let obj of localData) {
        if (obj.data[0].nasa_id == nasaId) {
          obj.data[0].liked = true;
          // console.log("ln 155, liked = ", obj.data[0].liked);
          localStorage.setItem("localData", JSON.stringify(localData));
          break;
        };
      };
    }
  }  
  
 //display data from local storage ----------
 async function displayData(localData, numOfResults, sliceStart) {
   const formInput = $("#search_input").val();
    const searchSubject = formInput ? formInput : localStorage.getItem("searchSubject"); 
    $("#resultsH3 > span").empty();

    if (searchSubject) {
      if (sliceStart == 0) { $("#search-list").empty() } ;
      $("#descrip").hide();  
      $("#resultsH3").append(`<span> for the "${searchSubject}" </span>` ); 
    }
  
  let slicedLocalData = await localData.slice(sliceStart);

  await $.each(slicedLocalData, (index, item) => {
      // console.log("index: ", index, );
      // console.log("item: ", item, );
    
    if (index == numOfResults) {return false;}

    if (item.data[0].liked != true) {
      $("#search-list").append(`
      <div class="item-cont box-border-shadow"> 
        <div class="item-header">
          <span hidden data-nasaid=${item.data[0].nasa_id} ></span>
          <i class="fas fa-heart none" data-heartid='${index}'></i>          
          <h4>${item.data[0].title}
            <button data-buttonid="${index}" class="like-btn">Like</button>
          </h4>  
          <p>Date: ${item.data[0].date_created.slice(0, 10)}</p>  
        </div>
        <div><img src="${item.links[0].href}" alt="Nasa"> </div>
      </div>                
      `);
    } else {
      $("#search-list").append(`
      <div class="item-cont box-border-shadow">  
        <div class="item-header">
          <span hidden data-nasaid=${item.data[0].nasa_id} ></span>
          <i class="fas fa-heart" data-heartid='${index}'></i>          
          <h4>${item.data[0].title}
            <button data-buttonid="${index}" class="like-btn">Unlike</button>
          </h4>  
        </div>
        <div>
          <img src="${item.links[0].href}" alt="Nasa">          
        </div>
      </div>                
      `);
    }
  }); //closing $each
  $("#loadmore-btn").removeClass("none");
  $(".like-btn").on('click', likeBtnListener);
 } 

//Fetch remote data -----------
function getData(searchURL) {
  const API = "http://images-api.nasa.gov/search?media_type=image";

  localStorage.removeItem("localData");

  $.get(API+searchURL)
  .then((remoteData) => {
    //add data to local storage   
    localStorage.setItem("localData", JSON.stringify(remoteData.collection.items));
    let localData = JSON.parse(localStorage.getItem("localData"));
    
    $("#load-img").removeClass("block");

    //display data from local storage
      displayData(localData, numOfResults, slicePoint);
      
  })
  .catch(() => { 
      $("#noData").html("Could not load the remote data") ;
      $("#load-img").removeClass("block");
    }); 

} // closing getData()

//submit form function -------------
function submitForm(e){
  e.preventDefault();
  localStorage.setItem("wasSearched", "true");
  localStorage.setItem("searchSubject", $("#search_input").val().trim());
  // console.log("ln 118:", localStorage.getItem("search"));
  
  let inputError = false;
  const regEx_4digits = /^\d{4}$/;
  
  if ($("#search_input").val().trim()==="") {
      $("#noInput").html("Enter the search Subject");
      $("#noData").html("");
      inputError = true;
  } 
  if ($("#search_year").val() && !regEx_4digits.test(parseInt($("#search_year").val()))) {
    $("#noYear").html("Enter the year like so: 2010");
    $("#noData").html("");
    inputError = true;
  }   

  if(!inputError) {
      $("#load-img").addClass("block");
      $("#descrip").hide();
      $("#noInput").html("");
      $("#noData").html("");
      searchSubject = $("#search_input").val(); 
      searchYear = $("#search_year").val(); 
      searchURL = "&q=" + toUrl(searchSubject);  
      searchURL += searchYear ? ("&year_start=" + searchYear + "&year_end=" + searchYear) : '';
      
      getData(searchURL);
  }
} //closing submitForm()

//Listeners ====================
//Like button listener ----------
  $(".like-btn").on('click', likeBtnListener);

//empty form input Subject listener
$( "#search_input" ).on('input', function() {
  $("#noInput").empty();
});

//empty form input Year listener
$( "#search_year" ).on('input', function() {
  $("#noYear").empty();
});

//submit form on Enter key press
$("#search_input" ).keypress((event) => {
  if (event.keyCode === 13) {
      $("#search_btn").click();
  }
});

$("#search_year" ).keypress((event) => {
  if (event.keyCode === 13) {
      $("#search_btn").click();
  }
});

//Search button listener, submits the form --------
$("#search_btn").on('click', submitForm); 

//load more images listener
$("#loadmore-btn").on('click', function(){
  // console.log("log-more-btn clicked");

  slicePoint = slicePoint + numOfResults;
  // console.log("slicePoint: ", slicePoint);

  let localData = JSON.parse(localStorage.getItem("localData"));
  let slicedLocalData = localData.slice(slicePoint);
  // console.log("slicedLocalData.length: ", slicedLocalData.length);

  displayData(slicedLocalData, numOfResults, slicePoint);
});

//clear local storage
  // window.onbeforeunload = () => {
  // localStorage.removeItem("localData");
  // localStorage.removeItem("searchSubject");
// }


}); // closing doc.ready()

// <span data-heartid='${index}' class='heart none'>&#9825;</span>  
// $("#descrip").closest(".center, h3").css("background-color", "red");
// console.log($("#descrip").closest(".center, h3").attr("id"));

/*       if (!container.hasClass('hasHeart')) {
        container.addClass('hasHeart');
        container.prepend(`<span data-heartid='${index}' class='heart'>&#9825;</span>`)
        button.html('Unlike');
      } else {
        container.removeClass('hasHeart');
        container.find(".heart").remove();
        button.html('Like');
      }

      console.log("button-id: ", button.attr("data-buttonid"));
      console.log("heart-id:", container.find(".heart").attr("data-heartid"));


 */     
