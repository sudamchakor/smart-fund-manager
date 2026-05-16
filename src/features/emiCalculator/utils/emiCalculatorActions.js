// D:/IdeaProjects/ReactApp/emiCalculator/src/features/emiCalculator/utils/emiCalculatorActions.js

// Action Types
export const SET_PREPAYMENT_AMOUNT = 'emiCalculator/setPrepaymentAmount';

// Action Creators
export const setPrepaymentAmount = (amount) => ({
  type: SET_PREPAYMENT_AMOUNT,
  payload: amount,
});

// You will need to add a case for SET_PREPAYMENT_AMOUNT in your emiCalculator reducer
// to handle this action and update the state accordingly.
// For example:
/*
const initialState = {
  // ... other state
  prepaymentAmount: 0,
};

const emiCalculatorReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PREPAYMENT_AMOUNT:
      return {
        ...state,
        prepaymentAmount: action.payload,
      };
    // ... other cases
    default:
      return state;
  }
};
*/