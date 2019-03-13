import React from 'react';
import { Table } from 'reactstrap';
import * as moment from 'moment';
import * as helpers from 'utils/helpers';

const FlightTable = ({ flights, type, delayedOnly }) => {
  // Sort initial array
  const sortedFlights = flights.sort((a, b) => {
    let {
      departure: { scheduledTime: timeA }
    } = a;
    timeA = moment(timeA, 'YYYY-MM-DDTHH:mm:ss.SSS');

    let {
      departure: { scheduledTime: timeB }
    } = b;
    timeB = moment(timeB, 'YYYY-MM-DDTHH:mm:ss.SSS');

    if (moment(timeA).isBefore(timeB)) {
      return -1;
    }
    if (moment(timeA).isAfter(timeB)) {
      return 1;
    }
    return 0;
  });

  const cityMappedFlights = sortedFlights.map(flight => {
    const { departure, arrival } = flight;
    const { iataCode: city1 } = departure;
    const { iataCode: city2 } = arrival;

    if (helpers.iataCodes[city1]) {
      flight.departure.iataCode = helpers.iataCodes[city1].name;
    }
    if (helpers.iataCodes[city2]) {
      flight.arrival.iataCode = helpers.iataCodes[city2].name;
    }

    return flight;
  });

  let processedFlights = cityMappedFlights;

  if (delayedOnly) {
    processedFlights = processedFlights.filter(flight => {
      const { status, departure, arrival } = flight;

      if (type === 'arrival') {
        return !!arrival.delay && arrival.delay > 1 && status !== 'landed';
      }

      return !!departure.delay && arrival.delay > 1 && status !== 'landed';
    });
  }

  // Prepare data rows for the table
  const flightRows = processedFlights.map(flight => {
    // Extract required data from the single flight object
    const { status, departure, arrival, flight: flightData } = flight;
    const { iataNumber: number, otherIataNumbers } = flightData;

    let additionalIataNumbers;
    if (otherIataNumbers) {
      additionalIataNumbers = otherIataNumbers.map(aNumber => (
        <span key={aNumber}>
          {aNumber}
          <br />
        </span>
      ));
    } else {
      additionalIataNumbers = '';
    }

    // If we fetch a list of arrivals
    if (type === 'arrival') {
      let { scheduledTime: time } = arrival; // time
      // Format time
      time = moment(time, 'YYYY-MM-DDTHH:mm:ss.SSS').format('DD.MM / HH:mm');
      const { iataCode: city } = departure; // city
      return (
        <tr key={number}>
          <td>{time}</td>
          <td>{city}</td>
          <td>
            {number}
            <br />
            {additionalIataNumbers}
          </td>
          <td>{status}</td>
        </tr>
      );
    }

    // By default, we fetch a list of departures
    let { scheduledTime: time } = departure; // time
    // Format time
    time = moment(time, 'YYYY-MM-DDTHH:mm:ss.SSS').format('DD.MM / HH:mm');
    const { iataCode: city } = arrival; // city
    return (
      <tr key={number}>
        <td>{time}</td>
        <td>{city}</td>
        <td>
          {number}
          <br />
          {additionalIataNumbers}
        </td>
        <td>{status}</td>
      </tr>
    );
  });

  return (
    <>
      <Table borderless>
        <thead
          style={{
            backgroundColor: '#ccc',
            fontWeight: 'bold',
            lineHeight: '1.2'
          }}
        >
          <tr>
            <th
              style={{
                borderTopLeftRadius: '6px',
                borderBottomLeftRadius: '6px'
              }}
            >
              Time
            </th>
            <th>City</th>
            <th>Number</th>
            <th
              style={{
                borderTopRightRadius: '6px',
                borderBottomRightRadius: '6px'
              }}
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody>{flightRows}</tbody>
      </Table>
    </>
  );
};

export default FlightTable;
