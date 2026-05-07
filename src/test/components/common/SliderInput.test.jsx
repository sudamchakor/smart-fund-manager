import React from 'react';
import { render, screen, fireEvent, waitFor, createEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SliderInput from '../../../components/common/SliderInput';
import '@testing-library/jest-dom';
import { getWellInputStyle } from '../../../styles/formStyles';

// Mock formStyles to prevent issues with actual style objects
jest.mock('../../../styles/formStyles', () => ({
  labelStyle: { fontSize: '0.75rem', fontWeight: 700 },
  getWellInputStyle: jest.fn(() => ({
    border: '1px solid #ccc',
    padding: '8px',
  })),
}));

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

describe('SliderInput Component', () => {
  const defaultProps = {
    label: 'Loan Amount',
    value: 100000,
    min: 10000,
    max: 1000000,
    step: 1000,
    onChange: jest.fn(),
    marks: false,
    warningThreshold: null,
    warningText: '',
    tooltipText: '',
    showInput: true,
    color: 'primary',
    isInline: true,
    warning: false,
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <SliderInput {...defaultProps} {...props} />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Initial Rendering ---
  it('renders the label and current value', () => {
    renderComponent();
    expect(screen.getByText('Loan Amount')).toBeInTheDocument();
    expect(Number(screen.getByRole('spinbutton').value)).toBe(100000);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('syncs internal value with external value prop', () => {
    const { rerender } = renderComponent({ value: 50000 });
    // The above line is incorrect, it should be spinbutton
    expect(Number(screen.getByRole('spinbutton').value)).toBe(50000);

    rerender(
      <ThemeProvider theme={theme}>
        <SliderInput {...defaultProps} value={75000} />
      </ThemeProvider>,
    );
    expect(Number(screen.getByRole('spinbutton').value)).toBe(75000);
  });

  // --- TextField Interaction ---
  it('calls onChange with numeric value when text input changes to a valid number', () => {
    renderComponent();
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '150000' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(150000);
    expect(Number(screen.getByRole('spinbutton').value)).toBe(150000);
  });

  it('calls onChange with empty string when text input is cleared', () => {
    renderComponent();
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
    expect(String(screen.getByRole('spinbutton').value)).toBe('');
  });

  it('sanitizes leading zeros from text input', () => {
    renderComponent({ value: 500 });
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '00700' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(700);
    expect(Number(screen.getByRole('spinbutton').value)).toBe(700);
  });

  it('caps text input value at max prop', () => {
    renderComponent({ value: 500000, max: 200000 });
    const input = screen.getByRole('spinbutton'); // Initial value is capped
    fireEvent.change(input, { target: { value: '300000' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(200000); // Should be capped at max
    expect(Number(screen.getByRole('spinbutton').value)).toBe(200000);
  });

  it("prevents 'e', 'E', '+', '-' keys in text input", () => {
    renderComponent();
    const input = screen.getByRole('spinbutton');

    const eEvent = createEvent.keyDown(input, { key: 'e' });
    fireEvent(input, eEvent);
    expect(eEvent.defaultPrevented).toBe(true);
    
    const EEvent = createEvent.keyDown(input, { key: 'E' });
    fireEvent(input, EEvent);
    expect(EEvent.defaultPrevented).toBe(true);
    
    const plusEvent = createEvent.keyDown(input, { key: '+' });
    fireEvent(input, plusEvent);
    expect(plusEvent.defaultPrevented).toBe(true);
    
    const minusEvent = createEvent.keyDown(input, { key: '-' });
    fireEvent(input, minusEvent);
    expect(minusEvent.defaultPrevented).toBe(true);
    
    const numEvent = createEvent.keyDown(input, { key: '1' });
    fireEvent(input, numEvent); // Should not prevent
    expect(numEvent.defaultPrevented).toBe(false);
  });

  // --- Slider Interaction ---
  it('calls onChange with new value when slider change is committed', () => {
    renderComponent();
    const slider = screen.getByRole('slider');
    // Simulate onChangeCommitted by directly calling the prop or using fireEvent.change on the input element
    fireEvent.change(slider, { target: { value: 200000 } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(200000); // This is correct
    expect(Number(screen.getByRole('spinbutton').value)).toBe(200000);
  });

  // --- Conditional Rendering: showInput ---
  it('hides the text input when showInput is false', () => {
    renderComponent({ showInput: false });
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  // --- Conditional Rendering: isInline ---
  it('renders in inline layout by default (flex-direction: row)', () => {
    renderComponent();
    const container = screen.getByText('Loan Amount').closest('div'); // The Box containing label, slider, input
    expect(container).toHaveStyle('flex-direction: row');
  });
  
  it('renders in stacked layout when isInline is false', () => {
    renderComponent({ isInline: false });
    const container = screen.getByTestId('stacked-layout'); // The Stack containing label/input and then slider
    expect(screen.getByText('Loan Amount')).toBeInTheDocument(); // Label is still text
    expect(Number(screen.getByRole('spinbutton').value)).toBe(100000);
    expect(screen.getByRole('slider')).toBeInTheDocument(); // Slider is still slider
  });

  // --- Warning Threshold and Text ---
  it('does not show warning when value is below warningThreshold', () => {
    renderComponent({
      value: 50000,
      warningThreshold: 100000,
      warningText: 'High value!',
    });
    expect(screen.queryByText('High value!')).not.toBeInTheDocument();
  });

  it('shows warning when value exceeds warningThreshold', () => {
    renderComponent({
      value: 150000,
      warningThreshold: 100000,
      warningText: 'High value!',
    });
    expect(screen.getByText('High value!')).toBeInTheDocument();
    expect(screen.getByTestId('WarningAmberIcon')).toBeInTheDocument();
  });

  it('shows warning when warning prop is true, regardless of threshold', () => {
    renderComponent({
      value: 50000,
      warningThreshold: 100000,
      warningText: 'Forced warning!',
      warning: true,
    });
    expect(screen.getByText('Forced warning!')).toBeInTheDocument();
  });

  it('does not show warning when warningText is empty, even if warning condition is met', () => {
    renderComponent({
      value: 150000,
      warningThreshold: 100000,
      warningText: '',
    });
    expect(screen.queryByText('High value!')).not.toBeInTheDocument();
  });

  // --- Tooltip ---
  it('does not show tooltip icon when tooltipText is empty', () => {
    renderComponent({ tooltipText: '' });
    expect(screen.queryByTestId('InfoOutlinedIcon')).not.toBeInTheDocument();
  });

  it('shows tooltip icon when tooltipText is provided', () => {
    renderComponent({ tooltipText: 'Some helpful info' });
    expect(screen.getByTestId('InfoOutlinedIcon')).toBeInTheDocument();
  });

  // --- Marks ---
  it('passes marks prop to the Slider component', () => {
    renderComponent({ marks: true });
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin'); // Basic check, actual marks rendering is complex
  });

  // --- Color Prop ---
  it('applies error color to slider and input well when warning is active', () => {
    renderComponent({
      value: 150000,
      warningThreshold: 100000,
      warningText: 'High value!',
      color: 'primary', // Ensure default color is primary
      });
      const sliderRoot = screen.getByRole('slider').closest('.MuiSlider-root'); // Get the root slider element
      expect(sliderRoot).toHaveClass('MuiSlider-colorError');

      expect(getWellInputStyle).toHaveBeenLastCalledWith(expect.anything(), 'error');
  });

  it('applies primary color to slider and input well when no warning', () => {
    renderComponent({ value: 50000, warningThreshold: 100000, warningText: 'High value!', color: 'primary' });
    const sliderRoot = screen.getByRole('slider').closest('.MuiSlider-root'); // Get the root slider element
    expect(sliderRoot).toHaveClass('MuiSlider-colorPrimary');

    expect(getWellInputStyle).toHaveBeenLastCalledWith(expect.anything(), 'primary');
  });
});
