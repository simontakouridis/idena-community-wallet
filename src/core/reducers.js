import { createSlice } from '@reduxjs/toolkit';

const sliceName = 'general';

const generalSlice = createSlice({
  name: sliceName,
  initialState: {
    value: 0,
    status: 'idle'
  },
  reducers: {
    increment: state => {
      state.value += 1;
    },
    decrement: state => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

const { actions, reducer } = generalSlice;

export const { increment, decrement, incrementByAmount } = actions;

export const actionNames = {
  increment: sliceName + '/increment',
  decrement: sliceName + '/decrement',
  incrementByAmount: sliceName + '/incrementByAmount'
};

export default reducer;
