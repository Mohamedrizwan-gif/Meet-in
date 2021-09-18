import { createSlice, configureStore } from '@reduxjs/toolkit';


const initialManageState = {
    route_meet: false,
};

const manageSlice = createSlice({
    name: 'manage',
    initialState: initialManageState,
    reducers: {
        setrouteMeet(state, action) {
            state.route_meet = action.payload;
        }
    }
});

const initialAuthState = {
    user_name: localStorage.getItem('auth_name'),
    user_mail: localStorage.getItem('auth_email'),
    user_img: localStorage.getItem('auth_img'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState: initialAuthState,
    reducers: {
        setuserName(state, action) {
            state.user_name = action.payload;
        },
        setuserMail(state, action) {
            state.user_mail = action.payload;
        },
        setuserImg(state, action) {
            state.user_img = action.payload;
        }
    }
});


const initialStreamState = {
    avstream: null,
    screen_stream: null,
    active_badge: null,
    active_stream: null,
    current_peer: null,
    flip_camera: null,
}

const streamSlice = createSlice({
    name: 'stream',
    initialState: initialStreamState,
    reducers: {
        setAVStream(state, action) {
            state.avstream = action.payload;
        },
        setScreenStream(state, action) {
            state.screen_stream = action.payload;
        },
        setActiveBadge(state, action) {
            state.active_badge = action.payload;
        },
        setActiveStream(state, action) {
            state.active_stream = action.payload;
        },
        setCurrentPeer(state, action) {
            state.current_peer = action.payload;
        },
        setFlipCamera(state, action) {
            state.flip_camera = action.payload;
        }
    }
});

export const manageAction = manageSlice.actions;
export const authAction = authSlice.actions;
export const streamAction = streamSlice.actions;

export const manageReducer = manageSlice.reducer; 
export const authReducer = authSlice.reducer;
export const streamReducer = streamSlice.reducer;

const store = configureStore({
    reducer: { manage: manageSlice.reducer, auth: authSlice.reducer, stream: streamSlice.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
});

export default store;