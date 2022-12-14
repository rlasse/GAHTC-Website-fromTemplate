/* global config csv2geojson turf Assembly $ */
'use strict';


mapboxgl.accessToken = "pk.eyJ1IjoidGhlamFtZXNoZWFyZCIsImEiOiJjbDZndjluN2YwMDF3M2JyeG52dHFoaXV1In0.clP391payV0qfNDtemgiag";
const columnHeaders = ['story_title', 'architect', 'location'];

const filterconfigs = [
    {
      type: 'checkbox',
      title: 'Book',
      columnHeader: 'book_title',
      listItems: [
        'A History of Architecture: Settings and Rituals',
        'Modern Movements in Architecture',
        'A Global History of Architecture',
        'A World History of Architecture',
      ],
      listTitles: [
        'Spiro Kostof and Greg Castillo, A History of Architecture: Settings and Rituals',
        'Charles Jencks, Modern Movements in Architecture',
        'Francis D.K. Ching, Mark Jarzombek and Vikramaditya Prakash, A Global History of Architecture',
        'Marian Moffett, Michael Fazio, Lawrence Wodehouse, A World History of Architecture',
      ],
    },
    {
      type: 'dropdown',
      title: 'Includes Floor Plan',
      columnHeader: 'fp_overall',
      listItems: [
        'Y',
        'N',
      ],
      listTitles: [
        'Yes',
        'No',
      ],
    },
    {
      type: 'dropdown',
      title: 'Is Built',
      columnHeader: 'built',
      listItems: [
        'Yes',
        'No',
      ],
      listTitles: [
        'Yes',
        'No',
      ],
    },
  ];



let geojsonData = {};
const filteredGeojson = {
  type: 'FeatureCollection',
  features: [],
};

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-v9',
  // center: [-120.234, 47.398],
  //zoom: 2,
  projection: 'globe',
  attributionControl: false, //hide the info button right side
  transformRequest: transformRequest,
});


//change map zoom based on windom width
var mq = window.matchMedia( "(min-width: 420px)" );
if (mq.matches){
    map.setZoom(2); //set map zoom level for desktop size
} else {
    map.setZoom(1); //set map zoom level for mobile size
};

function flyToLocation(currentFeature) {
  map.flyTo({
    center: currentFeature,
    //zoom: 5,
  });
}

function pageNumbers(bookTitles, item) {
  var pgNum = "";

  if(bookTitles.includes("A Global History of Architecture")) {

    pgNum = pgNum + "A Global History of Architecture, p. " + item.properties.pg_gh + "; "

    } 

  if(bookTitles.includes("A History of Architecture: Settings and Rituals")) {

    pgNum = pgNum + "A History of Architecture: Settings and Rituals, p. " + item.properties.pg_ha + "; "

  } 

  if(bookTitles.includes("Modern Movements in Architecture")) {

    pgNum = pgNum + "Modern Movements in Architecture, p. " + item.properties.pg_mm + "; "

  } 

  if(bookTitles.includes("A World History of Architecture")) {

    pgNum = pgNum + "A World History of Architecture, p. " + item.properties.pg_wh + "; "

  } 

  pgNum = pgNum.slice(0,-2);
  pgNum = pgNum + "."; 

  return pgNum;
}

//POP-UP Feature; 
function createPopup(currentFeature) {
  const popups = document.getElementsByClassName('mapboxgl-popup');
  /** Check if there is already a popup on the map and if so, remove it */
  if (popups[0]) popups[0].remove();
  // if initial date is empty
  if (currentFeature.properties.initial_date === "") {
    new mapboxgl.Popup({ closeOnClick: true })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(`<h3>` + currentFeature.properties.story_title + `</h3>` + 
      `<h4>` + `<b>` + `Date: ` + `</b>` + `Unknown` + `</h4>` + 
      `<h4>` + `<b>` + `Architect/Patron: ` + `</b>` + currentFeature.properties.architect + `</h4>` +
      `<h4>` + `<b>` + `Total Mentions: ` + `</b>` + currentFeature.properties.count_overall + `</h4>` +
      `<h4>` + `<b>` + `Books: ` + `</b>` + pageNumbers(currentFeature.properties.book_title, currentFeature) + `</h4>` +
      `<h4>` + `<b>` + `Built: ` + `</b>` +  currentFeature.properties.built + `</h4>`)
      .addTo(map);
  // if final date is empty
  } else if (currentFeature.properties.final_date === "") {
    new mapboxgl.Popup({ closeOnClick: true })
      .setLngLat(currentFeature.geometry.coordinates)

      .setHTML(`<h3>` + currentFeature.properties.story_title + `</h3>` + 
      `<h4>` + `<b>` + `Date: ` + `</b>` + currentFeature.properties.initial_date + `</h4>` + 
      `<h4>` + `<b>` + `Architect/Patron: ` + `</b>` + currentFeature.properties.architect + `</h4>` +
      `<h4>` + `<b>` + `Total Mentions: ` + `</b>` + currentFeature.properties.count_overall + `</h4>` +
      `<h4>` + `<b>` + `Books: ` + `</b>` + pageNumbers(currentFeature.properties.book_title, currentFeature) + `</h4>` +
      `<h4>` + `<b>` + `Built: ` + `</b>` +  currentFeature.properties.built + `</h4>`)
      
      .addTo(map);
  // if initial and final date are available
  } else {
      new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(`<h3>` + currentFeature.properties.story_title + `</h3>` + 
        `<h4>` + `<b>` + `Date: ` + `</b>` + currentFeature.properties.initial_date + ' to ' + currentFeature.properties.final_date + `</h4>` + 
        `<h4>` + `<b>` + `Architect/Patron: ` + `</b>` + currentFeature.properties.architect + `</h4>` +
        `<h4>` + `<b>` + `Total Mentions: ` + `</b>` + currentFeature.properties.count_overall + `</h4>` +
        `<h4>` + `<b>` + `Books: ` + `</b>` + pageNumbers(currentFeature.properties.book_title, currentFeature) + `</h4>` +
        `<h4>` + `<b>` + `Built: ` + `</b>` +  currentFeature.properties.built + `</h4>`)
        
        .addTo(map);
  }
}

//Listings on the side
function buildLocationList(locationData) {
  /* Add a new listing section to the sidebar. */
  const listings = document.getElementById('listings');
  listings.innerHTML = '';
  locationData.features.forEach((location, i) => {
    const prop = location.properties;

    const listing = listings.appendChild(document.createElement('div'));
    /* Assign a unique `id` to the listing. */
    listing.id = 'listing-' + prop.id;

    /* Assign the `item` class to each listing for styling. */
    listing.className = 'item';

    /* Add the link to the individual listing created above. */
    const link = listing.appendChild(document.createElement('button'));
    link.className = 'title';
    link.id = 'link-' + prop.id;
    link.innerHTML =
      '<p style="line-height: 1.25">' + prop[columnHeaders[0]] + '</p>';

    /* Add details to the individual listing. */
    const details = listing.appendChild(document.createElement('div'));
    details.className = 'content';

    for (let i = 1; i < columnHeaders.length; i++) {
      const div = document.createElement('div');
      div.innerText += prop[columnHeaders[i]];
      div.className;
      details.appendChild(div);
    }

    link.addEventListener('click', function () {
      const clickedListing = location.geometry.coordinates;
      flyToLocation(clickedListing);
      createPopup(location);

      const activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');

      const divList = document.querySelectorAll('.content');
      const divCount = divList.length;
      for (i = 0; i < divCount; i++) {
        divList[i].style.maxHeight = null;
      }

      for (let i = 0; i < geojsonData.features.length; i++) {
        this.parentNode.classList.remove('active');
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      }
    });
  });
}

// Build dropdown list function
// title - the name or 'category' of the selection e.g. 'Languages: '
// defaultValue - the default option for the dropdown list
// listItems - the array of filter items

function buildDropDownList(title, listItems, listTitles) {
  const filtersDiv = document.getElementById('filters');
  const mainDiv = document.createElement('div');
  const filterTitle = document.createElement('h3');
  filterTitle.innerText = title;
  filterTitle.classList.add('filterTitles'); //change the styling of title
  mainDiv.appendChild(filterTitle);

  const selectContainer = document.createElement('div');
  selectContainer.classList.add(/*'select-container', 'center', */'custom-select');

  const dropDown = document.createElement('select');
  dropDown.classList.add('select', 'filter-option', 'select--green');

  const selectArrow = document.createElement('div');
  selectArrow.classList.add('select-arrow');

  const firstOption = document.createElement('option');
  firstOption.setAttribute('id','option-1');

  dropDown.appendChild(firstOption);
  firstOption.innerHTML = 'Any';
  selectContainer.appendChild(dropDown);
  selectContainer.appendChild(selectArrow);
  mainDiv.appendChild(selectContainer);

  for (let i = 0; i < listItems.length; i++) {
    const opt = listItems[i];
    const el1 = document.createElement('option');
    el1.textContent = filterconfigs[1].listTitles[i];
    el1.value = opt;
    dropDown.appendChild(el1);
  }
  filtersDiv.appendChild(mainDiv);
}





// Build checkbox function
// title - the name or 'category' of the selection e.g. 'Languages: '
// listItems - the array of filter items
// To DO: Clean up code - for every third checkbox, create a div and append new checkboxes to it

function buildCheckbox(title, listItems, listTitles) {
  const filtersDiv = document.getElementById('filters');
  const mainDiv = document.createElement('div');
  const filterTitle = document.createElement('div');
  const formatcontainer = document.createElement('div');
  filterTitle.classList.add('filterTitles');
  formatcontainer.classList.add('test');
  /*const secondLine = document.createElement('div');
  secondLine.classList.add(
    'center',
    'flex-parent',
    'py12',
    'px3',
    'flex-parent--space-between-main',
  );*/
  filterTitle.innerText = title;
  mainDiv.appendChild(filterTitle);
  mainDiv.appendChild(formatcontainer);

  for (let i = 0; i < listItems.length; i++) {
    const container = document.createElement('label');

    container.classList.add('checkbox-container');

    const input = document.createElement('input');
    input.classList.add('px12', 'filter-option');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', listItems[i]);
    input.setAttribute('checked', true);
    input.setAttribute('value', listItems[i]);

    const checkboxDiv = document.createElement('div');
    const inputValue = document.createElement('p');
    //inputValue.innerText = listItems[i];
    inputValue.innerText = filterconfigs[0].listTitles[i];
    checkboxDiv.classList.add('checkbox', 'color-black', 'mr6', 'bg-white', 'border--black');
    checkboxDiv.appendChild(Assembly.createIcon('check'));

    container.appendChild(input);
    container.appendChild(checkboxDiv);
    container.appendChild(inputValue);

    formatcontainer.appendChild(container);
  }
  filtersDiv.appendChild(mainDiv);
}

//we need to re-introduce null values of dates here again.
function setDateFilter(l, u) {
  const dateFilter = ['all',
  ['>=', 'initial_date', l],
  ['<=', 'initial_date', u]];
  map.setFilter('locationData', dateFilter);
}

//if function chooses between filter with unknown and without unknown dates, and chooses respectively
function setDateFilterWithNulls(l, u) {
  if (document.getElementById('showUnknownDate').checked) {
    const dateFilterNull = ['any',
    ['==', 'initial_date', ''],
    ['all',['!=', 'initial_date', ''],  
      ['>=', 'initial_date', l],
      ['<=', 'initial_date', u]]
  ];
  map.setFilter('locationData', dateFilterNull);
  } else {
    const dateFilter = ['all',
    ['>=', 'initial_date', l],
    ['<=', 'initial_date', u]];
  map.setFilter('locationData', dateFilter);
  }
}

//query date data for min,max etc

var rangeOptions = {
  layer: 'locationData',
  source: 'locationData',
  dateProperty: 'initial_date',
  rangeMin: -2000,
  rangeMax: 2030,
  valueMin: -2000,
  valueMax: 2000,
  step: 100,
};

//Slider

var lowerSlider = document.getElementById('lowerSlider'),
  upperSlider = document.getElementById('upperSlider'),
  lowerInput = document.getElementById('lowerInput'),
  upperInput = document.getElementById('upperInput'),
  lowerVal = parseInt(lowerSlider.value),
  upperVal = parseInt(upperSlider.value),
  sliders = document.querySelectorAll('.slider'),
  UnknownDateBox = document.getElementById('showUnknownDate');

/*
map.on('load', () => {
  sliders.min = rangeOptions.min,
  sliders.step = rangeOptions.step,
  sliders.max = rangeOptions.rangeMax;
  lowerSlider.value = rangeOptions.valueMin,
  lowerNumber.value = rangeOptions.valueMin,
  upperSlider.value = rangeOptions.valueMax,
  upperNumber.value = rangeOptions.valueMax,
  console.log(lowerSlider.value);
});*/

var updateCount = 0;

upperSlider.oninput = function() {
   lowerVal = parseInt(lowerSlider.value);
   upperVal = parseInt(upperSlider.value);
   
   if (upperVal < lowerVal + 100) {
      lowerSlider.value = upperVal - 100;
      
      if (lowerVal == lowerSlider.min) {
         upperSlider.value = 100;
      }
   }
   setDateFilterWithNulls(lowerVal, upperVal);
};

lowerSlider.oninput = function() {
   lowerVal = parseInt(lowerSlider.value);
   upperVal = parseInt(upperSlider.value);
   
   if (lowerVal > upperVal - 4) {
      upperSlider.value = lowerVal + 4;
      
      if (upperVal == upperSlider.max) {
         lowerSlider.value = parseInt(upperSlider.max) - 4;
      }

   }
   setDateFilterWithNulls(lowerVal, upperVal);
};

UnknownDateBox.oninput = function () {
  lowerVal = parseInt(lowerSlider.value);
  upperVal = parseInt(upperSlider.value);
  setDateFilterWithNulls(lowerVal, upperVal);
};




function controlLowerInput(lowerSlider, lowerInput, upperInput) {
  const [lower, upper] = getParsed(lowerInput, upperInput);
  if (lower > upper) {
      lowerSlider.value = upper;
      lowerInput.value = upper;
  } else {
      lowerSlider.value = lower;
  }
  setDateFilterWithNulls(lower,upper);
}
  
function controlUpperInput(upperSlider, lowerInput, upperInput) {
  const [lower, upper] = getParsed(lowerInput, upperInput);
  if (lower <= upper) {
      upperSlider.value = upper;
      upperInput.value = upper;
  } else {
      upperInput.value = lower;
  }
  setDateFilterWithNulls(lower,upper);
}

function controlLowerSlider(lowerSlider, upperSlider, lowerInput) {
  const [lower, upper] = getParsed(lowerSlider, upperSlider);
    if (lower > upper) {
    lowerSlider.value = upper;
    lowerInput.value = upper;
  } else {
    lowerInput.value = lower;
  }
  setDateFilterWithNulls(lower,upper);
}

function controlUpperSlider(lowerSlider, upperSlider, upperInput) {
  const [lower, upper] = getParsed(lowerSlider, upperSlider);
  if (lower <= upper) {
    upperSlider.value = upper;
    upperInput.value = upper;
  } else {
    upperInput.value = lower;
    upperSlider.value = lower;
  }
  setDateFilterWithNulls(lower,upper);
}

function getParsed(currentLower, currentUpper) {
  const lower = parseInt(currentLower.value, 10);
  const upper = parseInt(currentUpper.value, 10);
  return [lower, upper];
}

lowerSlider.oninput = () => controlLowerSlider(lowerSlider, upperSlider, lowerInput);
upperSlider.oninput = () => controlUpperSlider(lowerSlider, upperSlider, upperInput);
lowerInput.oninput = () => controlLowerInput(lowerSlider, lowerInput, upperInput, upperSlider);
upperInput.oninput = () => controlUpperInput(upperSlider, lowerInput, upperInput, upperSlider);



// Filters push filtered values in array

const selectFilters = [];
const checkboxFilters = [];

function createFilterObject(filterSettings) {
  filterSettings.forEach((filter) => {
    if (filter.type === 'checkbox') {
      const keyValues = {};
      Object.assign(keyValues, {
        header: filter.columnHeader,
        value: filter.listItems,
      });
      checkboxFilters.push(keyValues);
    }
    if (filter.type === 'dropdown') {
      const keyValues = {};
      Object.assign(keyValues, {
        header: filter.columnHeader,
        value: filter.listItems,
      });
      selectFilters.push(keyValues);
    }
  });
}



//filters get applied to map

function applyFilters() {
  const filterForm = document.getElementById('filters');

  filterForm.addEventListener('change', function () {
    const filterOptionHTML = this.getElementsByClassName('filter-option');
    const filterOption = [].slice.call(filterOptionHTML);

    const geojSelectFilters = [];
    const geojCheckboxFilters = [];

    filteredGeojson.features = [];
    // const filteredFeatures = [];
    // filteredGeojson.features = [];

    filterOption.forEach((filter) => {
      if (filter.type === 'checkbox' && filter.checked) {
        checkboxFilters.forEach((objs) => {
          Object.entries(objs).forEach(([, value]) => {
            if (value.includes(filter.value)) {
              const geojFilter = [objs.header, filter.value];
              geojCheckboxFilters.push(geojFilter);
            }
          });
        });
      }
      if (filter.type === 'select-one' && filter.value) {
        selectFilters.forEach((objs) => {
          Object.entries(objs).forEach(([, value]) => {
            if (value.includes(filter.value)) {
              const geojFilter = [objs.header, filter.value];
              geojSelectFilters.push(geojFilter);
            }
          });
        });
      }
    });



    if (geojCheckboxFilters.length === 0 && geojSelectFilters.length === 0) {
      geojsonData.features.forEach((feature) => {
        filteredGeojson.features.push(feature);
      });
    } else if (geojCheckboxFilters.length > 0) {
      geojCheckboxFilters.forEach((filter) => {
        geojsonData.features.forEach((feature) => {
          if (feature.properties[filter[0]].includes(filter[1])) {
            if (
              filteredGeojson.features.filter(
                (f) => f.properties.id === feature.properties.id,
              ).length === 0
            ) {
              filteredGeojson.features.push(feature);
            }
          }
        });
      });
      if (geojSelectFilters.length > 0) {
        const removeIds = [];
        filteredGeojson.features.forEach((feature) => {
          let selected = true;
          geojSelectFilters.forEach((filter) => {
            if (
              feature.properties[filter[0]].indexOf(filter[1]) < 0 &&
              selected === true
            ) {
              selected = false;
              removeIds.push(feature.properties.id);
            } else if (selected === false) {
              removeIds.push(feature.properties.id);
            }
          });
        });
        let uniqueRemoveIds = [...new Set(removeIds)];
        uniqueRemoveIds.forEach(function (id) {
          const idx = filteredGeojson.features.findIndex(
            (f) => f.properties.id === id,
          );
          filteredGeojson.features.splice(idx, 1);
        });
      }
    } else {
      geojsonData.features.forEach((feature) => {
        let selected = true;
        geojSelectFilters.forEach((filter) => {
          if (
            !feature.properties[filter[0]].includes(filter[1]) &&
            selected === true
          ) {
            selected = false;
          }
        });
        if (
          selected === true &&
          filteredGeojson.features.filter(
            (f) => f.properties.id === feature.properties.id,
          ).length === 0
        ) {
          filteredGeojson.features.push(feature);
        }
      });
    }
    map.getSource('locationData').setData(filteredGeojson);
    buildLocationList(filteredGeojson);
  });
}

function filters(filterSettings) {
  filterSettings.forEach((filter) => {
    if (filter.type === 'checkbox') {
      buildCheckbox(filter.title, filter.listItems);
    } else if (filter.type === 'dropdown') {
      buildDropDownList(filter.title, filter.listItems);
    }
  });
}

/*
function removeFilters() {
  const input = document.getElementsByTagName('input');
  const select = document.getElementsByTagName('select');
  const selectOption = [].slice.call(select);
  const checkboxOption = [].slice.call(input);
  filteredGeojson.features = [];
  checkboxOption.forEach((checkbox) => {
    if (checkbox.type === 'checkbox' && checkbox.checked === true) {
      checkbox.checked = false;
    }
  });



  selectOption.forEach((option) => {
    option.selectedIndex = 0;
  });

  map.getSource('locationData').setData(geojsonData);
  buildLocationList(geojsonData);
}
*/
/*
function removeFiltersButton() {
  const removeFilter = document.getElementById('removeFilters');
  removeFilter.addEventListener('click', () => {
    removeFilters();
  });
}
*/

createFilterObject(filterconfigs);
applyFilters();
filters(filterconfigs);
//removeFiltersButton();


function sortByDistance(selectedPoint) {
  const options = { units: 'miles' };
  let data;
  if (filteredGeojson.features.length > 0) {
    data = filteredGeojson;
  } else {
    data = geojsonData;
  }
  data.features.forEach((data) => {
    Object.defineProperty(data.properties, 'distance', {
      value: turf.distance(selectedPoint, data.geometry, options),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  data.features.sort((a, b) => {
    if (a.properties.distance > b.properties.distance) {
      return 1;
    }
    if (a.properties.distance < b.properties.distance) {
      return -1;
    }
    return 0; // a must be equal to b
  });
  const listings = document.getElementById('listings');
  while (listings.firstChild) {
    listings.removeChild(listings.firstChild);
  }
  buildLocationList(data);
}

map.on('load', () => {

  // csv2geojson - following the Sheet Mapper tutorial https://www.mapbox.com/impact-tools/sheet-mapper
  console.log('loaded');
  $(document).ready(() => {
    console.log('ready');
    $.ajax({
      type: 'GET',
      url: './GAHTC_Data.csv',
      dataType: 'text',
      success: function (csvData) {
        makeGeoJSON(csvData);
      },
      error: function (request, status, error) {
        console.log(request);
        console.log(status);
        console.log(error);
      },
    });
  });

  function makeGeoJSON(csvData) {
    csv2geojson.csv2geojson(
      csvData,
      {
        latfield: 'latitude',
        lonfield: 'longitude',
        delimiter: ',',
      },
      (err, data) => {
        data.features.forEach((data, i) => {
          data.properties.id = i;
        });

        const parsedData = {
          ...data,
          features: data.features.map(function(feature) {
            const { properties } = feature;
            const { initial_date, final_date, decade } = properties;
            return {
              ...feature,
              properties: {
                ...properties,
                initial_date: initial_date !== '' ? parseInt(initial_date) : initial_date,
                final_date: final_date !== '' ? parseInt(final_date) : final_date,
                decade: decade !== '' ? parseInt(decade) : decade,
              }
            }
          }),
        };

        geojsonData = parsedData;

        //geojsonData = data; without the parsing
        // Add the the layer to the map
        map.addLayer({
          id: 'locationData',
          type: 'circle',
          source: {
            type: 'geojson',
            data: geojsonData,
          },
          paint: {
            'circle-radius': 4, // size of circles
            'circle-color': '#ffffff', // color of circles
            //'circle-stroke-color': 'white',
            'circle-stroke-width': 4,
            'circle-stroke-color': 'transparent',
            'circle-opacity': 0.85,
            'circle-color': 'white',
          },
        });
      },
    );

    //Fly to Location
    map.on('click', 'locationData', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['locationData'],
      });
      const clickedPoint = features[0].geometry.coordinates;
      flyToLocation(clickedPoint);
      sortByDistance(clickedPoint);
      createPopup(features[0]);
    });

    map.on('mouseenter', 'locationData', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'locationData', () => {
      map.getCanvas().style.cursor = '';
    });
    buildLocationList(geojsonData);
  }
});





//Buttons

const showFilters = document.getElementById('showFilters');
const sidebar = document.getElementById('sidebar');
const sidebarButton = document.getElementById('sidebar-button');
const hideFilters = document.getElementById('hideFilters');
const menubar = document.getElementById('menubar');
const menubarButton = document.getElementById('menubar-button');
const showMenu = document.getElementById('showMenu');
const hideMenu = document.getElementById('hideMenu');

showFilters.addEventListener('click', () => {
  sidebar.style.display = 'block';
  sidebar.classList.add('z5');
  showFilters.style.display = 'none';
  hideFilters.style.display = 'block';
  //menubarButton.style.zIndex = 6;
});

hideFilters.addEventListener('click', () => {
  sidebar.style.display = 'none';
  sidebar.classList.remove('z5');
  showFilters.style.display = 'block';
  hideFilters.style.display = 'none';
  //menubarButton.style.zIndex = 8;
});


showMenu.addEventListener('click', () => {
  menubar.style.display = 'block';
  menubar.classList.add('z5');
  showMenu.style.display = 'none';
  hideMenu.style.display = 'block';
  //sidebarButton.style.zIndex = 6;
});

hideMenu.addEventListener('click', () => {
  menubar.style.display = 'none';
  menubar.classList.remove('z5');
  showMenu.style.display = 'block';
  hideMenu.style.display = 'none';
  //sidebarButton.style.zIndex = 8;
});




function transformRequest(url) {
  const isMapboxRequest =
    url.slice(8, 22) === 'api.mapbox.com' ||
    url.slice(10, 26) === 'tiles.mapbox.com';
  return {
    url: isMapboxRequest ? url.replace('?', '?pluginName=sheetMapper&') : url,
  };
}