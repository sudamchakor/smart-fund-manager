import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InputSlider from '../../../components/common/InputSlider';
import '@testing-library/jest-dom';

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('InputSlider Component', () => {
  const defaultProps = {
    label: 'Test Slider',
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    onChange: jest.fn(),
    adornment: 'units',
    adornmentPosition: 'end',
  };

  // Helper function to render the component with ThemeProvider
  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <InputSlider {...defaultProps} {...props} />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Positive Scenarios ---
  it('renders the label and current value', () => {
    renderComponent();
    expect(screen.getByText('Test Slider')).toBeInTheDocument(); // Label is still text
    expect(screen.getByRole('spinbutton')).toHaveValue('50'); // Input is spinbutton
  });

  it('renders with start adornment when adornmentPosition is "start"', () => {
    const { container } = renderComponent({ adornmentPosition: 'start', adornment: '₹' });
    // Check that the container has the adornment text
    expect(container).toHaveTextContent('₹');
    expect(screen.getByRole('spinbutton')).toHaveValue('50');
  });

  it('renders with end adornment when adornmentPosition is "end"', () => {
    const { container } = renderComponent({ adornmentPosition: 'end', adornment: '%' });
    // Check that the container has the adornment text
    expect(container).toHaveTextContent('%');
    expect(screen.getByRole('spinbutton')).toHaveValue('50');
  });

  it('calls onChange when the text input value changes', () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '75' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(75);
  });

  it('calls onChange with empty string if text input is cleared', () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });

  it('calls onChange when the slider value changes', () => {
    renderComponent();
    const sliderInput = screen.getByRole('slider');
    fireEvent.change(sliderInput, { target: { value: 60 } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(60);
  });

  // --- Negative Scenarios / Edge Cases ---
  it('handles null/undefined value gracefully in text input', () => {
    renderComponent({ value: null }); // Pass null value
    expect(screen.getByRole('spinbutton')).toHaveValue(''); // Expect empty string for null
  });

  it('handles non-numeric input in text field by passing NaN or empty string', () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(NaN); // Number('abc') is NaN
  });

  it('does not render adornment if adornment prop is null/undefined', () => {
    renderComponent({ adornment: null });
    expect(screen.queryByText('units')).not.toBeInTheDocument();
  });

  it('renders without crashing if min, max, step are not provided (uses Slider defaults)', () => {
    renderComponent({ min: undefined, max: undefined, step: undefined });
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });
});
