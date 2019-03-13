import React from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import Octicon, { Calendar } from '@githubprimer/octicons-react';
import { Col, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';

const DatePicker = ({ startDate, handleDatePick }) => (
  <>
    <Col>
      <DateRangePicker
        containerStyles={{
          width: '100%'
        }}
        singleDatePicker
        onEvent={handleDatePick}
      >
        <InputGroup id="datepicker_group">
          <Input type="text" value={startDate} onChange={() => {}} />
          <InputGroupAddon addonType="append">
            <InputGroupText>
              <Octicon icon={Calendar} size="small" />
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </DateRangePicker>
    </Col>
  </>
);

export default DatePicker;
