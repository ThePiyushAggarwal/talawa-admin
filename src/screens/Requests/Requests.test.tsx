import React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import 'jest-localstorage-mock';
import 'jest-location-mock';

import Requests from './Requests';
import {
  ACCEPT_ADMIN_MUTATION,
  REJECT_ADMIN_MUTATION,
} from 'GraphQl/Mutations/mutations';
import {
  ORGANIZATION_CONNECTION_LIST,
  USER_LIST,
  USER_ORGANIZATION_LIST,
} from 'GraphQl/Queries/Queries';
import { store } from 'state/store';
import userEvent from '@testing-library/user-event';
import i18nForTest from 'utils/i18nForTest';
import { StaticMockLink } from 'utils/StaticMockLink';
import { ToastContainer } from 'react-toastify';

const MOCKS = [
  {
    request: {
      query: USER_ORGANIZATION_LIST,
      variables: { id: localStorage.getItem('id') },
    },
    result: {
      data: {
        user: {
          userType: 'SUPERADMIN',
          firstName: 'John',
          lastName: 'Doe',
          image: '',
          email: 'John_Does_Palasidoes@gmail.com',
          adminFor: {
            _id: 1,
            name: 'Akatsuki',
            image: '',
          },
        },
      },
    },
  },
  {
    request: {
      query: USER_LIST,
    },
    result: {
      data: {
        users: [
          {
            _id: '123',
            firstName: 'John',
            lastName: 'Doe',
            image: 'dummyImage',
            email: 'johndoe@gmail.com',
            userType: 'SUPERADMIN',
            adminApproved: true,
            createdAt: '20/06/2022',
            organizationsBlockedBy: [
              {
                _id: '256',
                name: 'ABC',
              },
            ],
            joinedOrganizations: [
              {
                __typename: 'Organization',
                _id: '6401ff65ce8e8406b8f07af1',
              },
            ],
          },
          {
            _id: '456',
            firstName: 'Sam',
            lastName: 'Smith',
            image: 'dummyImage',
            email: 'samsmith@gmail.com',
            userType: 'ADMIN',
            adminApproved: false,
            createdAt: '20/06/2022',
            organizationsBlockedBy: [
              {
                _id: '256',
                name: 'ABC',
              },
            ],
            joinedOrganizations: [
              {
                __typename: 'Organization',
                _id: '6401ff65ce8e8406b8f07af2',
              },
            ],
          },
          {
            _id: '789',
            firstName: 'Peter',
            lastName: 'Parker',
            image: 'dummyImage',
            email: 'peterparker@gmail.com',
            userType: 'USER',
            adminApproved: true,
            createdAt: '20/06/2022',
            organizationsBlockedBy: [
              {
                _id: '256',
                name: 'ABC',
              },
            ],
            joinedOrganizations: [
              {
                __typename: 'Organization',
                _id: '6401ff65ce8e8406b8f07af3',
              },
            ],
          },
        ],
      },
    },
  },
  {
    request: {
      query: ACCEPT_ADMIN_MUTATION,
      variables: {
        id: '123',
        userType: 'ADMIN',
      },
    },
    result: {
      data: {
        acceptAdmin: true,
      },
    },
  },
  {
    request: {
      query: REJECT_ADMIN_MUTATION,
      variables: {
        id: '123',
        userType: 'ADMIN',
      },
    },
    result: {
      data: {
        rejectAdmin: true,
      },
    },
  },
];

const EMPTY_ORG_MOCKS = [
  {
    request: {
      query: ACCEPT_ADMIN_MUTATION,
      variables: {
        id: '123',
        userType: 'ADMIN',
      },
    },
    result: {
      data: undefined,
    },
  },
  {
    request: {
      query: REJECT_ADMIN_MUTATION,
      variables: {
        id: '123',
        userType: 'ADMIN',
      },
    },
    result: {
      data: undefined,
    },
  },
  {
    request: {
      query: ORGANIZATION_CONNECTION_LIST,
    },
    result: {
      data: {
        organizationsConnection: [],
      },
    },
  },
];

const ORG_LIST_MOCK = [
  ...MOCKS,
  {
    request: {
      query: ORGANIZATION_CONNECTION_LIST,
    },
    result: {
      data: {
        organizationsConnection: [
          {
            _id: 1,
            image: '',
            name: 'Akatsuki',
            creator: {
              firstName: 'John',
              lastName: 'Doe',
            },
            admins: [
              {
                _id: '123',
              },
            ],
            members: {
              _id: '234',
            },
            createdAt: '02/02/2022',
            location: 'Washington DC',
          },
        ],
      },
    },
  },
];

const link = new StaticMockLink(MOCKS, true);
const link2 = new StaticMockLink(EMPTY_ORG_MOCKS, true);
const link3 = new StaticMockLink(ORG_LIST_MOCK, true);

async function wait(ms = 100): Promise<void> {
  await act(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
}

describe('Testing Request screen', () => {
  test('Component should be rendered properly', async () => {
    window.location.assign('/orglist');
    localStorage.setItem('UserType', 'SUPERADMIN');
    render(
      <MockedProvider addTypename={false} link={link3}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();
    expect(screen.getByTestId(/searchByName/i)).toBeInTheDocument();
    expect(window.location).toBeAt('/orglist');
  });

  test('Testing, If userType is not SUPERADMIN', async () => {
    localStorage.setItem('UserType', 'USER');

    render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();
  });

  test('Testing seach by name functionality', async () => {
    render(
      <MockedProvider addTypename={false} link={link3}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();
  });

  test('Testing accept user functionality', async () => {
    render(
      <MockedProvider addTypename={false} link={link3}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();
    userEvent.click(screen.getByTestId(/acceptUser456/i));
  });

  test('Testing reject user functionality', async () => {
    render(
      <MockedProvider addTypename={false} link={link3}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();
    userEvent.click(screen.getByTestId(/rejectUser456/i));
  });

  test('Should render warning alert when there are no organizations', async () => {
    const { container } = render(
      <MockedProvider addTypename={false} link={link2}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <ToastContainer />
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait(200);

    expect(container.textContent).toMatch(
      'Organizations not found, please create an organization through dashboard'
    );
  });

  test('Should not render warning alert when there are organizations present', async () => {
    const { container } = render(
      <MockedProvider addTypename={false} link={link3}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <ToastContainer />
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();

    expect(container.textContent).not.toMatch(
      'Organizations not found, please create an organization through dashboard'
    );
  });
});
