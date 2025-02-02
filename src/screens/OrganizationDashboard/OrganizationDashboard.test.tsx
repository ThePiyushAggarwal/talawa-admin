import React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { act, fireEvent, render, screen } from '@testing-library/react';
import 'jest-location-mock';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { store } from 'state/store';
import { StaticMockLink } from 'utils/StaticMockLink';
import OrganizationDashboard from './OrganizationDashboard';
import { EMPTY_MOCKS, ERROR_MOCKS, MOCKS } from './OrganizationDashboardMocks';
import i18nForTest from 'utils/i18nForTest';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import userEvent from '@testing-library/user-event';

async function wait(ms = 100): Promise<void> {
  await act(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
}
const link1 = new StaticMockLink(MOCKS, true);
const link2 = new StaticMockLink(EMPTY_MOCKS, true);
const link3 = new StaticMockLink(ERROR_MOCKS, true);

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

beforeEach(() => {
  localStorage.setItem('FirstName', 'John');
  localStorage.setItem('LastName', 'Doe');
  localStorage.setItem('UserType', 'SUPERADMIN');
  localStorage.setItem(
    'UserImage',
    'https://api.dicebear.com/5.x/initials/svg?seed=John%20Doe'
  );
});

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('Organisation Dashboard Page', () => {
  test('Should render props and text elements test for the screen', async () => {
    await act(async () => {
      render(
        <MockedProvider addTypename={false} link={link1}>
          <BrowserRouter>
            <Provider store={store}>
              <I18nextProvider i18n={i18nForTest}>
                <OrganizationDashboard />
              </I18nextProvider>
            </Provider>
          </BrowserRouter>
        </MockedProvider>
      );
    });

    await wait();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Admins')).toBeInTheDocument();
    expect(screen.getAllByText('Posts')).toHaveLength(2);
    expect(screen.getAllByText('Events')).toHaveLength(2);
    expect(screen.getByText('Blocked Users')).toBeInTheDocument();
    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.getByText('Upcoming events')).toBeInTheDocument();
    expect(screen.getByText('Latest posts')).toBeInTheDocument();
    expect(screen.getByText('Membership requests')).toBeInTheDocument();
    expect(screen.getAllByText('View all')).toHaveLength(3);

    // Checking if events are rendered
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(
      screen.getByText(
        `${dayjs(new Date()).add(1, 'day').format('DD-MM-YYYY')}`
      )
    ).toBeInTheDocument();

    // Checking if posts are rendered
    expect(screen.getByText('Post 1')).toBeInTheDocument();

    // Checking if membership requests are rendered
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  test('Testing buttons and checking empty events, posts and membership requests', async () => {
    await act(async () => {
      render(
        <MockedProvider addTypename={false} link={link2}>
          <BrowserRouter>
            <Provider store={store}>
              <I18nextProvider i18n={i18nForTest}>
                <OrganizationDashboard />
              </I18nextProvider>
            </Provider>
          </BrowserRouter>
        </MockedProvider>
      );
    });

    await wait();
    const viewEventsBtn = screen.getByTestId('viewAllEvents');
    const viewPostsBtn = screen.getByTestId('viewAllPosts');
    const viewMSBtn = screen.getByTestId('viewAllMembershipRequests');

    userEvent.click(viewEventsBtn);
    userEvent.click(viewPostsBtn);
    fireEvent.click(viewMSBtn);
    expect(toast.success).toBeCalledWith('Coming soon!');

    expect(
      screen.getByText('No membership requests present')
    ).toBeInTheDocument();
    expect(screen.getByText('No upcoming events')).toBeInTheDocument();
    expect(screen.getByText('No posts present')).toBeInTheDocument();
  });

  test('Testing error scenario', async () => {
    await act(async () => {
      render(
        <MockedProvider addTypename={false} link={link3}>
          <BrowserRouter>
            <Provider store={store}>
              <I18nextProvider i18n={i18nForTest}>
                <OrganizationDashboard />
              </I18nextProvider>
            </Provider>
          </BrowserRouter>
        </MockedProvider>
      );
    });

    await wait();
    expect(window.location).toBeAt('/orglist');
  });
});
