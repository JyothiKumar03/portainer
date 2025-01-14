import { AxiosRequestHeaders } from 'axios';

import axios, { parseAxiosError } from '@/portainer/services/axios';
import { EnvironmentId } from '@/react/portainer/environments/types';
import { Registry } from '@/react/portainer/registries/types/registry';

import { buildImageFullURI } from '../utils';

import { encodeRegistryCredentials } from './encodeRegistryCredentials';
import { buildProxyUrl } from './build-url';

interface PullImageOptions {
  environmentId: EnvironmentId;
  image: string;
  nodeName?: string;
  registry?: Registry;
  ignoreErrors: boolean;
}

export async function pullImage({
  environmentId,
  ignoreErrors,
  image,
  nodeName,
  registry,
}: PullImageOptions) {
  const authenticationDetails =
    registry && registry.Authentication
      ? encodeRegistryCredentials(registry.Id)
      : '';

  const imageURI = buildImageFullURI(image, registry);

  const headers: AxiosRequestHeaders = {
    'X-Registry-Auth': authenticationDetails,
  };

  if (nodeName) {
    headers['X-PortainerAgent-Target'] = nodeName;
  }

  try {
    await axios.post(buildProxyUrl(environmentId, { action: 'create' }), null, {
      params: {
        fromImage: imageURI,
      },
      headers,
    });
  } catch (err) {
    if (ignoreErrors) {
      return;
    }

    throw parseAxiosError(err as Error, 'Unable to pull image');
  }
}
