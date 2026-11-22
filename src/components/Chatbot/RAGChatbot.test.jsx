import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RAGChatbot from './RAGChatbot';

const openChat = () => fireEvent.click(screen.getByLabelText('Toggle RAG AI Assistant'));
const getInput = () => screen.getByPlaceholderText(/Ask about Raja/);
const send = (text) => {
  fireEvent.change(getInput(), { target: { value: text } });
  fireEvent.submit(getInput().closest('form'));
};

beforeEach(() => {
  window.speechSynthesis = { cancel: jest.fn(), speak: jest.fn() };
  window.SpeechSynthesisUtterance = function (text) { this.text = text; };
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          answer: 'Line one<br>Line two. <a href="https://www.linkedin.com/in/rajachatterjee84/">LinkedIn</a><script>alert(1)</script>',
          sources: ['companies'],
        }),
    })
  );
});

test('<br> becomes a line break, links are real, scripts are not rendered', async () => {
  const { container } = render(<RAGChatbot />);
  openChat();
  send('Where did he work?');

  expect(await screen.findByText(/Line one/)).toBeInTheDocument();
  expect(container.querySelector('br')).not.toBeNull();
  expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/rajachatterjee84/'
  );
  expect(container.querySelector('script')).toBeNull();
  expect(container.textContent).not.toContain('<br>');
});

test('"hi" is a greeting and does not call the API', () => {
  render(<RAGChatbot />);
  openChat();
  send('hi');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('"history" is not treated as a greeting', async () => {
  render(<RAGChatbot />);
  openChat();
  send('history of his career');
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.anything()));
});

test('input is disabled while the bot is replying', async () => {
  global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
  render(<RAGChatbot />);
  openChat();
  send('What certifications does he hold?');
  await waitFor(() => expect(getInput()).toBeDisabled());
});

test('quick prompt does not clear text the user has typed', async () => {
  render(<RAGChatbot />);
  openChat();
  fireEvent.change(getInput(), { target: { value: 'half written' } });
  fireEvent.click(screen.getByRole('button', { name: 'Companies' }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(getInput()).toHaveValue('half written');
});