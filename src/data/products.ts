import { Product, ProductStatus, ScheduleValue } from '../types';

export const MONTHS = [
  '4前','4後','5前','5後','6前','6後','7前','7後',
  '8前','8後','9前','9後','10前','10後','11前','11後',
  '12前','12後','1前','1後','2前','2後','3前','3後',
  '4前(26)','4後(26)'
];

export const MONTH_YEARS = [
  '2025','2025','2025','2025','2025','2025','2025','2025',
  '2025','2025','2025','2025','2025','2025','2025','2025',
  '2025','2025','2026','2026','2026','2026','2026','2026',
  '2026','2026'
];

type RawProduct = { name: string; schedule: (ScheduleValue)[] };

const chartRaw: RawProduct[] = [
  { name: 'SWING VIGNETTE Collection2', schedule: [null,'○','○',null,'○','○','○','○','○','○','△',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'ぽけっとBONSAI2　小さな四季の物語', schedule: [null,'○','○',null,'○','○','○','○','○','○','△',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'ポケモン OVALTIQUE COLLECTION', schedule: [null,'○','○',null,'○','○','○','○','○',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'ポケモン　Circular diorama collection', schedule: ['○','○','○',null,'○','○','○','○','○','○','○','○','○','○','○','○','○','○','○','○','○','○','○','○','○','○'] },
  { name: 'ポケットモンスター　SWING VIGNETTE collection 3', schedule: [null,'○','○',null,'○','○','○','○','○','○','○','○','○','○',null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'ポケモン POCKET STATUE -ドラゴンタイプ-', schedule: ['○',null,null,null,'○','○','○','○','○','○','○',null,null,null,null,'?','?','?','?','?','?',null,null,null,null,null] },
  { name: 'ポケモン　和の窓', schedule: ['○','○',null,null,null,'○','○','○','○','○','○','○','○','○',null,null,null,'?','?','?','?','?','?',null,null,null] },
  { name: 'Pokémon VINTAGE COLLECTION Type:Steel', schedule: [null,'○','○',null,'○','○','○',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'ポケットモンスター　Romantic Collection', schedule: ['○','○','○',null,'○','○',null,null,'○','○','○','○','○','○','○','○','○','○',null,null,null,null,null,null,null,null] },
  { name: 'ポケットモンスター STARRIUM SERIES 夢見る月夜の星散歩', schedule: [null,'○',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'Pokémon GEMSTONE COLLECTION 光り輝くしんぴのキセキ', schedule: ['○',null,null,null,null,'○','○','○','○','○','○','○',null,null,null,'?','?','?','?','?','?',null,null,null,null,null] },
  { name: 'ぽけっとBONSAI3-移りゆく季節と共に-', schedule: [null,null,null,null,null,null,null,null,null,'?','?','?','?','?','?','?','?','?','?','?','?',null,null,null,null,null] },
  { name: 'ポケットモンスター テラリウムコレクション15', schedule: ['○',null,null,null,null,'○','○','○','○','○','○',null,null,null,null,'?','?','?','?','?','?',null,null,null,null,null] },
  { name: 'Pokémon　NIGHTY NIGHT collection', schedule: [null,'○','○',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'ポケットモンスター　森の小さなおはなしシリーズ Peaceful Moments!', schedule: [null,'○','○',null,'○','○','○','○','○','○','○','○','○','○',null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'ポケモン Little Night Collection2〜闇夜の小さないたずら〜', schedule: ['○',null,null,null,null,'○','○','○','○','○','○','○','○','○','○','○','○','○',null,null,null,null,null,null,null,null] },
  { name: 'POKÉMON NEON PARTY★', schedule: ['○','○','○',null,null,null,null,null,'○','○','○','○','○','○','○','○','○','○','○','○','○','○','○','○','○',null] },
  { name: 'ポケットモンスター　LANTERN DIORAMA', schedule: ['○',null,null,null,null,null,null,'○','○','○','○','○','○','○','○','○','○',null,null,null,null,null,null,null,null,null] },
  { name: 'ポケモン ふんわりゆらりん飾り', schedule: [null,null,null,null,null,null,null,null,null,'△','△','△','△','△','△','△','△',null,null,null,null,null,null,null,null,null] },
  { name: 'SWING VIGNETTE collection4 ゆらめくポケモンのひととき', schedule: ['○',null,null,null,null,null,null,'○','○','○','○','○','○','○','○','○','○','○','△','△','△',null,null,'?','?','?'] },
  { name: 'ポケットモンスター Diamond Dust', schedule: [null,'○','○',null,'○','○','○','○','○','○','○','○',null,null,null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'ポケットモンスター DesQ Relaxing Home!', schedule: [null,'○','○',null,'○','○','○','○','○','○','○',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'ポケモン Circular diorama collection2 〜きらめきの瞬間〜', schedule: ['○','○','○',null,'○','○','○','○','○','○','○','○','○','○',null,null,null,null,null,null,null,null,null,null,null,null] },
  { name: 'ポケモン DecorativeFrameCollection2 -枠を超えて、広がる世界-', schedule: ['○',null,null,null,'○','○','○','○','○','○','○','○',null,null,null,'?','?','?','?','?','?',null,null,null,null,null] },
  { name: 'ポケモン OVALTIQUE COLLECTION2-Luminous-', schedule: ['○',null,null,'○','○','○','○','○','○','○','○','○',null,null,null,'?','?','?','?','?','?',null,null,null,null,null] },
  { name: 'ポケモン Pop Melody', schedule: [null,null,null,null,null,null,null,null,'○','○','○','○','○','○','○','○','△','△','△','△',null,null,null,null,null,null] },
  { name: 'Pokémon Kaichu Collection', schedule: [null,null,null,null,null,null,null,null,null,'○','○','○','○','○','○','○','○','△','△','△','△',null,null,null,null,null] },
  { name: 'ポケモン Sweet Craft Collection', schedule: [null,null,null,null,null,null,null,null,null,'○','○','○','○','○','○','○','○','△','△','△','△',null,null,null,null,null] },
  { name: 'テラリウムコレクション10 ポケモン30周年記念ver.', schedule: [null,null,null,null,null,null,null,null,null,'○','○','○','○','○','○','○','○','△','△','△','△',null,null,null,null,null] },
  { name: 'ポケモン Romantic Collection 2', schedule: [null,null,null,null,null,null,null,null,null,null,'○','○','○','○','○','○','○','○','△','△','△','△',null,null,null,null] },
  { name: 'Pokémon Journey with you! 1弾', schedule: [null,null,null,null,null,null,null,null,null,null,null,'△','△','△','△','△','△','△','△','△','△','△','△',null,null,null] },
  { name: 'ポケモン  Poké Shower Splash!', schedule: [null,null,null,null,null,null,null,null,null,null,null,'△','△','△','△','△','△','△','△','△','△','△','△',null,null,null] },
  { name: 'ポケモン Windowsill collection', schedule: [null,null,null,null,null,null,null,null,null,null,null,'△','△','△','△','△','△','△','△','△','△','△','△',null,null,null] },
  { name: 'Pokémon Journey with you! 2弾', schedule: [null,null,null,null,null,null,null,null,null,null,null,null,'△','△','△','△','△','△','△','△','△','△','△',null,null,null] },
  { name: 'Pokémon Journey with you! 3弾', schedule: [null,null,null,null,null,null,null,null,null,null,null,null,null,'△','△','△','△','△','△','△','△','△','△',null,null,null] },
  { name: 'イーブイ&フレンズ スフィアスケープコレクション', schedule: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'△','△','△','△','△','△','△','△','△','△'] },
  { name: 'ポケモンRain drop', schedule: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'△','△','△','△','△','△','△','△'] },
  { name: 'エスパータイプ　Wave of ｐｓｙchic', schedule: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'△','△','△','△','△','△','△'] },
  { name: 'SWING VIGNETTE collection 5', schedule: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'△','△','△','△','△','△'] },
  { name: 'ポケットモンスター Aqua Moment Collection', schedule: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'△','△','△','△','△'] },
];

const arrivalData: Record<string, number> = {
  'SWING VIGNETTE Collection2': 0,
  'ぽけっとBONSAI2　小さな四季の物語': 0,
  'ポケモン OVALTIQUE COLLECTION': 0,
  'ポケモン　Circular diorama collection': 850,
  'ポケットモンスター　SWING VIGNETTE collection 3': 0,
  'ポケモン POCKET STATUE -ドラゴンタイプ-': 693,
  'ポケモン　和の窓': 770,
  'Pokémon VINTAGE COLLECTION Type:Steel': 0,
  'ポケットモンスター　Romantic Collection': 939,
  'ポケットモンスター STARRIUM SERIES 夢見る月夜の星散歩': 0,
  'Pokémon GEMSTONE COLLECTION 光り輝くしんぴのキセキ': 843,
  'ぽけっとBONSAI3-移りゆく季節と共に-': 0,
  'ポケットモンスター テラリウムコレクション15': 862,
  'Pokémon　NIGHTY NIGHT collection': 0,
  'ポケットモンスター　森の小さなおはなしシリーズ Peaceful Moments!': 0,
  'ポケモン Little Night Collection2〜闇夜の小さないたずら〜': 1091,
  'POKÉMON NEON PARTY★': 1231,
  'ポケットモンスター　LANTERN DIORAMA': 1180,
  'ポケモン ふんわりゆらりん飾り': 0,
  'SWING VIGNETTE collection4 ゆらめくポケモンのひととき': 2349,
  'ポケットモンスター Diamond Dust': 0,
  'ポケットモンスター DesQ Relaxing Home!': 0,
  'ポケモン Circular diorama collection2 〜きらめきの瞬間〜': 800,
  'ポケモン DecorativeFrameCollection2 -枠を超えて、広がる世界-': 2754,
  'ポケモン OVALTIQUE COLLECTION2-Luminous-': 2719,
  'ポケモン Pop Melody': 0,
  'Pokémon Kaichu Collection': 0,
  'ポケモン Sweet Craft Collection': 0,
  'テラリウムコレクション10 ポケモン30周年記念ver.': 0,
  'ポケモン Romantic Collection 2': 0,
  'Pokémon Journey with you! 1弾': 0,
  'ポケモン  Poké Shower Splash!': 0,
  'ポケモン Windowsill collection': 0,
  'Pokémon Journey with you! 2弾': 0,
  'Pokémon Journey with you! 3弾': 0,
  'イーブイ&フレンズ スフィアスケープコレクション': 0,
  'ポケモンRain drop': 0,
  'エスパータイプ　Wave of ｐｓｙchic': 0,
  'SWING VIGNETTE collection 5': 0,
  'ポケットモンスター Aqua Moment Collection': 0,
};

function computeStatus(schedule: ScheduleValue[]): ProductStatus {
  const hasStock = schedule.some(v => v === '○');
  const hasIncoming = schedule.some(v => v === '?');
  const hasMaybe = schedule.some(v => v === '△') && !hasStock;
  if (hasStock) return 'has';
  if (hasIncoming || hasMaybe) return 'incoming';
  return 'none';
}

export const initialProducts: Product[] = chartRaw.map((r, i) => {
  const schedule = r.schedule.slice(0, 26) as ScheduleValue[];
  return {
    id: i,
    name: r.name,
    schedule,
    arrival: arrivalData[r.name] ?? 0,
    status: computeStatus(schedule),
  };
});
