export enum JobType {
  Wedding = 'Wedding',
  Engagement = 'Engagement',
  Reception = 'Reception',
  PreWedding = 'Pre-Wedding',
  Birthday = 'Birthday',
  Anniversary = 'Anniversary',
  BabyShower = 'Baby Shower',
  Other = 'Other',
}

export enum Music {
  Default = 'Default',
  Wedding = 'Wedding music',
  GaneshVandana = 'Shree Ganesh vandana',
  Sad = 'Sad song',
  Krishna = 'Krishna song',
  Birthday = 'Happy Birthday',
  BabySong = 'Funny Baby Song',
}

export const MusicPathMap: Record<Music, string> = {
  [Music.Default]: 'Jashn-E-Bahaara',
  [Music.Wedding]: 'wedding-music',
  [Music.GaneshVandana]: 'Shree Ganesh vandana',
  [Music.Sad]: 'SAD',
  [Music.Krishna]: 'little_krishna',
  [Music.Birthday]: 'Happy Birthday',
  [Music.BabySong]: '/unny-baby-song',
};