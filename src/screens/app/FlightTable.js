import React from 'react';
import { Table, Spinner } from 'reactstrap';

import { getDelayedFlightsOnly, getCityAndTimeFor1Flight } from 'utils/helpers';

const FlightTable = ({ type, delayedOnly, currentTerm, isLoading, flights }) => {
  // Check if only delayed flights were requested
  let flightsToDisplay = flights;
  const upCurrentTerm = currentTerm.toUpperCase();

  if (delayedOnly) {
    flightsToDisplay = getDelayedFlightsOnly(flightsToDisplay, type);
  }

  flightsToDisplay = flightsToDisplay.filter(flight => {
    const { flight: flightData } = flight;
    const { iataNumber: flightNumber, otherIataNumbers: otherFlightNumbers } = flightData;

    let otherFlightNumbersIncludeTerm = false;
    if (otherFlightNumbers) {
      otherFlightNumbersIncludeTerm = otherFlightNumbers.some(number => number.includes(upCurrentTerm)
      );
    }

    return flightNumber.includes(upCurrentTerm) || otherFlightNumbersIncludeTerm;
  });

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

    const { city, mainTime, secondaryTime } = getCityAndTimeFor1Flight(type, departure, arrival);

    return (
      <tr key={flightNumber} style={{ color: status === 'отменен' ? 'red' : 'unset' }}>
        <td>
          <s>{secondaryTime === mainTime ? '' : secondaryTime}</s>
        </td>
        <td>{mainTime}</td>
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
        <Table hover>
          <thead
            style={{
              backgroundColor: '#dee2e6'
            }}
          >
            <tr>
              <th colSpan="2" style={{ textAlign: 'center' }}>
                дата / время
                {' '}
                {type === 'arrival' ? 'прилета' : 'вылета'}
              </th>
              <th>{type === 'arrival' ? 'пункт отправления' : 'пункт прибытия'}</th>
              <th>рейс №</th>
              <th>статус</th>
            </tr>
          </thead>
          <tbody>{flightRows}</tbody>
        </Table>
      )}
    </>
  );
};

export default FlightTable;
