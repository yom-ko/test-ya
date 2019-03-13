// Actions
export const actions = {
  // Action types
  REQUESTS_REQUEST: '@app/REQUESTS_REQUEST',
  REQUESTS_RECEIVE: '@app/REQUESTS_RECEIVE',
  REQUEST_ADD: '@app/REQUEST_ADD',

  // Actions
  requestRequests(url) {
    return {
      type: actions.REQUESTS_REQUEST,
      payload: {
        url
      }
    };
  },

  receiveRequests(results) {
    return {
      type: actions.REQUESTS_RECEIVE,
      payload: {
        results
      }
    };
  },

  nextId: 2,
  addRequest(input) {
    const { dateFrom, dateUntil, passengers, price, currency } = input;
    return {
      type: actions.REQUEST_ADD,
      payload: {
        id: `req-0000${(actions.nextId += 1)}`,
        dateFrom,
        dateUntil,
        passengers,
        price,
        currency
      }
    };
  }
};

// Reducers
export const app = (
  state = {
    requestsById: {}
  },
  action = {}
) => {
  const { type, payload } = action;

  switch (type) {
    case actions.REQUESTS_RECEIVE: {
      const { results } = payload;

      let newRequestsById = {};

      results.forEach(result => {
        newRequestsById = { ...newRequestsById, [result.id]: result };
      });

      return {
        ...state,
        requestsById: newRequestsById
      };
    }

    case actions.REQUEST_ADD: {
      const { id, dateFrom, dateUntil, passengers, price, currency } = payload;

      return {
        ...state,
        requestsById: {
          ...state.requestsById,
          [id]: {
            id,
            date_from: dateFrom,
            date_until: dateUntil,
            passengers,
            price,
            currency
          }
        }
      };
    }

    default:
      return state;
  }
};
