import { render } from '@testing-library/react';

import SearchBar from './search-bar';

describe('SearchBar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <SearchBar
        searchFunction={function (searchTerm: string): void {
          throw new Error('Function not implemented.');
        }}
      />
    );
    expect(baseElement).toBeTruthy();
  });
});
