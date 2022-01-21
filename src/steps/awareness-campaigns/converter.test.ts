import { AwarenessCampaign } from '../../types';
import { Entities } from '../constants';
import { createAwarenessCampaignEntity } from './converter';

describe('#createAwarenessCampaignEntity', () => {
  test('should convert to entity', () => {
    const awarenessCampaign = {
      percentComplete: 100,
      percentCorrect: 50,
      locked: false,
      numCorrectAnswers: {
        forQuestion1: 2,
      },
      id: 'anId',
      numCompleted: 6,
      allOtherCampaigns: {
        numCorrectAnswers: 4,
        numCampaigns: 3,
        numComplete: 2,
        numSent: 1,
      },
      group: {
        description: 'my group',
        source: 'code?',
        folderCount: 350,
        parentId: 'mom',
        id: 'anotherId',
        userCount: 9001,
      },
      name: 'did ya know?',
      title: {
        defaultGifs: {
          correctGif: 'plankton.gif',
          incorrectGif: 'wrong.gif',
        },
        titleForCustomModule: false,
        correctAnswers: {
          forQuestion1: 3,
        },
        id: 'titleId',
        title: "its'a me",
      },
      createDate: 'now',
      numSent: 6,
      emailCustomized: true,
      launchDate: 'see createDate',
      emailMsg: {
        subject: 'do this thing right now',
        body: 'or else',
      },
    } as AwarenessCampaign;
    const entity = createAwarenessCampaignEntity(awarenessCampaign);
    expect(entity).toEqual(
      expect.objectContaining({
        _key: awarenessCampaign.id,
        _type: Entities.AWARENESS_CAMPAIGN._type,
      }),
    );
  });
});
