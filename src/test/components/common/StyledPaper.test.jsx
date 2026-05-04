import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import StyledPaper from '../../../components/common/StyledPaper';
import '@testing-library/jest-dom';

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('StyledPaper Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <StyledPaper {...props} />
      </ThemeProvider>
    );
  };

  // --- Positive Scenarios ---
  it('renders children correctly', () => {
    renderComponent({ children: <div data-testid="child-element">Test Child</div> });
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('applies default Paper styles', () => {
    renderComponent({ children: <div>Content</div> });
    const paper = screen.getByTestId('styled-paper');

    expect(paper).toBeInTheDocument();
    expect(paper).toHaveStyle(`padding: ${theme.spacing(2.5)}`);
    expect(paper).toHaveStyle(`border-radius: 12px`);
    expect(paper).toHaveStyle('border: 1px solid');
    expect(paper).toHaveStyle('box-shadow: 0 2px 12px rgba(0,0,0,0.02)');
    expect(paper).toHaveStyle('background-color: #fff'); // Default light theme background.paper
    expect(paper).toHaveStyle('height: 100%');
    expect(paper).toHaveAttribute('elevation', '0'); // Check elevation prop
  });

  it('applies custom sx prop styles, overriding defaults', () => {
    renderComponent({
      children: <div>Custom Styled Content</div>,
      sx: {
        backgroundColor: 'red',
        borderRadius: 1, // Should override default borderRadius
        height: '50%', // Should override default height
      },
    });
    const paper = screen.getByTestId('styled-paper');

    expect(paper).toHaveStyle('background-color: red');
    expect(paper).toHaveStyle(`border-radius: 4px`);
    expect(paper).toHaveStyle('height: 50%');
    // Ensure other default styles are still applied
    expect(paper).toHaveStyle(`padding: ${theme.spacing(2.5)}`);
    expect(paper).toHaveStyle('border: 1px solid');
  });

  // --- Negative Scenarios / Edge Cases ---
  it('renders without children', () => {
    renderComponent({});
    const paper = screen.getByTestId('styled-paper');
    expect(paper).toBeInTheDocument();
    expect(paper).toBeEmptyDOMElement(); // Should have no children
  });

  it('handles empty sx prop gracefully', () => {
    renderComponent({ children: <div>Content</div>, sx: {} });
    const paper = screen.getByTestId('styled-paper');
    expect(paper).toBeInTheDocument();
    // Should still have all default styles
    expect(paper).toHaveStyle(`padding: ${theme.spacing(2.5)}`);
  });

  it('renders with null children', () => {
    renderComponent({ children: null });
    const paper = screen.getByTestId('styled-paper');
    expect(paper).toBeInTheDocument();
    expect(paper).toBeEmptyDOMElement();
  });

  it('renders with undefined children', () => {
    renderComponent({ children: undefined });
    const paper = screen.getByTestId('styled-paper');
    expect(paper).toBeInTheDocument();
    expect(paper).toBeEmptyDOMElement();
  });
});