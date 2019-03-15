import React from 'react';
import { Col, Form, FormGroup, Input, CustomInput, Button, ButtonGroup } from 'reactstrap';

const SearchForm = ({ type, handleTypePick, handleDelayedPick, handleInputChange }) => (
  <>
    <Form>
      <FormGroup row>
        <Col>
          <ButtonGroup onClick={handleTypePick}>
            <Button color="info" value="departure" active={type === 'departure'}>
              Вылет
            </Button>
            <Button color="info" value="arrival" active={type === 'arrival'}>
              Прилет
            </Button>
          </ButtonGroup>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Col xs={10} sm={10}>
          <Input
            type="search"
            spellCheck="false"
            placeholder="Поиск по номеру рейса"
            onChange={handleInputChange}
          />
        </Col>
        <Col
          xs={2}
          sm={2}
          style={{
            fontSize: '0.9em'
          }}
        >
          <CustomInput
            type="switch"
            id="delayedSwitch"
            name="delayedSwitch"
            label="Только задержанные"
            onClick={handleDelayedPick}
          />
        </Col>
      </FormGroup>
    </Form>
  </>
);

export default SearchForm;
