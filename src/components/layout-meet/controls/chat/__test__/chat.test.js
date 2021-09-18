import { render, screen } from '@testing-library/react';

import Chat from '../chat';

describe('<Chat/> component', () => {
    test('chat box should render call messages title and close button', () => {
        render(<Chat open={true} msg={[]}/>);
        const titleElement = screen.getByText('call messages');
        expect(titleElement).toBeInTheDocument();
        const closeButtonElement  = screen.getByTestId('closebtn');
        expect(closeButtonElement).toBeInTheDocument();
    });
    test('chat box should render \'you\' as username and msg when user send', () => {
        const msg = [{
            username: 'Alan',
            message: 'Bye',
            time: '06:15pm',
            me: true
        }];
        render(<Chat open={true} msg={msg}/>);
        const usernameElement = screen.getByText('you 06:15pm');
        expect(usernameElement).toBeInTheDocument();
        const msgElement = screen.getByText('Bye');
        expect(msgElement).toBeInTheDocument();
    });
    test('chat box should render the username and msg when user send', () => {
        const msg = [{
            username: 'Alan',
            message: 'Hi',
            time: '06:15pm',
            me: false
        }];
        render(<Chat open={true} msg={msg}/>);
        const usernameElement = screen.getByText('Alan 06:15pm');
        expect(usernameElement).toBeInTheDocument();
        const msgElement = screen.getByText('Hi');
        expect(msgElement).toBeInTheDocument();
    });
});