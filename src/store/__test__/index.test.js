import { manageReducer, authReducer, streamReducer, manageAction } from '../index';

describe('Redux store', () => {
    test('managestate should return the initial state', () => {
        expect(manageReducer(undefined, {})).toEqual({
            route_meet: false
        });
    });
    test('managestate should handle route_meet state being added to it', () => {
        const previousState = { route_meet: false }
        expect(manageReducer(previousState, manageAction.setrouteMeet(true))).toEqual({
            route_meet: true
        });
    });
    test('authstate should return the initial state', () => {
        expect(authReducer(undefined, {})).toEqual({
            user_name: null,
            user_mail: null,
            user_img: null
        });
    });
    test('streamstate should return the initial state', () => {
        expect(streamReducer(undefined, {})).toEqual({
            avstream: null,
            screen_stream: null,
            active_badge: null,
            active_stream: null,
            current_peer: null,
            flip_camera: null
        })
    });
});