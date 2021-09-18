import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../../../store/index';

import Joinroom from '../joinroom';

const JoinroomCmp = () => {
    return (
        <Provider store={store}>
                <Joinroom/>
        </Provider>
    )
}

describe('<Joinroom/>', () => {
    test('render New Meeting button', () => {
        render(<JoinroomCmp/>, {wrapper: MemoryRouter});
        const buttonElement = screen.getByTestId('New Meeting');
        expect(buttonElement).toBeInTheDocument();
    });
    test('render menuitem1 on clicking New Meeting button', () => {
        render(<JoinroomCmp/>, {wrapper: MemoryRouter});
        const buttonElement = screen.getByTestId('New Meeting');
        fireEvent.click(buttonElement);
        const menuElement1 = screen.getByText('Create a meeting for later');
        expect(menuElement1).toBeInTheDocument(); 
    });
    test('render menuitem2 on clicking New Meeting button', () => {
        render(<JoinroomCmp/>, {wrapper: MemoryRouter});
        const buttonElement = screen.getByTestId('New Meeting');
        fireEvent.click(buttonElement);
        const menuElement1 = screen.getByText('Start an instant meeting');
        expect(menuElement1).toBeInTheDocument(); 
    });
});