import * as moment from 'moment';
import { iataStatuses, iataCodes } from 'utils/iata';

export const baseURL = 'http://aviation-edge.com/v2/public/timetable?key=20cf89-d78f2c&iataCode=SVO';

export function getURL(type) {
  return `${baseURL}&type=${type}`;
}

export function fetchFlights(url) {
  return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .catch(error => {
      console.log('A problem with the fetch operation: ', error.message);
    });
}

// FIX: fix the algorithm?
export function sanitizeFlights(flights, type) {
  let prevCity;
  let prevTime;

  const sanitizedFlights = []; // List of the deduplicated flights

  for (let i = 0; i < flights.length; i++) {
    const { departure, arrival } = flights[i];

    let city;
    let time;

    if (type === 'arrival') {
      // If we fetch a list of arrivals
      const { iataCode: cityOfDeparture } = departure;
      const { scheduledTime: timeOfArrivalAtSVO } = arrival;
      city = cityOfDeparture; // from where the flight arrives at SVO
      time = timeOfArrivalAtSVO; // what time the flight should arrive at SVO
    } else {
      // By default, we fetch a list of departures
      const { iataCode: cityOfArrival } = arrival;
      const { scheduledTime: timeOfDepartureSVO } = departure;
      city = cityOfArrival; // destination of the flight
      time = timeOfDepartureSVO; // what time when the flight departs SVO
    }

    if (time === prevTime && city === prevCity) {
      if (sanitizedFlights[sanitizedFlights.length - 1].flight.otherIataNumbers) {
        sanitizedFlights[sanitizedFlights.length - 1].flight.otherIataNumbers.push(
          flights[i].flight.iataNumber
        );
      } else {
        sanitizedFlights[sanitizedFlights.length - 1].flight.otherIataNumbers = [];
        sanitizedFlights[sanitizedFlights.length - 1].flight.otherIataNumbers.push(
          flights[i].flight.iataNumber
        );
      }
    } else {
      sanitizedFlights.push(flights[i]);
    }
    prevTime = time;
    prevCity = city;
  }

  return sanitizedFlights;
}

export const sortFlightsByTime = (flights, type) => flights.sort((a, b) => {
  let timeA;
  let timeB;

  if (type === 'arrival') {
    const {
      arrival: { scheduledTime: arrivalTimeA }
    } = a;
    const {
      arrival: { scheduledTime: arrivalTimeB }
    } = b;
    timeA = moment(arrivalTimeA, 'YYYY-MM-DDTHH:mm:ss.SSS');
    timeB = moment(arrivalTimeB, 'YYYY-MM-DDTHH:mm:ss.SSS');
  } else {
    const {
      departure: { scheduledTime: departureTimeA }
    } = a;
    const {
      departure: { scheduledTime: departureTimeB }
    } = b;
    timeA = moment(departureTimeA, 'YYYY-MM-DDTHH:mm:ss.SSS');
    timeB = moment(departureTimeB, 'YYYY-MM-DDTHH:mm:ss.SSS');
  }

  if (moment(timeA).isBefore(timeB)) {
    return -1;
  }
  if (moment(timeA).isAfter(timeB)) {
    return 1;
  }
  return 0;
});

export const replcaeIataWithCities = flights => flights.map(flight => {
  const { status, departure, arrival } = flight;
  const { iataCode: city1 } = departure;
  const { iataCode: city2 } = arrival;

  if (iataStatuses[status]) {
    flight.status = iataStatuses[status];
  }

  if (iataCodes[city1]) {
    flight.departure.iataCode = iataCodes[city1].name;
  }
  if (iataCodes[city2]) {
    flight.arrival.iataCode = iataCodes[city2].name;
  }

  return flight;
});

export const getDelayedFlightsOnly = (flights, type) => flights.filter(flight => {
  const { status, departure, arrival } = flight;

  if (type === 'arrival') {
    return arrival.delay && arrival.delay > 1 && status !== 'совершил посадку';
  }

  return departure.delay && departure.delay > 1;
});

export function receiveFlights(type) {
  // 1. Get URL
  const url = getURL(type);

  return new Promise((resolve, reject) => {
    // 2. Fetch flight data from API
    fetchFlights(url).then(flights => {
      try {
        // 3. Sort
        const sortedFlights = sortFlightsByTime(flights, type);

        // 4. Sanitize
        const sanitizedFlights = sanitizeFlights(sortedFlights, type);

        // 5. Replcae IATA codes with citiy names
        const processedFlights = replcaeIataWithCities(sanitizedFlights);

        resolve(processedFlights);
      } catch (e) {
        reject(e);
      }
    });
  });
}

export default fetchFlights;
