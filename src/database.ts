import {CosmosClient} from '@azure/cosmos';
import _ from 'lodash';

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

export async function getStoredFromEtpGUID(
  etpGUID: string
): Promise<Marks | null> {
  const query = `select * from c where c.etp_guid="${etpGUID}"`;
  const response = await getDBContainer()
    .items.query(query)
    .fetchAll()
    .catch(() => null);
  const item = response?.resources?.[0];

  if (_.isNil(item)) {
    return null;
  }

  const {begin, end} = item;
  return {begin, end};
}

export async function getStoredMarks(mediaId: number): Promise<Marks | null> {
  const response = await getDBContainer()
    .item(mediaId.toString(), mediaId.toString())
    .read()
    .catch(() => null);

  if (_.isNil(response) || _.isNil(response.resource)) {
    return null;
  }

  const {begin, end} = response.resource;
  return {begin, end};
}

const config = {
  endpoint: process.env.DB_ENDPOINT,
  key: process.env.DB_KEY,
  databaseId: 'skip-marks',
  containerId: 'skip-marks',
};
