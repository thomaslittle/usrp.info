import { NextResponse } from 'next/server';
import { adminDatabases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

// EMS Department Users Data
const emsUsers = [
  // Command Staff
  {
    username: 'vyenna.gray',
    email: 'vyenna.gray@ems.usrp.info',
    gameCharacterName: 'Vyenna "Yen" Gray',
    rank: 'Chief of Staff',
    jobTitle: 'Chief of Staff',
    callsign: 'M-1',
    assignment: 'Command',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: true,
    isSoloCleared: true,
    role: 'admin'
  },
  {
    username: 'emma.gardener',
    email: 'emma.gardener@ems.usrp.info',
    gameCharacterName: 'Emma Gardener',
    rank: 'Head of Doctors',
    jobTitle: 'Head of Doctors',
    callsign: 'M-2',
    assignment: 'Command',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: true,
    isSoloCleared: true,
    role: 'admin'
  },
  {
    username: 'head.paramedics',
    email: 'head.paramedics@ems.usrp.info',
    gameCharacterName: 'Head of Paramedics',
    rank: 'Head of Paramedics',
    jobTitle: 'Head of Paramedics',
    callsign: 'E-3',
    assignment: 'Command',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: true,
    isSoloCleared: true,
    role: 'admin'
  },

  // Supervisors
  {
    username: 'cilantro.coriander',
    email: 'cilantro.coriander@ems.usrp.info',
    gameCharacterName: 'Cilantro Coriander',
    rank: 'Captain (EMT)',
    jobTitle: 'Captain (EMT)',
    callsign: 'E-6',
    assignment: 'Medic Supervisor / FTO',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: true,
    role: 'editor'
  },
  {
    username: 'lorraine.laroso',
    email: 'lorraine.laroso@ems.usrp.info',
    gameCharacterName: 'Lorraine Laroso',
    rank: 'Captain (EMT)',
    jobTitle: 'Captain (EMT)',
    callsign: 'E-7',
    assignment: 'Medic Supervisor / FTO',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: true,
    role: 'editor'
  },
  {
    username: 'eugene.knight',
    email: 'eugene.knight@ems.usrp.info',
    gameCharacterName: 'Eugene Knight',
    rank: 'Lieutenant (Doctor)',
    jobTitle: 'Lieutenant (Doctor)',
    callsign: 'M-8',
    assignment: 'Medic Supervisor / FTO',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'editor'
  },
  {
    username: 'dale.dantoni',
    email: 'dale.dantoni@ems.usrp.info',
    gameCharacterName: 'Dale Dantoni',
    rank: 'Lieutenant (EMT)',
    jobTitle: 'Lieutenant (EMT)',
    callsign: 'E-10',
    assignment: 'Medic Supervisor / FTO',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: true,
    role: 'editor'
  },
  {
    username: 'shane.remington',
    email: 'shane.remington@ems.usrp.info',
    gameCharacterName: 'Shane Remington',
    rank: 'Lieutenant (EMT)',
    jobTitle: 'Lieutenant (EMT)',
    callsign: 'E-11',
    assignment: 'Medic Supervisor / FTO',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'editor'
  },

  // Paramedics
  {
    username: 'steven.carti',
    email: 'steven.carti@ems.usrp.info',
    gameCharacterName: 'Steven Carti',
    rank: 'Paramedic',
    jobTitle: 'Paramedic',
    callsign: 'E-23',
    assignment: 'Medic/Asst. Surgeon',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: true,
    role: 'viewer'
  },

  // EMTs
  {
    username: 'ranger.luther',
    email: 'ranger.luther@ems.usrp.info',
    gameCharacterName: 'Ranger Luther',
    rank: 'Sr. EMT',
    jobTitle: 'Sr. EMT',
    callsign: 'E-33',
    assignment: 'Trained Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: true,
    role: 'viewer'
  },
  {
    username: 'carly.may',
    email: 'carly.may@ems.usrp.info',
    gameCharacterName: 'Carly May',
    rank: 'Sr. EMT',
    jobTitle: 'Sr. EMT',
    callsign: 'E-34',
    assignment: 'Trained Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: true,
    role: 'viewer'
  },
  {
    username: 'elbert.doyle',
    email: 'elbert.doyle@ems.usrp.info',
    gameCharacterName: 'Elbert Doyle',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-35',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'kyle.ironheart',
    email: 'kyle.ironheart@ems.usrp.info',
    gameCharacterName: 'Kyle Ironheart',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-36',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'taffy.tootles',
    email: 'taffy.tootles@ems.usrp.info',
    gameCharacterName: 'Taffy Tootles',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-38',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'lenny.squabble',
    email: 'lenny.squabble@ems.usrp.info',
    gameCharacterName: 'Lenny Squabble',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-39',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'dan.steely',
    email: 'dan.steely@ems.usrp.info',
    gameCharacterName: 'Dan Steely',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-40',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'bruce.deego',
    email: 'bruce.deego@ems.usrp.info',
    gameCharacterName: 'Bruce Deego',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-41',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'drew.beers',
    email: 'drew.beers@ems.usrp.info',
    gameCharacterName: 'Drew Beers',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-42',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'ryan.james',
    email: 'ryan.james@ems.usrp.info',
    gameCharacterName: 'Ryan James',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-43',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'paddy.escobar',
    email: 'paddy.escobar@ems.usrp.info',
    gameCharacterName: 'Paddy Escobar',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-44',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'quinn.val',
    email: 'quinn.val@ems.usrp.info',
    gameCharacterName: 'Quinn Val',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-45',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'derrick.levon',
    email: 'derrick.levon@ems.usrp.info',
    gameCharacterName: 'Derrick Levon',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-46',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'fox.spencer',
    email: 'fox.spencer@ems.usrp.info',
    gameCharacterName: 'Fox Spencer',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-47',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'jack.napier',
    email: 'jack.napier@ems.usrp.info',
    gameCharacterName: 'Jack Napier',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-48',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'finn.burke',
    email: 'finn.burke@ems.usrp.info',
    gameCharacterName: 'Finn Burke',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-49',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'jenny.esman',
    email: 'jenny.esman@ems.usrp.info',
    gameCharacterName: 'Jenny Esman',
    rank: 'EMT',
    jobTitle: 'EMT',
    callsign: 'E-50',
    assignment: 'Entry Level Medic',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },

  // Interns
  {
    username: 'minnie.greene',
    email: 'minnie.greene@ems.usrp.info',
    gameCharacterName: 'Minnie Greene',
    rank: 'Intern',
    jobTitle: 'Intern',
    callsign: 'M-70',
    assignment: 'Doctor in Training',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'tom.avalon',
    email: 'tom.avalon@ems.usrp.info',
    gameCharacterName: 'Tom Avalon',
    rank: 'Intern',
    jobTitle: 'Intern',
    callsign: 'M-71',
    assignment: 'Doctor in Training',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'jay.fordetta',
    email: 'jay.fordetta@ems.usrp.info',
    gameCharacterName: 'Jay J Fordetta',
    rank: 'Intern',
    jobTitle: 'Intern',
    callsign: 'M-72',
    assignment: 'Doctor in Training',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },
  {
    username: 'mike.hunt',
    email: 'mike.hunt@ems.usrp.info',
    gameCharacterName: 'Mike Hunt',
    rank: 'Intern',
    jobTitle: 'Intern',
    callsign: 'M-73',
    assignment: 'Doctor in Training',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },

  // Residents
  {
    username: 'lexa.gray',
    email: 'lexa.gray@ems.usrp.info',
    gameCharacterName: 'Lexa Gray',
    rank: 'Doctor',
    jobTitle: 'Doctor',
    callsign: 'M-51',
    assignment: 'Hospital Staff',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: true,
    role: 'viewer'
  },
  {
    username: 'olivia.ordeigh',
    email: 'olivia.ordeigh@ems.usrp.info',
    gameCharacterName: 'Olivia Ordeigh',
    rank: 'Doctor',
    jobTitle: 'Doctor',
    callsign: 'M-52',
    assignment: 'Hospital Staff',
    activity: 'Active',
    status: 'Full-Time',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  },

  // Specialists
  {
    username: 'feng.love',
    email: 'feng.love@ems.usrp.info',
    gameCharacterName: 'Feng-Love',
    rank: 'Specialist',
    jobTitle: 'Specialist',
    callsign: 'M-21',
    assignment: 'Specialized Hospital Staff',
    activity: 'Moderate',
    status: 'Full-Time',
    timezone: 'NA',
    isFTO: false,
    isSoloCleared: false,
    role: 'viewer'
  }
];

export async function POST() {
  try {
    const results = {
      users: [] as unknown[],
      errors: [] as string[]
    };

    // Create EMS users
    for (const userData of emsUsers) {
      try {
        const user = await adminDatabases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          ID.unique(),
          {
            userId: ID.unique(),
            department: 'ems',
            phoneNumber: '',
            timezone: userData.timezone || '',
            discordUsername: '',
            createdAt: new Date().toISOString(),
            ...userData
          }
        );
        results.users.push(user);
      } catch (error) {
        console.error(`Error creating user ${userData.username}:`, error);
        results.errors.push(`Failed to create user ${userData.username}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.users.length} EMS users`,
      results,
      errors: results.errors
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Simple check to see if database has users
    const users = await adminDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      []
    );
    const isSeeded = users.documents.length > 0;
    return NextResponse.json({ isSeeded });
  } catch (error) {
    console.error('Seed check API error:', error);
    return NextResponse.json(
      { error: 'Failed to check seed status' },
      { status: 500 }
    );
  }
} 