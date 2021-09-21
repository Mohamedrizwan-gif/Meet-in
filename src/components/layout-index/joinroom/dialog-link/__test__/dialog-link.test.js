import { render, screen } from '@testing-library/react';

import DialogLink from '../dialog-link';

describe('<DialogLink/>', () => {
    test('should render title', () => {
        render(<DialogLink open={true}/>);
        const titleElement = screen.getByText('link to your meeting');
        expect(titleElement).toBeInTheDocument();
    });
    test('should render meet id', () => {
        const meetid = 'ead9ea60-fad5-11eb-bf59-a9fac0777ce4';
        render(<DialogLink open={true} meetid={meetid}/>);
        const btnElement = screen.getByText(meetid);
        expect(btnElement).toBeInTheDocument();
    });
});