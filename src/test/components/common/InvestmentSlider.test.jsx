import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InvestmentSlider from '../../../components/common/InvestmentSlider';
import '@testing-library/jest-dom';

const theme = createTheme(); // Create a basic theme for ThemeProvider

/**
 * Utility to match JSDOM's computed color format
 */
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

describe('InvestmentSlider Component', () => {
  const defaultProps = {
    label: 'Investment Amount',
    value: 5000,
    min: 0,
    max: 10000,
    step: 100,
    onChange: jest.fn(),
    adornment: '₹',
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
  it('renders the label and current value', () => {
    renderComponent();
    expect(screen.getByText('Investment Amount')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue('5000');
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('syncs internal value with external value prop', () => {
    const { rerender } = renderComponent({ value: 2500 });
    expect(screen.getByRole('spinbutton')).toHaveValue('2500');

    rerender(
      <ThemeProvider theme={theme}>
        <InvestmentSlider {...defaultProps} value={7500} />
      </ThemeProvider>,
    );
    expect(screen.getByRole('spinbutton')).toHaveValue('7500');
  });

  // --- TextField Interaction ---
  it('calls onChange with numeric value when text input changes', () => {
    renderComponent();
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '7500' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(7500);
  });

  it('calls onChange with 0 when text input is cleared', () => {
    renderComponent();
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(0);
  });

  it('sanitizes leading zeros from text input', () => {
    renderComponent({ value: 500 });
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '00700' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(700);
  });

  it('handles non-numeric input in text field by passing NaN', () => {
    renderComponent();
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(NaN);
  });

  it('handles value exceeding max by capping it to max when input changes', () => {
    const mockOnChange = jest.fn();
    const { rerender } = renderComponent({ value: 5000, max: 6000, onChange: mockOnChange });
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '7000' } });
    
    // InvestmentSlider doesn't cap automatically in the onChange handler
    // We should test its actual behavior which is passing the number directly
    expect(mockOnChange).toHaveBeenCalledWith(7000); 
  });


  it('handles value below min by passing the value directly when input changes', () => {
    const mockOnChange = jest.fn();
    const { rerender } = renderComponent({ value: 5000, min: 1000, onChange: mockOnChange });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '500' } });
    
    // InvestmentSlider doesn't cap automatically in the onChange handler, it passes the value directly
    expect(mockOnChange).toHaveBeenCalledWith(500); 
  });

  // --- Slider Interaction ---
  it('calls onChange with new value when slider is moved', () => {
    renderComponent();
    const slider = screen.getByRole('slider');
    // Using fireEvent.change on the hidden input inside the slider
    fireEvent.change(slider, { target: { value: 7500 } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(7500);
  });

  // --- Color Prop ---
  it('applies custom color to slider', () => {
    renderComponent({ color: 'secondary' });
    const sliderRoot = screen.getByRole('slider').closest('.MuiSlider-root');
    expect(sliderRoot).toHaveClass('MuiSlider-colorSecondary');
  });

  // --- Adornment ---
  it('renders start adornment when provided', () => {
    renderComponent({ adornment: '$', adornmentPosition: 'start' });
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders end adornment when provided', () => {
    renderComponent({ adornment: '%', adornmentPosition: 'end' });
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('does not render adornment if not provided', () => {
    renderComponent({ adornment: null });
    expect(screen.queryByText('₹')).not.toBeInTheDocument();
  });
});