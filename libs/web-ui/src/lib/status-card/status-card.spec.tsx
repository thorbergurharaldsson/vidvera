import { render } from '@testing-library/react';

import StatusCard from './status-card';

describe('StatusCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StatusCard />);
    expect(baseElement).toBeTruthy();
  });
});
