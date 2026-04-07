import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    total: 0,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCart: (state) => {
            state.items = [];
            state.total = 0;
        },
    },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
