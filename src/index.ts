import express from 'express';
import _ from 'lodash';

import {getStoredMarks} from './database';

const app = express();
const PORT = process.env.PORT || 3000;

const getInfoFromURL = (url: string) => {
  const animeName = url.match(/\/([^/]+)\/episode/)![1];
  const episode = parseInt(url.match(/\/episode-([0-9]+)/)![1]);
  const mediaId = parseInt(
    url.match(/\/[^/]+\/episode-[0-9|a-z|A-Z|-]+([0-9]{6})/)![1]
  );

  return {animeName, episode, mediaId};
};

app.get('/', async (req, res) => {
  const url = req.query?.url?.toString() || '';
  console.info('Received Request:', {url});

  try {
    const {mediaId} = getInfoFromURL(url);
    const marks = await getStoredMarks(mediaId);

    if (marks === null) {
      res.status(400).send('Episode not processed =/');
      console.info(`Episode ${url} not processed =/`);
      return;
    }

    res.json(marks);
    console.info('Sending Marks Back', marks, url);
  } catch {
    res.status(400).send('Invalid URL');
    console.info('Invalid url', url);
  }
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
