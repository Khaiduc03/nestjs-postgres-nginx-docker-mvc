import { v2 } from 'cloudinary';
import { API_KEY, API_SECRET, CLOUD_NAME } from 'src/environments';

export const CloudProvider = {
  provide: 'Cloud',
  useFactory: (): void => {
    v2.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
      secure: true,
    });
  },
};
