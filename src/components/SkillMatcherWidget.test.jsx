import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SkillMatcherWidget from './SkillMatcherWidget';

test('rejects unsupported file types', () => {
  const { container } = render(<SkillMatcherWidget />);
  const input = container.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [new File(['x'], 'evil.exe')] } });
  expect(screen.getByRole('alert')).toHaveTextContent(/Unsupported file/);
});

test('rejects files over 3 MB', () => {
  const { container } = render(<SkillMatcherWidget />);
  const input = container.querySelector('input[type="file"]');
  const big = new File(['x'.repeat(4 * 1024 * 1024)], 'big.txt');
  fireEvent.change(input, { target: { files: [big] } });
  expect(screen.getByRole('alert')).toHaveTextContent(/too large/);
});

test('empty submit shows a message and does not call the API', () => {
  global.fetch = jest.fn();
  render(<SkillMatcherWidget />);
  fireEvent.click(screen.getByRole('button', { name: /Run AI Fit Analysis/ }));
  expect(screen.getByRole('alert')).toHaveTextContent(/Paste a job description/);
  expect(global.fetch).not.toHaveBeenCalled();
});

test('shows the grounded result returned by the API', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          score: 72,
          verdict: 'Good fit',
          summary: 'Solid match.',
          matchedSkills: [{ skill: 'Guidewire', strength: 'strong', evidence: 'Led ClaimCenter delivery', source: 'projects' }],
          gaps: [{ skill: 'PMP', priority: 'must', note: 'Not in profile' }],
          sources: [],
        }),
    })
  );
  render(<SkillMatcherWidget />);
  fireEvent.change(screen.getByPlaceholderText(/Paste job description/), {
    target: { value: 'Senior delivery manager with Guidewire ClaimCenter experience and PMP.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Run AI Fit Analysis/ }));

  expect(await screen.findByText('72%')).toBeInTheDocument();
  expect(screen.getByText('PMP')).toBeInTheDocument();
});