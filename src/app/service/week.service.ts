import { Injectable } from '@angular/core';
import { add, differenceInDays, differenceInHours, differenceInWeeks, parseISO, subHours } from 'date-fns';
import { BungieService } from './bungie.service';
import { DestinyCacheService } from './destiny-cache.service';
import { ItemDisplay, LegendLostSectorActivity, LostSector, LostSectorInfo, NameDesc, PublicMilestonesAndActivities } from './model';
import { ParseService } from './parse.service';

@Injectable({
  providedIn: 'root'
})
export class WeekService {


  // https://docs.google.com/spreadsheets/d/1f_t8xy_uTT1hYZgGLDpfvW7NEhAuVb6rRV8ooScVh6Y/edit#gid=0

  readonly VOG_CHALLENGES: { [key: string]: RaidChallengeData } = {
    3178242090: {
      hash: 3178242090,
      topic: 'Confluxes',
      desc: 'Don\'t  defeat the Wyverns until they begin sacrificing.',
      video: 'https://www.youtube.com/watch?v=WZR0a2WsjoU&t=79s'
    },
    711293738: {
      hash: 711293738,
      topic: 'Oracles',
      desc: 'Each Guardian can destroy the same Oracle only once.',
      video: 'https://www.youtube.com/watch?v=WZR0a2WsjoU&t=210s'
    },
    435557544: {
      hash: 435557544,
      topic: 'Templar',
      desc: 'Don\'t let the Templar teleport during DPS',
      video: 'https://www.youtube.com/watch?v=WZR0a2WsjoU&t=379s'
    },
    4189771983: {
      hash: 4189771983,
      topic: 'Gatekeepers',
      desc: 'Kill Wyvern and Minotaur simultaneously',
      video: 'https://www.youtube.com/watch?v=WZR0a2WsjoU&t=434s'
    },
    678808956: {
      hash: 678808956,
      topic: 'Atheon',
      desc: '1 Oracle per person during teleport',
      video: 'https://www.youtube.com/watch?v=WZR0a2WsjoU&t=585s'
    }
  };

  readonly LS_MASTER_ROTATION: LostSectorInfo[] = [
    {
      abbrev: 'Perdition',
      hash: '1070981425',
      shields: ['Arc Harpies', 'Void Minotaurs'],
      champions: [
        {
          name: 'Barrier Hobgoblin',
          count: 2
        },
        {
          name: 'Overload Minotaur',
          count: 3
        },
      ]
    },
    // {
    //   abbrev: 'The Quarry',
    //   hash: '3253890600',
    //   shields: [],
    //   champions: [
    //     {
    //       name: '',
    //       count: 1
    //     }
    //   ]
    // },
    // {
    //   abbrev: 'Scavenger\'s Den',
    //   hash: '1905792146',
    //   shields: [],
    //   champions: [
    //     {
    //       name: '',
    //       count: 1
    //     }
    //   ]
    // },
    // {
    //   abbrev: 'Excavation Site',
    //   hash: '548616653',
    //   shields: [],
    //   champions: [
    //     {
    //       name: '',
    //       count: 1
    //     }
    //   ]
    // },
    // {
    //   abbrev: 'Exodus Garden',
    //   hash: '2936791995',
    //   shields: ['Void Servitors'],
    //   champions: [
    //     {
    //       name: 'Barrier Servitor',
    //       count: 3
    //     },
    //     {
    //       name: 'Overload Captain',
    //       count: 1
    //     }
    //   ]
    // },
    // {
    //   abbrev: 'Veles Labyrinth',
    //   hash: '3094493727',
    //   shields: ['Solar Wizards'],
    //   champions: [
    //     {
    //       name: 'Barrier Knight',
    //       count: 2
    //     },
    //     {
    //       name: 'Unstoppable Ogre',
    //       count: 4
    //     }
    //   ]
    // },
    {
      abbrev: 'Bay of Drowned Wishes',
      hash: '660710120',
      shields: ['Void(1)'],
      champions: [
        {
          name: 'Unstoppable Abomination',
          count: 3
        },
        {
          name: 'Overload Chieftain',
          count: 3
        }
      ]
    },
    {
      abbrev: 'Chamber of Starlight',
      hash: '4206916276',
      shields: ['Void(23)', 'Solar(2)'],
      champions: [
        {
          name: 'Unstoppable',
          count: 6
        },
        {
          name: 'Overload',
          count: 3
        }
      ]
    },
    {
      abbrev: 'Aphelion\'s Rest',
      hash: '1898610131',
      shields: ['Void(9)'],
      champions: [
        {
          name: 'Unstoppable',
          count: 3
        },
        {
          name: 'Overload',
          count: 4
        }
      ]
    },
    {
      abbrev: 'The Empty Tank',
      hash: '2019961993',
      shields: ['Arc(2)'],
      champions: [
        {
          name: 'Barrier',
          count: 5
        },
        {
          name: 'Overload',
          count: 3
        }
      ]
    },
    {
      abbrev: 'K1 Log',
      hash: '567131519',
      shields: ['Arc Captain', 'Solar Shank'],
      champions: [
        {
          name: 'Barrier Servitor',
          count: 4
        },
        {
          name: 'Overload Captain',
          count: 6
        },
      ]
    },
    {
      abbrev: 'K1 communion',
      hash: '2829206720',
      shields: ['Solar Shanks'],
      champions: [
        {
          name: 'Barrier Servitor',
          count: 5
        },
        {
          name: 'Overload Captain',
          count: 6
        },
      ]
    },
    {
      abbrev: 'K1 Crew',
      hash: '184186578',
      shields: ['Solar Shanks'],
      champions: [
        {
          name: 'Barrier Servitor',
          count: 4
        },
        {
          name: 'Overload Captain',
          count: 6
        },
      ]
    },
    {
      abbrev: 'K1 Revelation',
      hash: '3911969238',
      shields: ['Arc Knight'],
      champions: [
        {
          name: 'Barrier Knight',
          count: 7
        },
        {
          name: 'Unstoppable Ogre',
          count: 3
        },
      ]
    },
    {
      abbrev: 'Concealed Void',
      hash: '912873274',
      shields: ['Solar Shank', 'Void Servitor'],
      champions: [
        {
          name: 'Barrier Servitor',
          count: 3
        },
        {
          name: 'Overload Captain',
          count: 5
        }]
    },
    {
      abbrev: 'Bunker',
      hash: '1648125538',
      shields: ['Void Minotaurs'],
      champions: [
        {
          name: 'Barrier Hobgoblin',
          count: 2
        },
        {
          name: 'Overload Captain',
          count: 3
        },
        {
          name: 'Overload Minotaur',
          count: 3
        }
      ]
    },
  ];

  readonly LS_LEGEND_ROTATION: LostSectorInfo[] = [
    {
      abbrev: 'Bay of Drowned Wishes',
      hash: '660710127',
      shields: ['Void(1)'],
      champions: [
        {
          name: 'Unstoppable Abomination',
          count: 3
        },
        {
          name: 'Overload Chieftain',
          count: 2
        }
      ]
    },
    {
      abbrev: 'Chamber of Starlight',
      hash: '4206916275',
      shields: ['Void(17)', 'Solar(2)'],
      champions: [
        {
          name: 'Unstoppable',
          count: 3
        },
        {
          name: 'Overload',
          count: 1
        }
      ]
    },
    {
      abbrev: 'Aphelion\'s Rest',
      hash: '1898610132',
      shields: ['Void(9)'],
      champions: [
        {
          name: 'Unstoppable',
          count: 2
        },
        {
          name: 'Overload',
          count: 2
        }
      ]
    },
    {
      abbrev: 'The Empty Tank',
      hash: '2019961998',
      shields: ['Arc(1)'],
      champions: [
        {
          name: 'Barrier',
          count: 2
        },
        {
          name: 'Overload',
          count: 2
        }
      ]
    },

    {
      abbrev: 'K1 Log',
      hash: '567131512',
      shields: ['Arc Captain(3)', 'Solar Shanks(8)'],
      champions: [
        {
          name: 'Barrier Servitor',
          count: 3
        },
        {
          name: 'Overload Captain',
          count: 2
        },
      ]
    },
    {
      abbrev: 'K1 Communion',
      hash: '2829206727',
      shields: ['Void Servitors', 'Solar Shanks'],
      champions: [
        {
          name: 'Barrier Servitor',
          count: 3
        },
        {
          name: 'Overload Captain',
          count: 2
        },
      ]
    },
    {
      abbrev: 'K1 Crew',
      hash: '184186581',
      shields: ['Solar Shanks'],
      champions: [
        {
          name: 'Barrier Servitor',
          count: 3
        },
        {
          name: 'Overload Captain',
          count: 2
        },
      ]
    },
    {
      abbrev: 'K1 Revelation',
      hash: '3911969233',
      shields: ['Arc Knights'],
      champions: [
        {
          name: 'Barrier Knight',
          count: 3
        },
        {
          name: 'Unstoppable Ogre',
          count: 3
        },
      ]
    },
    {
      abbrev: 'Concealed Void',
      hash: '912873277',
      shields: ['Arc Captain', 'Solar Shank', 'Void Servitor'],
      champions: [
        {
          name: 'Barrier Servitor',
          count: 2
        },
        {
          name: 'Overload Captain',
          count: 3
        },
      ]
    },
    {
      abbrev: 'Bunker',
      hash: '1648125541',
      shields: ['Void Minotaur'],
      champions: [
        {
          name: 'Barrier Hobgoblin',
          count: 1
        },
        {
          name: 'Overload Captain',
          count: 1
        },
        {
          name: 'Overload Minotaur',
          count: 3
        },
      ]
    },
    {
      abbrev: 'Perdition',
      hash: '1070981430',
      shields: ['Arc Harpies', 'Void Minotaurs'],
      champions: [
        {
          name: 'Barrier Hobgoblin',
          count: 1
        },
        {
          name: 'Overload Minotaur',
          count: 2
        }
      ]
    },

    // {
    //   abbrev: 'The Quarry',
    //   hash: '3253890607',
    //   shields: [],
    //   champions: [
    //     {
    //       name: '',
    //       count: 1
    //     }
    //   ]
    // },
    // {
    //   abbrev: 'Scavenger\'s Den',
    //   hash: '1905792149',
    //   shields: [],
    //   champions: [
    //     {
    //       name: '',
    //       count: 1
    //     }
    //   ]
    // },
    // {
    //   abbrev: 'Excavation Site',
    //   hash: '548616650',
    //   shields: [],
    //   champions: [
    //     {
    //       name: '',
    //       count: 1
    //     }
    //   ]
    // },
    // {
    //   abbrev: 'Exodus Garden',
    //   hash: '2936791996',
    //   shields: ['Void Servitors'],
    //   champions: [
    //     {
    //       name: 'Barrier Servitor',
    //       count: 2
    //     },
    //     {
    //       name: 'Overload Captain',
    //       count: 2
    //     },
    //   ]
    // },
    // {
    //   abbrev: 'Veles Labyrinth',
    //   hash: '3094493720',
    //   shields: ['Arc Knights', 'Solar Wizards'],
    //   champions: [
    //     {
    //       name: 'Barrier Knight',
    //       count: 3
    //     },
    //     {
    //       name: 'Unstoppable Ogre',
    //       count: 1
    //     }
    //   ]
    // },
  ];

  readonly LS_LEGEND_LOOT = [
    'Chest',
    'Head',
    'Legs',
    'Arms',
  ];



  readonly LS_MASTER_LOOT = [
    'Arms',
    'Chest',
    'Head',
    'Legs',
  ];

  readonly ASCENDENT_INFO: DreamingCityRow[] = [
    {
      curseStrength: 'Strong',
      challenge: 'Ouroborea',
      location: 'Aphelion\'s Rest',
      video: 'https://www.youtube.com/watch?v=xL2S7rjD-HQ'
    },
    {
      curseStrength: 'Weak',
      challenge: 'Forfeit Shrine',
      location: 'Gardens of Esila',
      video: 'https://www.youtube.com/watch?v=OBgPmi6c0T8'
    },
    {
      curseStrength: 'Medium',
      challenge: 'Shattered Ruins',
      location: 'Spine of Keres',
      video: 'https://www.youtube.com/watch?v=8e8fvtkh8kc'
    },
    {
      curseStrength: 'Strong',
      challenge: 'Keep of Honed Edges',
      location: 'Harbinger\'s Seclude',
      video: 'https://www.youtube.com/watch?v=U32rv7T9-ZI'
    },
    {
      curseStrength: 'Weak',
      challenge: 'Agonarch Abyss',
      location: 'Bay of Drowned Wishes',
      video: 'https://www.youtube.com/watch?v=hUz8fIKEPy8'
    },
    {
      curseStrength: 'Medium',
      challenge: 'Cimmerian Garrison',
      location: 'Chamber of Starlight',
      video: 'https://www.youtube.com/watch?v=8XmfC-H-9rs'
    }
  ];

  constructor(private bungieService: BungieService,
    private destinyCacheService: DestinyCacheService,
    private parseService: ParseService) {
  }

  private static getRotation(cntr: number, list: any[]): any {
    const index = cntr % list.length;
    return list[index];
  }

  // the week of the chosen season, so far
  public static getSeasonWeek(): number {
    const seasonEpoch = parseISO('2021-08-24T17:00:00Z'); // #UPDATEME
    const numWeeks = differenceInWeeks(new Date(), seasonEpoch);
    return numWeeks + 1;
  }

  private getCurrWeek(publicMilestones: PublicMilestonesAndActivities): Week {
    let currWeek: Week;
    if (publicMilestones && publicMilestones.weekStart) {
      const weekEpoch = parseISO('2021-11-23T17:00:00.000Z'); // 4/2/2019
      const thisWeek = publicMilestones.weekStart;
      const numWeeks = differenceInWeeks(thisWeek, weekEpoch);
      const ascInfo = WeekService.getRotation(numWeeks, this.ASCENDENT_INFO) as DreamingCityRow;

      currWeek = {
        ascendantChallenge: ascInfo.challenge,
        ascendantVideo: ascInfo.video,
        location: ascInfo.location,
        curseStrength: ascInfo.curseStrength
      };


    }
    return currWeek;
  }

  private async buildLostSectorActivity(info: LostSectorInfo, ll: number): Promise<LegendLostSectorActivity> {
    const desc: any = await this.destinyCacheService.getActivity(info.hash);
    if (!desc || !desc.displayProperties || !desc.displayProperties.name) {
      return null;
    }
    const modifiers: NameDesc[] = [];
    for (const mod of desc.modifiers) {
      const pushMe: NameDesc = await this.parseService.parseModifier(mod.activityModifierHash);
      modifiers.push(pushMe);
    }
    let name = desc.displayProperties.name;
    if (name.endsWith(': Legend')) {
      name = name.substring(0, name.length - ': Legend'.length);
    }
    if (name.endsWith(': Master')) {
      name = name.substring(0, name.length - ': Master'.length);
    }
    return {
      hash: info.hash,
      name: name,
      desc: '',
      ll,
      tier: 0,
      icon: desc.displayProperties.icon,
      modifiers: modifiers,
      info: info
    };
  }

  public async getLostSectors(delta?: number): Promise<LostSectors> {
    let referenceDate = new Date();
    if (delta) {
      referenceDate = add(referenceDate, { days: delta });
    }
    const magicHour = 17;


    // let's pretend this is in UTC, so right now it's 1AM Tuesday UTC
    // in game that means it's "Monday" b/c it's < 5PM on that day
    if (referenceDate.getUTCHours() < magicHour) {
      // console.log(`Prior to reset ${referenceDate.getHours()}`);
      referenceDate = subHours(referenceDate, 24);
    }
    // set our reference time to 5PM UTC arbitrarily so we're consistent
    referenceDate.setUTCHours(magicHour);
    const lsEpoch = parseISO('2021-08-24T17:00:00.000Z'); // 2021-08-24 is our current reference date
    // diff in hours ignores DST
    const lsDays = Math.floor(differenceInHours(referenceDate, lsEpoch) / 24);
    const lsIndex = lsDays % this.LS_LEGEND_ROTATION.length;
    const lsLootIndex = lsDays % this.LS_LEGEND_LOOT.length;
    const legendLoot = this.LS_LEGEND_LOOT[lsLootIndex];
    const masterLoot = this.LS_MASTER_LOOT[lsLootIndex];
    // TODO update this when PL's change
    const legendActivity = await this.buildLostSectorActivity(this.LS_LEGEND_ROTATION[lsIndex], 1320);
    const masterActivity = await this.buildLostSectorActivity(this.LS_MASTER_ROTATION[lsIndex], 1350);

    const recordDescForIcon: any = await this.destinyCacheService.getRecord(3838089785);
    return {
      day: referenceDate.toISOString(),
      legendaryLostSector: {
        icon: recordDescForIcon.displayProperties.icon,
        activity: legendActivity,
        soloReward: legendLoot,
        special: legendLoot == 'Head' || legendLoot == 'Arms' || legendLoot == 'Chest'
      },
      masterLostSector: {
        icon: recordDescForIcon.displayProperties.icon,
        activity: masterActivity,
        soloReward: masterLoot,
        special: masterLoot == 'Head' || masterLoot == 'Arms' || masterLoot == 'Chest'
      }
    };
  }

  private getRaidChallenge(publicMilestones: PublicMilestonesAndActivities): RaidChallenge | null {
    if (publicMilestones?.publicMilestones) {
      const vogMs = publicMilestones.publicMilestones.find(x => x.hash == '2279677721');
      if (vogMs?.activities) {
        for (const a of vogMs.activities) {
          if (a.modifiers) {
            for (const mod of a.modifiers) {
              const challenge  = this.VOG_CHALLENGES[mod.hash];
              if (challenge) {
                return {
                  ...challenge,
                  name: mod.name
                };
              }
            }
          }
        }
      }
    }
    return null;
  }

  public async getToday(): Promise<Today> {

    const altarEpoch = parseISO('2019-11-09T17:00:00.000Z'); // nov 9 2019
    const today = new Date();
    const altarDays = differenceInDays(today, altarEpoch);
    const alterIndex = altarDays % 3;

    let altarWeaponKey = null;
    if (alterIndex == 0) {
      altarWeaponKey = '3067821200'; // heretic
    } else if (alterIndex == 1) {
      altarWeaponKey = '2782847179'; // blasphemer
    } else if (alterIndex == 2) {
      altarWeaponKey = '2164448701'; // apostate
    }
    const publicMilestones = await this.bungieService.getPublicMilestones();
    const currWeek = await this.getCurrWeek(publicMilestones);
    const lostSectors = await this.getLostSectors();
    const raidChallenge = this.getRaidChallenge(publicMilestones);
    return {
      week: currWeek,
      raidChallenge,
      publicMilestones: publicMilestones,
      altarOfSorrowsWeapon: await this.destinyCacheService.getInventoryItem(altarWeaponKey),
      lostSectors: lostSectors
    };
  }
}

export interface Today {
  week: Week;
  raidChallenge: RaidChallenge;
  publicMilestones: PublicMilestonesAndActivities;
  altarOfSorrowsWeapon: ItemDisplay;
  lostSectors: LostSectors;
}

export interface LostSectors {
  day: string;
  legendaryLostSector: LostSector;
  masterLostSector: LostSector;
}


interface WeekData {
  weeks: Week[];
  videos: any;
  epvideos: any;
}

interface Week {
  ascendantChallenge: string;
  ascendantVideo?: string;
  location: string;
  curseStrength: string;
}

interface DreamingCityRow {
  curseStrength: string;
  challenge: string;
  video: string;
  location: string;
}

interface RaidChallengeData {
  hash: number;
  topic: string;
  desc: string;
  video?: string;
}


interface RaidChallenge {
  hash: number;
  name: string;
  topic: string;
  desc: string;
  video?: string;
}
