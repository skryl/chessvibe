import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DebugPanel from '../../components/DebugPanel';

describe('DebugPanel', () => {
  test('displays click events correctly', () => {
    // Mock data with timestamps for realism
    const mockClickEvents = [
      '12:34:56: Test click event 1',
      '12:35:00: Test click event 2'
    ];
    const mockDebugMessages = [
      '12:34:57: Test debug message 1',
      '12:35:01: Test debug message 2'
    ];
    const mockApiEvents = [
      '12:34:58: [TEST] GET /api/test-endpoint (200ms)'
    ];

    // Render component
    const { container, debug } = render(
      <DebugPanel
        clickEvents={mockClickEvents}
        gameDebugMessages={mockDebugMessages}
        apiEvents={mockApiEvents}
        clearClickEvents={() => {}}
        clearGameDebugMessages={() => {}}
        onForceDebugClick={() => {}}
      />
    );

    // First check if the component is rendered at all
    expect(container.querySelector('.debug-panel-container')).toBeInTheDocument();

    // Open the panel by clicking on the toggle
    fireEvent.click(container.querySelector('.debug-panel-toggle'));

    // Check if panel is expanded
    expect(container.querySelector('.debug-panel-container.expanded')).toBeInTheDocument();

    // Check if click events are displayed
    expect(screen.getByText(/Test click event 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test click event 2/)).toBeInTheDocument();

    // Switch to game debug tab
    fireEvent.click(screen.getByText(/Game Debug/));

    // Check if game debug messages are displayed
    expect(screen.getByText(/Test debug message 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test debug message 2/)).toBeInTheDocument();

    // Switch to API debug tab
    fireEvent.click(screen.getByText(/API Debug/));

    // Check if API events are displayed
    expect(screen.getByText(/\[TEST\] GET \/api\/test-endpoint/)).toBeInTheDocument();
  });

  test('handles empty events arrays correctly', () => {
    // Render component with empty arrays
    const { container } = render(
      <DebugPanel
        clickEvents={[]}
        gameDebugMessages={[]}
        apiEvents={[]}
        clearClickEvents={() => {}}
        clearGameDebugMessages={() => {}}
        onForceDebugClick={() => {}}
      />
    );

    // Open panel
    fireEvent.click(container.querySelector('.debug-panel-toggle'));

    // Check if "no events" message is displayed
    expect(screen.getByText(/No click events recorded yet/)).toBeInTheDocument();

    // Switch to game debug tab
    fireEvent.click(screen.getByText(/Game Debug/));

    // Check if "no messages" is displayed
    expect(screen.getByText(/No game debug messages recorded yet/)).toBeInTheDocument();

    // Switch to API debug tab
    fireEvent.click(screen.getByText(/API Debug/));

    // Check if "no API events" is displayed
    expect(screen.getByText(/No API events recorded yet/)).toBeInTheDocument();
  });

  test('internal state updates when new events are provided', () => {
    // Start with some data
    const initialClickEvents = ['12:34:56: Initial click event'];

    // Render component
    const { rerender } = render(
      <DebugPanel
        clickEvents={initialClickEvents}
        gameDebugMessages={[]}
        apiEvents={[]}
        clearClickEvents={() => {}}
        clearGameDebugMessages={() => {}}
        onForceDebugClick={() => {}}
      />
    );

    // Open panel and verify initial event
    fireEvent.click(screen.getByText(/Show Debug Panel/i));
    expect(screen.getByText(/Initial click event/)).toBeInTheDocument();

    // Add new event by re-rendering with new props
    const updatedClickEvents = [
      '12:35:00: New click event',
      '12:34:56: Initial click event'
    ];

    rerender(
      <DebugPanel
        clickEvents={updatedClickEvents}
        gameDebugMessages={[]}
        apiEvents={[]}
        clearClickEvents={() => {}}
        clearGameDebugMessages={() => {}}
        onForceDebugClick={() => {}}
      />
    );

    // Verify new event appears
    expect(screen.getByText(/New click event/)).toBeInTheDocument();
  });

  test('direct DOM interaction with refs works', () => {
    // Mock data
    const mockClickEvents = ['12:34:56: Test click event'];

    // Render component
    const { container } = render(
      <DebugPanel
        clickEvents={mockClickEvents}
        gameDebugMessages={[]}
        apiEvents={[]}
        clearClickEvents={() => {}}
        clearGameDebugMessages={() => {}}
        onForceDebugClick={() => {}}
      />
    );

    // Open panel
    fireEvent.click(container.querySelector('.debug-panel-toggle'));

    // Locate events container
    const eventsContainer = container.querySelector('.events-inner-container');
    expect(eventsContainer).toBeTruthy();

    // Check if event text is in the DOM
    expect(eventsContainer.innerHTML).toContain('Test click event');
  });
});