import * as moment from 'moment';
import { iataStatuses, iataCodes } from 'utils/iata';

// eslint-disable-next-line operator-linebreak
export const baseURL =
  'https://aviation-edge.com/v2/public/timetable?key=20cf89-d78f2c&iataCode=SVO';

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

export function sortFlightsByTime(flights, type) {
  return flights.sort((a, b) => {
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
}

// TODO: double-check the algorithm
export function sanitizeFlights(flights, type) {
  let prevCity;
  let prevTime;

  const sanitizedFlights = []; // List of the deduplicated flights

  flights.forEach(flight => {
    const { departure, arrival } = flight;

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
      time = timeOfDepartureSVO; // what time the flight departs SVO
    }

    if (time === prevTime && city === prevCity) {
      if (
        sanitizedFlights[sanitizedFlights.length - 1].flight.otherIataNumbers
      ) {
        sanitizedFlights[
          sanitizedFlights.length - 1
        ].flight.otherIataNumbers.push(flight.flight.iataNumber);
      } else {
        sanitizedFlights[
          sanitizedFlights.length - 1
        ].flight.otherIataNumbers = [];
        sanitizedFlights[
          sanitizedFlights.length - 1
        ].flight.otherIataNumbers.push(flight.flight.iataNumber);
      }
    } else {
      sanitizedFlights.push(flight);
    }
    prevTime = time;
    prevCity = city;
  });

  return sanitizedFlights;
}

export function replaсeIataWithCities(flights) {
  return flights.map(flight => {
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
}

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

        // 5. Replcae IATA codes with city names
        const processedFlights = replaсeIataWithCities(sanitizedFlights);

        resolve(processedFlights);
      } catch (e) {
        reject(e);
      }
    });
  });
}

export function getDelayedFlightsOnly(flights, type) {
  return flights.filter(flight => {
    const { status, departure, arrival } = flight;

    if (type === 'arrival') {
      return (
        arrival.delay && arrival.delay > 1 && status !== 'совершил посадку'
      );
    }

    return (
      departure.delay &&
      departure.delay > 1 &&
      status !== 'совершил посадку' &&
      status !== 'в полете'
    );
  });
}

export function getCityAndTimeFor1Flight(type, departureData, arrivalData) {
  let city;
  let mainTime;
  let secondaryTime;

  if (type === 'arrival') {
    // If we fetch a list of arrivals
    const { iataCode: cityOfDeparture } = departureData; // city
    let {
      scheduledTime: scheduledTimeOfArrival,
      estimatedTime: estimatedTimeOfArrival,
      actualTime: actualTimeOfArrival
    } = arrivalData;

    city = cityOfDeparture;

    scheduledTimeOfArrival = moment(
      scheduledTimeOfArrival,
      'YYYY-MM-DDTHH:mm:ss.SSS'
    ).format('DD.MM / HH:mm');

    if (estimatedTimeOfArrival && actualTimeOfArrival) {
      actualTimeOfArrival = moment(
        actualTimeOfArrival,
        'YYYY-MM-DDTHH:mm:ss.SSS'
      ).format('DD.MM / HH:mm');
      estimatedTimeOfArrival = moment(
        estimatedTimeOfArrival,
        'YYYY-MM-DDTHH:mm:ss.SSS'
      ).format('DD.MM / HH:mm');

      mainTime = actualTimeOfArrival;
      secondaryTime = estimatedTimeOfArrival;
    } else if (estimatedTimeOfArrival) {
      estimatedTimeOfArrival = moment(
        estimatedTimeOfArrival,
        'YYYY-MM-DDTHH:mm:ss.SSS'
      ).format('DD.MM / HH:mm');

      mainTime = estimatedTimeOfArrival;
      secondaryTime = scheduledTimeOfArrival;
    } else if (actualTimeOfArrival) {
      actualTimeOfArrival = moment(
        actualTimeOfArrival,
        'YYYY-MM-DDTHH:mm:ss.SSS'
      ).format('DD.MM / HH:mm');

      mainTime = actualTimeOfArrival;
      secondaryTime = scheduledTimeOfArrival;
    }
  } else {
    // By default, we fetch a list of departures
    const { iataCode: cityOfArrival } = arrivalData; // city
    let {
      scheduledTime: scheduledTimeOfDeparture,
      estimatedTime: estimatedTimeOfDeparture,
      actualTime: actualTimeOfDeparture
    } = departureData; // time

    city = cityOfArrival;

    scheduledTimeOfDeparture = moment(
      scheduledTimeOfDeparture,
      'YYYY-MM-DDTHH:mm:ss.SSS'
    ).format('DD.MM / HH:mm');

    if (estimatedTimeOfDeparture && actualTimeOfDeparture) {
      actualTimeOfDeparture = moment(
        actualTimeOfDeparture,
        'YYYY-MM-DDTHH:mm:ss.SSS'
      ).format('DD.MM / HH:mm');
      estimatedTimeOfDeparture = moment(
        estimatedTimeOfDeparture,
        'YYYY-MM-DDTHH:mm:ss.SSS'
      ).format('DD.MM / HH:mm');

      mainTime = actualTimeOfDeparture;
      secondaryTime = estimatedTimeOfDeparture;
    } else if (estimatedTimeOfDeparture) {
      estimatedTimeOfDeparture = moment(
        estimatedTimeOfDeparture,
        'YYYY-MM-DDTHH:mm:ss.SSS'
      ).format('DD.MM / HH:mm');

      mainTime = estimatedTimeOfDeparture;
      secondaryTime = scheduledTimeOfDeparture;
    } else if (actualTimeOfDeparture) {
      actualTimeOfDeparture = moment(
        actualTimeOfDeparture,
        'YYYY-MM-DDTHH:mm:ss.SSS'
      ).format('DD.MM / HH:mm');

      mainTime = actualTimeOfDeparture;
      secondaryTime = scheduledTimeOfDeparture;
    }
  }

  return { city, mainTime, secondaryTime };
}

export default receiveFlights;
