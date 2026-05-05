import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import BasicInfoDisplay from '../../../features/profile/components/BasicInfoDisplay';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

// Mock the icons to allow for testing
jest.mock('@mui/icons-material/TrendingUp', () => (props) => (
  <svg {...props} data-testid="TrendingUpIcon" />
));
jest.mock('@mui/icons-material/GraphicEq', () => (props) => (
  <svg {...props} data-testid="GraphicEqIcon" />
));

const mockStore = configureStore([]);

describe.skip('BasicInfoDisplay Component - Premium Design', () => {
  const defaultProps = {
    currentAge: 35,
    retirementAge: 55,
    onEdit: jest.fn(),
  };

  let store;

  beforeEach(() => {
    store = mockStore({
      profile: {
        name: 'Sudam Chakor',
        occupation: 'Salaried Professional',
        riskTolerance: 'Low',
        careerGrowthRate: 0.05,
        generalInflationRate: 0.03,
      },
    });
    jest.clearAllMocks();
  });

  const renderWithProvider = (props) => {
    return render(
      <Provider store={store}>
        <BasicInfoDisplay {...props} />
      </Provider>,
    );
  };

  it("renders the user's name and occupation with correct typography", () => {
    renderWithProvider(defaultProps);
    const nameElement = screen.getByText('Sudam Chakor');
    const occupationElement = screen.getByText('Salaried Professional');

    expect(nameElement).toBeInTheDocument();
    expect(occupationElement).toBeInTheDocument();

    // Check for typography styles
    expect(nameElement).toHaveClass('MuiTypography-h4');
    expect(occupationElement).toHaveClass('MuiTypography-subtitle1');
  });

  it('renders the retirement timeline with updated styles', () => {
    renderWithProvider(defaultProps);
    expect(screen.getByText('20 Years Left to Retire')).toBeInTheDocument();
    expect(screen.getByText('Current Age:')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('Retirement:')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
  });

  it('renders the risk tolerance badge correctly', () => {
    renderWithProvider(defaultProps);
    const riskBadge = screen.getByText('Low');
    expect(riskBadge).toBeInTheDocument();
    expect(riskBadge).toHaveStyle('background-color: #e8f5e9');
  });

  it('renders info items with correct icons and values', () => {
    renderWithProvider(defaultProps);
    expect(screen.getByText('Career Growth')).toBeInTheDocument();
    expect(screen.getByText('5.0%')).toBeInTheDocument();
    expect(screen.getByTestId('TrendingUpIcon')).toBeInTheDocument();

    expect(screen.getByText('Inflation Rate')).toBeInTheDocument();
    expect(screen.getByText('3.0%')).toBeInTheDocument();
    expect(screen.getByTestId('GraphicEqIcon')).toBeInTheDocument();
  });

  it('positions the edit icon in the top right corner', () => {
    renderWithProvider(defaultProps);
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
    // Check for absolute positioning styles
    expect(editButton).toHaveStyle('position: absolute');
    expect(editButton).toHaveStyle('top: 16px');
    expect(editButton).toHaveStyle('right: 16px');
  });

  it('calls onEdit when the edit icon is clicked', () => {
    renderWithProvider(defaultProps);
    const editButton = screen.getByRole('button');
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });
});
