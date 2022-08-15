/* global config csv2geojson turf Assembly $ */
'use strict';


mapboxgl.accessToken = "pk.eyJ1IjoidGhlamFtZXNoZWFyZCIsImEiOiJjbDZndjluN2YwMDF3M2JyeG52dHFoaXV1In0.clP391payV0qfNDtemgiag";
const columnHeaders = ['story_title', 'architect', 'city'];

const filterconfigs = [
    {
      type: 'checkbox',
      title: 'Book: ',
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
      title: 'Includes floor plan ',
      columnHeader: 'floor_plan_(Y/N)',
      listItems: [
        'Y',
        'N',
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
  zoom: 2,
  projection: 'globe',
  transformRequest: transformRequest,
});

function flyToLocation(currentFeature) {
  map.flyTo({
    center: currentFeature,
    //zoom: 5,
  });
}
//RANGE SLIDER
//issue is that the decade data of GeoJSON is taken as string not int/float, and i don't know how to convert. ParseInt fucked up things.

var sliderOptions = {
  elm: 'slider-control',
  layer: 'locationData',
  source: 'locationData',
  controlWidth: '200px',
  minProperty: 'initial_date',
  maxProperty: 'initial_date',
  sliderMin: -2000,
  sliderMax: 2000,
  //filterMin: -1950,
  //filterMax: 1950,
  propertyType: 'integer',
  rangeDescriptionFormat: 'integer',
  descriptionPrefix: 'Year:'
}

map.addControl(new RangeSlider(sliderOptions, 'top-right'));


var filterList = ['any',
  ['==', ['number', ['get', 'DataProviderType']], 4],
  ['==', ['number', ['get', 'DataProviderType']], 6],
  ['==', ['number', ['get', 'DataProviderType']], 8],
];


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
      `<h4>` + `<b>` + `Book: ` + `</b>` + currentFeature.properties.Author_Surname_1 + ', ' + currentFeature.properties.book_title + `, p. ` + currentFeature.properties.Page + `</h4>`)
      .addTo(map);
  // if final date is empty
  } else if (currentFeature.properties.final_date === "") {
    new mapboxgl.Popup({ closeOnClick: true })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(`<h3>` + currentFeature.properties.story_title + `</h3>` + 
      `<h4>` + `<b>` + `Date: ` + `</b>` + currentFeature.properties.initial_date + `</h4>` + 
      `<h4>` + `<b>` + `Architect/Patron: ` + `</b>` + currentFeature.properties.architect + `</h4>` +
      `<h4>` + `<b>` + `Book: ` + `</b>` + currentFeature.properties.Author_Surname_1 + ', ' + currentFeature.properties.book_title + `, p. ` + currentFeature.properties.Page + `</h4>`)
      .addTo(map);
  // if initial and final date are available
  } else {
      new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(`<h3>` + currentFeature.properties.story_title + `</h3>` + 
        `<h4>` + `<b>` + `Date: ` + `</b>` + currentFeature.properties.initial_date + ' to ' + currentFeature.properties.final_date + `</h4>` + 
        `<h4>` + `<b>` + `Architect/Patron: ` + `</b>` + currentFeature.properties.architect + `</h4>` +
        `<h4>` + `<b>` + `Book: ` + `</b>` + currentFeature.properties.Author_Surname_1 + ', ' + currentFeature.properties.book_title + `, p. ` + currentFeature.properties.Page + `</h4>`)
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
  dropDown.classList.add('select', 'filter-option');

  const selectArrow = document.createElement('div');
  selectArrow.classList.add('select-arrow');

  const firstOption = document.createElement('option');

  dropDown.appendChild(firstOption);
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

//geocoder.on('result', (ev) => {
  //const searchResult = ev.result.geometry;
  //sortByDistance(searchResult);
//});

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

        geojsonData = data;
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
            'circle-stroke-width': 0,
            'circle-opacity': 0.7,
            //color circles by book
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
const sidebarButtonShow = document.getElementById('sidebar-button');
const hideFilters = document.getElementById('hideFilters');

showFilters.addEventListener('click', () => {
  sidebar.style.display = 'block';
  sidebar.classList.add('z5');
  showFilters.style.display = 'none';
  hideFilters.style.display = 'block';
});

hideFilters.addEventListener('click', () => {
  sidebar.style.display = 'none';
  sidebar.classList.remove('z5');
  showFilters.style.display = 'block';
  hideFilters.style.display = 'none';
});




function transformRequest(url) {
  const isMapboxRequest =
    url.slice(8, 22) === 'api.mapbox.com' ||
    url.slice(10, 26) === 'tiles.mapbox.com';
  return {
    url: isMapboxRequest ? url.replace('?', '?pluginName=sheetMapper&') : url,
  };
}
