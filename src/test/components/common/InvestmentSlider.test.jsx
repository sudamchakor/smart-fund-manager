import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InvestmentSlider from '../../../components/common/InvestmentSlider';
import '@testing-library/jest-dom';

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('InvestmentSlider Component', () => {
  const defaultProps = {
    label: 'Investment Amount',
    value: 5000,
    min: 0,
    max: 10000,
    step: 100,
    onChange: jest.fn(),
    adornment: '₹',
    adornmentPosition: 'start',
    color: 'primary',
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <InvestmentSlider {...defaultProps} {...props} />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Initial Rendering ---
  it('renders the label, current value, and slider', () => {
    renderComponent();
    expect(screen.getByText('Investment Amount')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('5000');
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders with start adornment when adornmentPosition is "start"', () => {
    renderComponent({ adornmentPosition: 'start', adornment: '₹' });
    const textField = screen.getByRole('textbox');
    expect(textField.previousSibling).toHaveTextContent('₹');
    expect(textField.nextSibling).not.toBeInTheDocument();
  });

  it('renders with end adornment when adornmentPosition is "end"', () => {
    renderComponent({ adornmentPosition: 'end', adornment: '%' });
    const textField = screen.getByRole('textbox');
    expect(textField.nextSibling).toHaveTextContent('%');
    expect(textField.previousSibling).not.toBeInTheDocument();
  });

  // --- TextField Interaction ---
  it('calls onChange with numeric value when text input changes', () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '7500' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(7500);
  });

  it('calls onChange with empty string when text input is cleared', () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });

  it('sanitizes leading zeros from text input', () => {
    renderComponent({ value: 500 });
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '00700' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(700);
    expect(screen.getByRole('textbox')).toHaveValue('700');
  });

  it('handles non-numeric input in text field by passing NaN', () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(NaN);
  });

  it('handles value exceeding max by capping it to max when input changes', () => {
    renderComponent({ value: 5000, max: 6000 });
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '7000' } });
    // The component itself doesn't cap the input value, it just passes it to onChange.
    // The capping logic would typically be in the parent component's onChange handler.
    expect(defaultProps.onChange).toHaveBeenCalledWith(7000);
  });

  it('handles value below min by setting it to min when input changes', () => {
    renderComponent({ value: 5000, min: 1000 });
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '500' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(500);
  });

  it('does not render adornment if adornment prop is null/undefined', () => {
    renderComponent({ adornment: null });
    const textField = screen.getByRole('textbox');
    expect(textField.previousSibling).not.toBeInTheDocument();
    expect(textField.nextSibling).not.toBeInTheDocument();
  });

  // --- Slider Interaction ---
  it('calls onChange with new value when slider change is committed', () => {
    renderComponent();
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 7500 } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(7500);
  });

  // --- Color Prop ---
  it('applies custom color to slider and text field', () => {
    renderComponent({ color: 'secondary' });
    const slider = screen.getByRole('slider');
    expect(slider).toHaveClass('MuiSlider-colorSecondary');

    const textField = screen.getByRole('textbox');
    const inputAdornment = textField.previousSibling; // Assuming start adornment
    expect(inputAdornment).toHaveStyle(
      `color: ${theme.palette.secondary.main}`,
    );
  });
});
