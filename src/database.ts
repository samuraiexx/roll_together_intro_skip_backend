import {CosmosClient, ItemDefinition} from '@azure/cosmos';
import _ from 'lodash';

interface EpisodesInfo {
  episode: number;
  marks: Marks;
  mediaId: number;
}

interface Marks {
  begin: number;
  end: number;
}

function getDBContainer() {
  const {endpoint, key, databaseId, containerId} = config;

  const client = new CosmosClient({endpoint: endpoint!, key: key!});

  const database = client.database(databaseId);
  const container = database.container(containerId);

  return container;
}

export async function getStoredMarks(mediaId: number): Promise<Marks | null> {
  const response = await getDBContainer()
    .item(mediaId.toString(), mediaId.toString())
    .read()
    .catch(() => null);

  return response?.resource ?? null;
}

export function setStoredMarks(
  animeName: string,
  episodesInfo: EpisodesInfo[]
) {
  const container = getDBContainer();

  episodesInfo.forEach(async ({episode, marks, mediaId}) => {
    const newItem = {
      id: mediaId.toString(),
      animeName,
      episode,
      ...marks,
    } as ItemDefinition;

    const currentItem = await getStoredMarks(mediaId);
    if (currentItem) {
      container.item(mediaId.toString(), mediaId).replace(newItem);
      return;
    }

    container.items.create(newItem);
  });
}

const config = {
  endpoint: process.env.DB_ENDPOINT,
  key: process.env.DB_KEY,
  databaseId: 'skip-marks',
  containerId: 'skip-marks',
};
