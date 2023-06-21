import { v4 as uuidv4 } from 'uuid';

const samples = [
  {
    group: 'Social/Emotional',
    month: 2,
    behaviors: [
      'Calms down when spoken to or picked up',
      'Looks at your face',
      'Seems happy to see you when you walk up to her',
      'Smiles when you talk to or smile at her',
    ],
  },
  {
    group: 'Language/Communication',
    month: 2,
    behaviors: ['Makes sounds other than crying', 'Reacts to loud sounds'],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 2,
    behaviors: ['Watches you as you move', 'Looks at a toy for several seconds'],
  },
  {
    group: 'Movement/Physical Development',
    month: 2,
    behaviors: ['Holds head up when on tummy', 'Moves both arms and both legs', 'Opens hands briefly'],
  },
  {
    group: 'Social/Emotional',
    month: 4,
    behaviors: [
      'Smiles on his own to get your attention',
      'Chuckles (not yet a full laugh) when you try to make her laugh',
      'Looks at you, moves, or makes sounds to get or keep your attention',
    ],
  },
  {
    group: 'Language/Communication',
    month: 4,
    behaviors: [
      'Makes sounds like “oooo”, “aahh” (cooing)',
      'Makes sounds back when you talk to him',
      'Turns head towards the sound of your voice',
    ],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 4,
    behaviors: ['If hungry, opens mouth when she sees breast or bottle', 'Looks at his hands with interest'],
  },
  {
    group: 'Movement/Physical Development',
    month: 4,
    behaviors: [
      'Holds head steady without support when you are holding her',
      'Holds a toy when you put it in his hand',
      'Uses her arm to swing at toys',
      'Brings hands to mouth',
      'Pushes up onto elbows/forearms when on tummy',
    ],
  },
  {
    group: 'Social/Emotional',
    month: 6,
    behaviors: ['Knows familiar people', 'Likes to look at himself in a mirror', 'Laughs'],
  },
  {
    group: 'Language/Communication',
    month: 6,
    behaviors: ['Takes turns making sounds with you', 'Blows “raspberries” (sticks tongue out and blows)', 'Makes squealing noises'],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 6,
    behaviors: [
      'Puts things in her mouth to explore them',
      'Reaches to grab a toy he wants',
      'Closes lips to show she doesn’t want more food',
    ],
  },
  {
    group: 'Movement/Physical Development',
    month: 6,
    behaviors: ['Rolls from tummy to back', 'Pushes up with straight arms when on tummy', 'Leans on hands to support himself when sitting'],
  },
  {
    group: 'Social/Emotional',
    month: 9,
    behaviors: [
      'Is shy, clingy, or fearful around strangers',
      'Shows several facial expressions, like happy, sad, angry, and surprised',
      'Looks when you call her name',
      'Reacts when you leave (looks, reaches for you, or cries)',
      'Smiles or laughs when you play peek-a-boo',
    ],
  },
  {
    group: 'Language/Communication',
    month: 9,
    behaviors: ['Makes different sounds like “mamamama” and “babababa”', 'Lifts arms up to be picked up'],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 9,
    behaviors: ['Looks for objects when dropped out of sight (like his spoon or toy)', 'Bangs two things together'],
  },
  {
    group: 'Movement/Physical Development',
    month: 9,
    behaviors: [
      'Gets to a sitting position by herself',
      'Moves things from one hand to her other hand',
      'Uses fingers to “rake” food towards himself',
      'Sits without support',
    ],
  },
  {
    group: 'Social/Emotional',
    month: 12,
    behaviors: ['Plays games with you, like pat-a-cake'],
  },
  {
    group: 'Language/Communication',
    month: 12,
    behaviors: [
      'Waves “bye-bye”',
      'Calls a parent “mama” or “dada” or another special name',
      'Understands “no” (pauses briefly or stops when you say it)',
    ],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 12,
    behaviors: ['Puts something in a container, like a block in a cup', 'Looks for things he sees you hide, like a toy under a blanket'],
  },
  {
    group: 'Movement/Physical Development',
    month: 12,
    behaviors: [
      'Pulls up to stand',
      'Walks, holding on to furniture',
      'Drinks from a cup without a lid, as you hold it',
      'Picks things up between thumb and pointer finger, like small bits of food',
    ],
  },
  {
    group: 'Social/Emotional',
    month: 15,
    behaviors: [
      'Copies other children while playing, like taking toys out of a container when another child does',
      'Shows you an object she likes',
      'Claps when excited',
      'Hugs stuffed doll or other toy',
      'Shows you affection (hugs, cuddles, or kisses you)',
    ],
  },
  {
    group: 'Language/Communication',
    month: 15,
    behaviors: [
      'Tries to say one or two words besides “mama” or “dada,” like “ba” for ball or “da” for dog',
      'Looks at a familiar object when you name it',
      'Follows directions given with both a gesture and words. For example, he gives you a toy when you hold out your hand and say, “Give me the toy.”',
      'Points to ask for something or to get help',
    ],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 15,
    behaviors: ['Tries to use things the right way, like a phone, cup, or book', 'Stacks at least two small objects, like blocks'],
  },
  {
    group: 'Movement/Physical Development',
    month: 15,
    behaviors: ['Takes a few steps on his own', 'Uses fingers to feed herself some food'],
  },
  {
    group: 'Social/Emotional',
    month: 18,
    behaviors: [
      'Moves away from you, but looks to make sure you are close by',
      'Points to show you something interesting',
      'Puts hands out for you to wash them',
      'Looks at a few pages in a book with you',
      'Helps you dress him by pushing arm through sleeve or lifting up foot',
    ],
  },
  {
    group: 'Language/Communication',
    month: 18,
    behaviors: [
      'Tries to say three or more words besides “mama” or “dada”',
      'Follows one-step directions without any gestures, like giving you the toy when you say, “Give it to me.”',
    ],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 18,
    behaviors: ['Copies you doing chores, like sweeping with a broom', 'Plays with toys in a simple way, like pushing a toy car'],
  },
  {
    group: 'Movement/Physical Development',
    month: 18,
    behaviors: [
      'Walks without holding on to anyone or anything',
      'Scribbles',
      'Drinks from a cup without a lid and may spill sometimes',
      'Feeds herself with her fingers',
      'Tries to use a spoon',
      'Climbs on and off a couch or chair without help',
    ],
  },
  {
    group: 'Social/Emotional',
    month: 24,
    behaviors: [
      'Notices when others are hurt or upset, like pausing or looking sad when someone is crying',
      'Looks at your face to see how to react in a new situation',
    ],
  },
  {
    group: 'Language/Communication',
    month: 24,
    behaviors: [
      'Points to things in a book when you ask, like “Where is the bear?”',
      'Says at least two words together, like “More milk.”',
      'Points to at least two body parts when you ask him to show you',
      'Uses more gestures than just waving and pointing, like blowing a kiss or nodding yes',
    ],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 24,
    behaviors: [
      'Holds something in one hand while using the other hand; for example, holding a container and taking the lid off',
      'Tries to use switches, knobs, or buttons on a toy',
      'Plays with more than one toy at the same time, like putting toy food on a toy plate',
    ],
  },
  {
    group: 'Movement/Physical Development',
    month: 24,
    behaviors: ['Kicks a ball', 'Runs', 'Walks (not climbs) up a few stairs with or without help', 'Eats with a spoon'],
  },
  {
    group: 'Social/Emotional',
    month: 30,
    behaviors: [
      'Plays next to other children and sometimes plays with them',
      'Shows you what she can do by saying, “Look at me!”',
      'Follows simple routines when told, like helping to pick up toys when you say, “It’s clean-up time.”',
    ],
  },
  {
    group: 'Language/Communication',
    month: 30,
    behaviors: [
      'Says about 50 words',
      'Says two or more words together, with one action word, like “Doggie run”',
      'Names things in a book when you point and ask, “What is this?”',
      'Says words like “I,” “me,” or “we”',
    ],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 30,
    behaviors: [
      'Uses things to pretend, like feeding a block to a doll as if it were food',
      'Shows simple problem-solving skills, like standing on a small stool to reach something',
      'Follows two-step instructions like “Put the toy down and close the door.”',
      'Shows he knows at least one color, like pointing to a red crayon when you ask, “Which one is red?”',
    ],
  },
  {
    group: 'Movement/Physical Development',
    month: 30,
    behaviors: [
      'Uses hands to twist things, like turning doorknobs or unscrewing lids',
      'Takes some clothes off by himself, like loose pants or an open jacket',
      'Jumps off the ground with both feet',
      'Turns book pages, one at a time, when you read to her',
    ],
  },
  {
    group: 'Social/Emotional',
    month: 36,
    behaviors: [
      'Calms down within 10 minutes after you leave her, like at a childcare drop off',
      'Notices other children and joins them to play',
    ],
  },
  {
    group: 'Language/Communication',
    month: 36,
    behaviors: [
      'Talks with you in conversation using at least two back-and-forth exchanges',
      'Asks “who,” “what,” “where,” or “why” questions, like “Where is mommy/daddy?”',
      'Says what action is happening in a picture or book when asked, like “running,” “eating,” or “playing”',
      'Says first name, when asked',
      'Talks well enough for others to understand, most of the time',
    ],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 36,
    behaviors: ['Draws a circle, when you show him how', 'Avoids touching hot objects, like a stove, when you warn her'],
  },
  {
    group: 'Movement/Physical Development',
    month: 36,
    behaviors: [
      'Strings items together, like large beads or macaroni',
      'Puts on some clothes by himself, like loose pants or a jacket',
      'Uses a fork',
    ],
  },
  {
    group: 'Social/Emotional',
    month: 48,
    behaviors: [
      'Pretends to be something else during play (teacher, superhero, dog)',
      'Asks to go play with children if none are around, like “Can I play with Alex?”',
      'Comforts others who are hurt or sad, like hugging a crying friend',
      'Avoids danger, like not jumping from tall heights at the playground',
      'Likes to be a “helper”',
      'Changes behavior based on where she is (place of worship, library, playground)',
    ],
  },
  {
    group: 'Language/Communication',
    month: 48,
    behaviors: [
      'Says sentences with four or more words',
      'Says some words from a song, story, or nursery rhyme',
      'Talks about at least one thing that happened during his day, like “I played soccer.”',
      'Answers simple questions like “What is a coat for?” or “What is a crayon for?”',
    ],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 48,
    behaviors: [
      'Names a few colors of items',
      'Tells what comes next in a well-known story',
      'Draws a person with three or more body parts',
    ],
  },
  {
    group: 'Movement/Physical Development',
    month: 48,
    behaviors: [
      'Catches a large ball most of the time',
      'Serves himself food or pours water, with adult supervision',
      'Unbuttons some buttons',
      'Holds crayon or pencil between fingers and thumb (not a fist)',
    ],
  },
  {
    group: 'Social/Emotional',
    month: 60,
    behaviors: [
      'Follows rules or takes turns when playing games with other children',
      'Sings, dances, or acts for you',
      'Does simple chores at home, like matching socks or clearing the table after eating',
    ],
  },
  {
    group: 'Language/Communication',
    month: 60,
    behaviors: [
      'Tells a story she heard or made up with at least two events. For example, a cat was stuck in a tree and a firefighter saved it',
      'Answers simple questions about a book or story after you read or tell it to him',
      'Keeps a conversation going with more than three back-and-forth exchanges',
      'Uses or recognizes simple rhymes (bat-cat, ball-tall)',
    ],
  },
  {
    group: 'Cognitive (learning, thinking, problem-solving)',
    month: 60,
    behaviors: [
      'Counts to 10',
      'Names some numbers between 1 and 5 when you point to them',
      'Uses words about time, like “yesterday,” “tomorrow,” “morning,” or “night”',
      'Pays attention for 5 to 10 minutes during activities. For example, during story time or making arts and crafts (screen time does not count)',
      'Writes some letters in her name',
      'Names some letters when you point to them',
    ],
  },
  {
    group: 'Movement/Physical Development',
    month: 60,
    behaviors: ['Buttons some buttons', 'Hops on one foot'],
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    try {
      const existedBehaviors = await queryInterface.sequelize.query(
        `
        SELECT * FROM milestone_standard_behavior
        `
      );

      if (!existedBehaviors[0].length) {
        const groups = await queryInterface.sequelize.query(
          `
          SELECT * FROM milestone_standard_group
          `
        );
        const ages = await queryInterface.sequelize.query(
          `
          SELECT * FROM milestone_standard_age
          `
        );

        const behaviors = [];

        samples.forEach((sample) => {
          sample.behaviors.forEach((behavior) => {
            behaviors.push({
              id: uuidv4(),
              group_id: groups[0].find((group) => group.name === sample.group).id,
              age_id: ages[0].find((age) => age.month + age.year * 12 === sample.month).id,
              behavior,
            });
          });
        });
        const statesAdded = [];
        for (const behavior of behaviors) {
          const record = await queryInterface.rawSelect(
            'milestone_standard_behavior',
            {
              where: {
                group_id: behavior.group_id,
                age_id: behavior.age_id,
                behavior: behavior.behavior,
              },
            },
            ['id']
          );

          if (!record) {
            statesAdded.push({ ...behavior, id: uuidv4() });
          }
        }
        if (statesAdded.length) return queryInterface.bulkInsert('milestone_standard_behavior', statesAdded);
      }
    } catch (error) {
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('milestone_standard_behavior', []);
  },
};
