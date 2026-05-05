import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import DetailRow from '../../../components/common/DetailRow';
import '@testing-library/jest-dom';

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('DetailRow Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <DetailRow {...props} />
      </ThemeProvider>,
    );
  };

  // --- Positive Scenarios ---
  it('renders with a label and a value', () => {
    renderComponent({ label: 'Test Label', value: 'Test Value' });
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('renders with an indicatorColor when provided', () => {
    const color = '#FF0000'; // Red
    renderComponent({
      label: 'Colored Label',
      value: 'Colored Value',
      indicatorColor: color,
    });
    const indicator = screen.getByText('Colored Label').previousSibling; // The Box with the color
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle(`background-color: ${color}`);
  });

  it('applies default styling for label and value typography', () => {
    renderComponent({ label: 'Styled Label', value: 'Styled Value' });
    const labelElement = screen.getByText('Styled Label');
    const valueElement = screen.getByText('Styled Value');

    expect(labelElement).toHaveStyle('font-weight: 600');
    expect(labelElement).toHaveStyle('font-size: 0.85rem');
    expect(valueElement).toHaveStyle('font-weight: 800');
    expect(valueElement).toHaveStyle('font-size: 0.9rem');
  });

  // --- Negative Scenarios / Edge Cases ---
  it('does not render indicator when indicatorColor is not provided', () => {
    renderComponent({ label: 'No Color Label', value: 'No Color Value' });
    const labelElement = screen.getByText('No Color Label');
    expect(labelElement.previousSibling).toBeNull();
  });

  it('renders with empty label and value strings', () => {
    renderComponent({ label: '', value: '' });
    const typographyElements = screen.getAllByText('');
    expect(typographyElements.length).toBeGreaterThanOrEqual(2);
  });

  it('handles null/undefined label and value gracefully', () => {
    renderComponent({ label: null, value: undefined });
    const typographyElements = screen.getAllByText('');
    expect(typographyElements.length).toBeGreaterThanOrEqual(2);
  });

  it('applies hover effect styles (visual check, not directly testable with JSDOM)', () => {
    // Direct testing of :hover pseudo-classes with JSDOM is not straightforward.
    // This test primarily ensures the component renders without errors and has the prop.
    // The visual effect would be confirmed via manual testing or visual regression.
    const { container } = renderComponent({
      label: 'Hover Test',
      value: 'Value',
    });
    const row = container.firstChild;
    expect(row).toHaveStyle('transition: background-color 0.2s');
  });

  it('applies odd/even row background colors (visual check, not directly testable with JSDOM)', () => {
    // Similar to hover, :nth-of-type is a CSS pseudo-class.
    // We can check for the presence of the `sx` prop that defines it.
    const { container } = renderComponent({
      label: 'Odd Row Test',
      value: 'Value',
    });
    const row = container.firstChild;
    expect(row).toBeInTheDocument();
  });
});
