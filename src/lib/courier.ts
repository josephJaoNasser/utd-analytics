import { COURIER_TOKEN } from './constants';

// interface CourierParams {
//   name: string;
//   email: string;
// }

interface CourierAutomationParams {
  brand: string;
  templates: string;
  recipient: string;
  data: object;
  profile: {
    phone_number?: string;
    email?: string;
  };
}

export async function invokeInactivityAutomation() {
  const payload: CourierAutomationParams = {
    brand: '',
    templates: '',
    recipient: '',
    data: {
      hellow: '',
    },
    profile: {},
  };

  const data = await fetch(
    `https://api.courier.com/automations/b1f86d81-db14-4808-a065-11ef4aab930c/invoke`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COURIER_TOKEN,
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    },
  ).then(res => {
    if (res.ok) return res.json();

    return null;
  });

  return data;
}
