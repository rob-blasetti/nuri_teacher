export type LessonSectionKey = 'introduction' | 'quoteAndExamples' | 'story' | 'art' | 'drama';

export type LessonSection = {
  key: LessonSectionKey;
  title: string;
  body: string;
};

export type CurriculumLesson = {
  id: string;
  title: string;
  subtitle: string;
  sections: LessonSection[];
};

export const curriculumLessons: CurriculumLesson[] = [
  {
    id: '6.1',
    title: 'Lesson 6.1',
    subtitle: 'Kindness in action',
    sections: [
      { key: 'introduction', title: 'Introduction', body: 'Open with a short conversation about what kindness looks like at home, in class, and with friends. Ask each child to share one kind thing they noticed this week.' },
      { key: 'quoteAndExamples', title: 'Quote and Examples', body: 'Introduce a short quote about kindness. Repeat it together, then connect it to simple examples such as helping clean up, sharing materials, and including someone in play.' },
      { key: 'story', title: 'Story', body: 'Tell a brief story about a child who chooses kindness when it would have been easier to ignore someone. Pause once or twice to ask what the children think should happen next.' },
      { key: 'art', title: 'Art', body: 'Invite the children to draw a “kindness moment” from the story or from their own lives. Let them explain their picture to the group in one sentence.' },
      { key: 'drama', title: 'Drama', body: 'Act out two short scenes: one where a child is left out and one where they are welcomed in. Ask the group to show with their voices and faces how kindness changes the scene.' },
    ],
  },
  {
    id: '6.2',
    title: 'Lesson 6.2',
    subtitle: 'Speaking truthfully',
    sections: [
      { key: 'introduction', title: 'Introduction', body: 'Begin by asking why people trust one another. Lead into the idea that truthfulness helps a group feel safe and strong.' },
      { key: 'quoteAndExamples', title: 'Quote and Examples', body: 'Practice a quote about truthfulness phrase by phrase. Give examples of telling the truth when admitting a mistake, returning something found, or answering honestly.' },
      { key: 'story', title: 'Story', body: 'Share a story about someone who tells the truth even when it is difficult. Highlight the relief and trust that follow the honest choice.' },
      { key: 'art', title: 'Art', body: 'Have the children create a “truth badge” with symbols or words that remind them to be honest. Invite them to explain their design.' },
      { key: 'drama', title: 'Drama', body: 'Role-play a situation where a toy is broken and the child must decide whether to hide it or speak truthfully. Discuss how each choice affects others.' },
    ],
  },
  {
    id: '6.3',
    title: 'Lesson 6.3',
    subtitle: 'Being generous',
    sections: [
      { key: 'introduction', title: 'Introduction', body: 'Talk about generosity as more than giving objects. Explore how time, attention, and encouragement can also be gifts.' },
      { key: 'quoteAndExamples', title: 'Quote and Examples', body: 'Memorize a quote about generosity and link it to examples like sharing food, helping a younger child, or letting someone else go first.' },
      { key: 'story', title: 'Story', body: 'Tell a story in which a child shares something important and discovers that generosity brings joy to everyone involved.' },
      { key: 'art', title: 'Art', body: 'Make a simple paper “gift card” where each child draws or writes one generous act they want to offer during the week.' },
      { key: 'drama', title: 'Drama', body: 'Invite pairs to act out moments of generosity in school, at home, or on the playground. Encourage the group to name the generous choice in each scene.' },
    ],
  },
  {
    id: '7.1',
    title: 'Lesson 7.1',
    subtitle: 'Learning cooperation',
    sections: [
      { key: 'introduction', title: 'Introduction', body: 'Start with a quick activity that requires the class to work together. Use it to introduce cooperation as a way of reaching a goal with unity.' },
      { key: 'quoteAndExamples', title: 'Quote and Examples', body: 'Review a quote on unity or cooperation. Discuss examples like cleaning together, taking turns, and listening to each other’s ideas.' },
      { key: 'story', title: 'Story', body: 'Share a story where a group succeeds because each person contributes. Point out how cooperation helps everyone shine.' },
      { key: 'art', title: 'Art', body: 'Create one shared class poster instead of individual pages. Each child adds one part so the final artwork depends on everyone’s effort.' },
      { key: 'drama', title: 'Drama', body: 'Use a short skit where a group first argues, then learns to cooperate. Ask the children to show the difference in body language and tone.' },
    ],
  },
  {
    id: '7.2',
    title: 'Lesson 7.2',
    subtitle: 'Showing patience',
    sections: [
      { key: 'introduction', title: 'Introduction', body: 'Ask the class when waiting feels hard. Frame patience as a strength that helps us stay calm and kind when things take time.' },
      { key: 'quoteAndExamples', title: 'Quote and Examples', body: 'Learn a quote about patience and connect it to waiting in line, practicing a difficult skill, or listening while another person speaks.' },
      { key: 'story', title: 'Story', body: 'Tell a story about a child who keeps trying with patience and eventually grows stronger or wiser through the effort.' },
      { key: 'art', title: 'Art', body: 'Invite children to draw a seed becoming a flower as a visual reminder that good things often need time and care.' },
      { key: 'drama', title: 'Drama', body: 'Act out impatient and patient responses to the same challenge. Ask the group which response brings more peace and learning.' },
    ],
  },
  {
    id: '7.3',
    title: 'Lesson 7.3',
    subtitle: 'Living with joy',
    sections: [
      { key: 'introduction', title: 'Introduction', body: 'Begin with an energetic greeting or song, then talk about joy as something we can share and spread through gratitude and service.' },
      { key: 'quoteAndExamples', title: 'Quote and Examples', body: 'Practice a joyful quote together. Explore examples of joy such as welcoming others, encouraging a friend, and appreciating blessings.' },
      { key: 'story', title: 'Story', body: 'Tell a story in which joy grows as people help one another. Emphasize that joy is deeper than excitement and can brighten a whole community.' },
      { key: 'art', title: 'Art', body: 'Create bright “joy cards” using colors and symbols that show thankfulness, friendship, and hope.' },
      { key: 'drama', title: 'Drama', body: 'Invite the class to present quick scenes showing how one joyful action can lift the mood of a family, classroom, or neighborhood.' },
    ],
  },
];

export function getCurriculumLessonById(lessonId: string): CurriculumLesson | undefined {
  return curriculumLessons.find(lesson => lesson.id === lessonId);
}
