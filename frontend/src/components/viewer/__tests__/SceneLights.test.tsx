import { render } from '@testing-library/react';
import SceneLights from '../SceneLights';

describe('SceneLights', () => {
  it('should render lighting setup', () => {
    const { container } = render(<SceneLights />);
    expect(container).toBeDefined();
  });
});