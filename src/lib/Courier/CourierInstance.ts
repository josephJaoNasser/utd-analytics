import { Address, Message, ProfileGetResponse } from '@trycourier/courier/api';
import { COURIER_TOKEN } from '../constants';
import { CourierClient } from '@trycourier/courier';
import api, { ApiFetch } from '../api';
import getStandardBranding from './branding/StandardBranding';

export interface RecipientInformation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  utdId: string;
}

export interface CourierProfile extends RecipientInformation {
  recipient_id: string;
  family_name?: string;
  nickname?: string;
  preffered_name?: string;
  profile?: string;
  picture?: string;
  gender?: string;
  website?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  email_verified?: boolean;
  address?: Address;
  birthdate?: string;
  locale?: string;
  middle_name?: string;
  zoneinfo?: string;
}

/**
 * Creates a courier instance.
 * Includes functions necessary for sending the client's website analytics
 */
class CourierInstance {
  private _client: CourierClient;
  private _manualFetch: ApiFetch;

  constructor() {
    this._client = new CourierClient({ authorizationToken: COURIER_TOKEN });
    this._manualFetch = api('https://api.courier.com', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${COURIER_TOKEN}`,
      },
    });
  }

  /**
   * Send courier message
   * @param config
   * @returns
   */
  private async _sendMessage(config: Message) {
    const { requestId } = await this._client.send({
      message: {
        ...config,
      },
    });

    return { requestId };
  }

  /**
   * Create a courier user. Used for sending to a specific user's courier inbox
   * @param profile
   */
  async createUser(profile: CourierProfile) {
    const { id, firstName, lastName } = profile;

    const payload: ProfileGetResponse = {
      profile: {
        name: firstName + ' ' + lastName,
        firstName,
        lastName,
        first_name: firstName,
        last_name: lastName,
        ...profile,
      },
    };

    try {
      const existingUser = await this._client.profiles.get(profile.recipient_id);

      console.log({ existingUser });
      if (existingUser) {
        // store the courier id
      }

      const { data } = await this._manualFetch.post(`/profiles/${id}`, payload);
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Send analytics email and notification
   * @param analyticsData
   * @param recipients
   * @returns
   */
  async sendAnalytics(analyticsData = {}, recipients: RecipientInformation[]) {
    const ANALYTICS_TEMPLATE_ID = '';
    const res = await this._sendMessage({
      to: recipients.map(r => ({
        user_id: r.id,
      })),
      template: ANALYTICS_TEMPLATE_ID,
      data: {
        ...analyticsData,
      },
      content: {
        version: '1',
        elements: [
          {
            type: 'channel',
            channel: 'mail',
            raw: {
              subject: 'My Subject',
              html: getStandardBranding(),
              text: 'Lorem ipsum dolor, sit amet',
              transformers: ['handlebars', 'mjml'],
            },
          },
        ],
      },
    });

    return res;
  }
}

export default new CourierInstance();
