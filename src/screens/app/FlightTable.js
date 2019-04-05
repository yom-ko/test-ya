import React from 'react';
import { Table, Spinner } from 'reactstrap';

import { getDelayedFlightsOnly, getCityAndTimeOfAFlight } from 'utils/helpers';

const FlightTable = ({ type, delayedOnly, currentTerm, isLoading, flights }) => {
  // Check if only delayed flights were requested
  let flightsToDisplay = flights;
  const currentTermCAP = currentTerm.toUpperCase();

  if (delayedOnly) {
    flightsToDisplay = getDelayedFlightsOnly(flightsToDisplay, type);
  }

  // Filter flights according to the current search term (`live search`)
  flightsToDisplay = flightsToDisplay.filter(flight => {
    const { flight: singleFlightData } = flight;
    const { iataNumber: flightNumber, otherIataNumbers: otherFlightNumbers } = singleFlightData;

    let isOtherFlightNumbersIncludeTerm = false;
    if (otherFlightNumbers) {
      // eslint-disable-next-line max-len
      isOtherFlightNumbersIncludeTerm = otherFlightNumbers.some(number => number.includes(currentTermCAP)
      );
    }

    return flightNumber.includes(currentTermCAP) || isOtherFlightNumbersIncludeTerm;
  });

  // Prepare data rows for the table
  const flightRows = flightsToDisplay.map(flight => {
    // Extract required data from the single flight object
    const { status, departure, arrival, flight: singleFlightData } = flight;
    const { iataNumber: flightNumber, otherIataNumbers: otherFlightNumbers } = singleFlightData;

    let additionalFlightNumbers = '';
    if (otherFlightNumbers) {
      // If there are additional flight numbers,
      // format them for listing within the single table cell.
      additionalFlightNumbers = otherFlightNumbers.map(number => (
        <span key={number}>
          {number}
          <br />
        </span>
      ));
    }

    const { city, mainTime, secondaryTime } = getCityAndTimeOfAFlight(type, departure, arrival);

    // Return actual rows
    return (
      <tr
        key={flightNumber}
        // Color code `abnormal` statuses
        style={{
          color:
            status ===
            ('отменен' || 'летный инцидент' || 'сменил курс' || 'совершил внеплановую посадку') ?
              'red' :
              'unset'
        }}
      >
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

  // Render the entire table
  // or a spinner - if data are not ready yet.
  return (
    <>
      {isLoading ? (
        <Spinner
          color="info"
          style={{
            width: '2rem',
            height: '2rem',
            marginTop: '3rem',
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
                {type === 'arrival' ? ' прилета' : ' вылета'}
              </th>
              <th>
                пункт
                {type === 'arrival' ? ' отправления' : ' прибытия'}
              </th>
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
