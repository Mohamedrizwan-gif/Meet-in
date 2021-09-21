import { manageReducer, authReducer, streamReducer, manageAction } from '../index';

describe('Redux store', () => {
    const previousState = { route_meet: false, spin: true, flip_camera: 0 };
    test('managestate should return the initial state', () => {
        expect(manageReducer(undefined, {})).toEqual({
            route_meet: false,
            spin: true,
            flip_camera: 0
        });
    });
    test('managestate should handle route_meet state being added to it', () => {
        expect(manageReducer(previousState, manageAction.setrouteMeet(true))).toEqual({
            route_meet: true,
            spin: true,
            flip_camera: 0
        });
    });
    test('managestate should handle spin state being added to it', () => {
        expect(manageReducer(previousState, manageAction.setSpin(false))).toEqual({
            route_meet: false,
            spin: false,
            flip_camera: 0
        });
    });
    test('managestate should handle flip_camera state being added to it', () => {
        expect(manageReducer(previousState, manageAction.setFlipCamera(1))).toEqual({
            route_meet: false,
            spin: true,
            flip_camera: 1
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
        });
    });
});