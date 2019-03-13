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

// FIX: fix the algorithm
export function sanitizeFlights(flights, type) {
  let prevTime;
  let prevCity;

  const newFlights = [];

  for (let i = 0; i < flights.length; i++) {
    const { departure, arrival } = flights[i];

    // If we fetch a list of arrivals
    if (type === 'arrival') {
      const { scheduledTime: time } = departure;
      const { iataCode: city } = arrival;

      if (time === prevTime && city === prevCity) {
        if (newFlights[newFlights.length - 1].flight.otherIataNumbers) {
          newFlights[newFlights.length - 1].flight.otherIataNumbers.push(
            flights[i].flight.iataNumber
          );
        } else {
          newFlights[newFlights.length - 1].flight.otherIataNumbers = [];
          newFlights[newFlights.length - 1].flight.otherIataNumbers.push(
            flights[i].flight.iataNumber
          );
        }
      } else {
        newFlights.push(flights[i]);
      }
      prevTime = time;
      prevCity = city;
    } else {
      // By default, we fetch a list of departures
      const { scheduledTime: time } = arrival;
      const { iataCode: city } = departure;

      if (time === prevTime && city === prevCity) {
        if (newFlights[newFlights.length - 1].flight.otherIataNumbers) {
          newFlights[newFlights.length - 1].flight.otherIataNumbers.push(
            flights[i].flight.iataNumber
          );
        } else {
          newFlights[newFlights.length - 1].flight.otherIataNumbers = [];
          newFlights[newFlights.length - 1].flight.otherIataNumbers.push(
            flights[i].flight.iataNumber
          );
        }
      } else {
        newFlights.push(flights[i]);
      }
      prevTime = time;
      prevCity = city;
    }
  }

  return newFlights;
}

export default fetchFlights;
