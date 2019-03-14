import React from 'react';
import * as moment from 'moment';
import { Table, Spinner } from 'reactstrap';

import { getDelayedFlightsOnly } from 'utils/helpers';

const FlightTable = ({ type, delayedOnly, isLoading, flights }) => {
  // Check if only delayed flights were requested
  let flightsToDisplay = flights;

  if (delayedOnly) {
    flightsToDisplay = getDelayedFlightsOnly(flightsToDisplay, type);
  }

  // Prepare data rows for the table
  const flightRows = flightsToDisplay.map(flight => {
    // Extract required data from the single flight object
    const { status, departure, arrival, flight: flightData } = flight;
    const { iataNumber: flightNumber, otherIataNumbers: otherFlightNumbers } = flightData;

    let additionalFlightNumbers;
    if (otherFlightNumbers) {
      additionalFlightNumbers = otherFlightNumbers.map(number => (
        <span key={number}>
          {number}
          <br />
        </span>
      ));
    } else {
      additionalFlightNumbers = '';
    }

    let city;
    let time;

    if (type === 'arrival') {
      // If we fetch a list of arrivals
      const { scheduledTime: timeOfArrivalAtSVO } = arrival; // time
      const { iataCode: cityOfDeparture } = departure; // city
      city = cityOfDeparture;
      time = moment(timeOfArrivalAtSVO, 'YYYY-MM-DDTHH:mm:ss.SSS').format('DD.MM / HH:mm'); // Format time
    } else {
      // By default, we fetch a list of departures
      const { iataCode: cityOfArrival } = arrival; // city
      const { scheduledTime: timeOfDepartureSVO } = departure; // time
      city = cityOfArrival;
      time = moment(timeOfDepartureSVO, 'YYYY-MM-DDTHH:mm:ss.SSS').format('DD.MM / HH:mm'); // Format time
    }

    return (
      <tr key={flightNumber}>
        <td>{time}</td>
        <td>{city}</td>
        <td>
          {flightNumber}
          <br />
          {additionalFlightNumbers}
        </td>
        <td>{status}</td>
      </tr>
    );
  });

  return (
    <>
      {isLoading ? (
        <Spinner
          color="primary"
          style={{
            width: '2rem',
            height: '2rem',
            marginTop: '3em',
            position: 'absolute',
            left: '40%'
          }}
        />
      ) : (
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
      )}
    </>
  );
};

export default FlightTable;
