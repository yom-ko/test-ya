import * as moment from 'moment';
import { statuses, iataCodes } from 'utils/nomenclature';

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

export function sortFlightsByTimeASC(flights, type) {
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

  flights.forEach(singleFlight => {
    const { departure, arrival } = singleFlight;

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
      time = timeOfDepartureSVO; // what time the flight should depart SVO
    }

    if (time === prevTime && city === prevCity) {
      if (sanitizedFlights[sanitizedFlights.length - 1].flight.otherIataNumbers) {
        sanitizedFlights[sanitizedFlights.length - 1].flight.otherIataNumbers.push(
          singleFlight.flight.iataNumber
        );
      } else {
        sanitizedFlights[sanitizedFlights.length - 1].flight.otherIataNumbers = [];
        sanitizedFlights[sanitizedFlights.length - 1].flight.otherIataNumbers.push(
          singleFlight.flight.iataNumber
        );
      }
    } else {
      sanitizedFlights.push(singleFlight);
    }
    prevTime = time;
    prevCity = city;
  });

  return sanitizedFlights;
}

export function translateCodesAndStatuses(flights) {
  return flights.map(flight => {
    const { status, departure, arrival } = flight;
    const { iataCode: code1 } = departure;
    const { iataCode: code2 } = arrival;

    if (statuses[status]) {
      flight.status = statuses[status];
    }

    if (iataCodes[code1]) {
      flight.departure.iataCode = iataCodes[code1].name;
    }
    if (iataCodes[code2]) {
      flight.arrival.iataCode = iataCodes[code2].name;
    }

    return flight;
  });
}

export async function receiveFlights(type) {
  try {
    // 1. Get URL
    const url = getURL(type);
    // 2. Get flights
    const flights = await fetchFlights(url);
    // 3. Sort flights
    const sortedFlights = sortFlightsByTimeASC(flights, type);
    // 4. Sanitize flights
    const sanitizedFlights = sanitizeFlights(sortedFlights, type);
    // 5. Replcae IATA codes with city names and translate statuses
    const processedFlights = translateCodesAndStatuses(sanitizedFlights);
    return processedFlights;
  } catch (error) {
    throw new Error(error.message);
  }
}

export function getDelayedFlightsOnly(flights, type) {
  return flights.filter(flight => {
    const { status } = flight;

    if (type === 'arrival') {
      const { arrival } = flight;
      const { delay } = arrival;
      let { scheduledTime, estimatedTime } = arrival;
      let negativeDelay = false;

      scheduledTime = moment(scheduledTime, 'YYYY-MM-DDTHH:mm:ss.SSS');

      if (estimatedTime) {
        estimatedTime = moment(estimatedTime, 'YYYY-MM-DDTHH:mm:ss.SSS');
        negativeDelay = moment(scheduledTime).isBefore(estimatedTime);
      }

      return delay && delay > 1 && negativeDelay && status !== 'совершил посадку';
    }

    const { departure } = flight;
    const { delay } = departure;
    let { scheduledTime, estimatedTime } = departure;
    let negativeDelay = false;

    scheduledTime = moment(scheduledTime, 'YYYY-MM-DDTHH:mm:ss.SSS');

    if (estimatedTime) {
      estimatedTime = moment(estimatedTime, 'YYYY-MM-DDTHH:mm:ss.SSS');
      negativeDelay = moment(scheduledTime).isBefore(estimatedTime);
    }

    return (
      delay && delay > 1 && negativeDelay && status !== 'совершил посадку' && status !== 'в полете'
    );
  });
}

export function getCityAndTimeOfAFlight(type, departureData, arrivalData) {
  let city = '';
  let mainTime = '';
  let secondaryTime = '';

  if (type === 'arrival') {
    // If we fetch a list of arrivals
    const { iataCode: cityOfDeparture } = departureData; // city
    let {
      scheduledTime: scheduledTimeOfArrival,
      estimatedTime: estimatedTimeOfArrival,
      actualTime: actualTimeOfArrival
    } = arrivalData;

    scheduledTimeOfArrival = moment(scheduledTimeOfArrival, 'YYYY-MM-DDTHH:mm:ss.SSS').format(
      'DD.MM / HH:mm'
    );

    city = cityOfDeparture;
    mainTime = scheduledTimeOfArrival;
    secondaryTime = scheduledTimeOfArrival;

    if (actualTimeOfArrival && estimatedTimeOfArrival) {
      actualTimeOfArrival = moment(actualTimeOfArrival, 'YYYY-MM-DDTHH:mm:ss.SSS').format(
        'DD.MM / HH:mm'
      );
      estimatedTimeOfArrival = moment(estimatedTimeOfArrival, 'YYYY-MM-DDTHH:mm:ss.SSS').format(
        'DD.MM / HH:mm'
      );
      mainTime = actualTimeOfArrival;
      secondaryTime = estimatedTimeOfArrival;
    } else if (estimatedTimeOfArrival) {
      estimatedTimeOfArrival = moment(estimatedTimeOfArrival, 'YYYY-MM-DDTHH:mm:ss.SSS').format(
        'DD.MM / HH:mm'
      );
      mainTime = estimatedTimeOfArrival;
    }
  } else {
    // By default, we fetch a list of departures
    const { iataCode: cityOfArrival } = arrivalData; // city
    let {
      scheduledTime: scheduledTimeOfDeparture,
      estimatedTime: estimatedTimeOfDeparture,
      actualTime: actualTimeOfDeparture
    } = departureData; // time

    scheduledTimeOfDeparture = moment(scheduledTimeOfDeparture, 'YYYY-MM-DDTHH:mm:ss.SSS').format(
      'DD.MM / HH:mm'
    );

    city = cityOfArrival;
    mainTime = scheduledTimeOfDeparture;
    secondaryTime = scheduledTimeOfDeparture;

    if (actualTimeOfDeparture && estimatedTimeOfDeparture) {
      actualTimeOfDeparture = moment(actualTimeOfDeparture, 'YYYY-MM-DDTHH:mm:ss.SSS').format(
        'DD.MM / HH:mm'
      );
      estimatedTimeOfDeparture = moment(estimatedTimeOfDeparture, 'YYYY-MM-DDTHH:mm:ss.SSS').format(
        'DD.MM / HH:mm'
      );
      mainTime = actualTimeOfDeparture;
      secondaryTime = estimatedTimeOfDeparture;
    } else if (estimatedTimeOfDeparture) {
      estimatedTimeOfDeparture = moment(estimatedTimeOfDeparture, 'YYYY-MM-DDTHH:mm:ss.SSS').format(
        'DD.MM / HH:mm'
      );
      mainTime = estimatedTimeOfDeparture;
    }
  }

  return { city, mainTime, secondaryTime };
}

export default receiveFlights;
