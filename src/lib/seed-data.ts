import { departmentService, contentService } from './database';
// import { databases, DATABASE_ID, COLLECTIONS } from './appwrite-server';

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create EMS Department
    const emsDepartment = await departmentService.create({
      departmentId: 'ems',
      name: 'Emergency Medical Services',
      slug: 'ems',
      color: '#753ace',
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    console.log('Created EMS department:', emsDepartment.$id);

    // Create initial EMS content
    const emsContent = [
      {
        contentId: 'ems-overview',
        departmentId: emsDepartment.$id,
        title: 'EMS Overview',
        slug: 'overview',
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'San Andreas Emergency Medical Services' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Welcome to the San Andreas Emergency Medical Services. This handbook contains all official Standard Operating Procedures, guidelines, and protocols for EMS personnel.' }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Core Values' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Life Priority: EMS → LSPD → Civilians' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Professional conduct at all times' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Respect for hierarchy and protocol' }]
                    }
                  ]
                }
              ]
            }
          ]
        }),
        type: 'sop' as const,
        status: 'published' as const,
        authorId: 'system',
        tags: ['overview', 'core-values'],
        version: 1,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        contentId: 'ems-hierarchy',
        departmentId: emsDepartment.$id,
        title: 'EMS Hierarchy & Structure',
        slug: 'hierarchy',
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'EMS Structure & Authoritative Power' }]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'EMS Hierarchy' }]
            },
            {
              type: 'orderedList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Directors' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Chiefs' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Head of Department (HOD)' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Captains / Mental Health Director (MHD)' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Lieutenant / Attending' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Paramedic / Fellows' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Lead EMT / Residents' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'EMT / Intern' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Trainee / Scrub' }]
                    }
                  ]
                }
              ]
            }
          ]
        }),
        type: 'sop' as const,
        status: 'published' as const,
        authorId: 'system',
        tags: ['hierarchy', 'structure', 'ranks'],
        version: 1,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        contentId: 'ems-protocols',
        departmentId: emsDepartment.$id,
        title: 'Medical Protocols',
        slug: 'medical-protocols',
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Medical Protocols' }]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'DOA Protocol' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Four essential steps for resuscitation:' }
              ]
            },
            {
              type: 'orderedList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'CPR' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Defibrillation/AED (using EMS taser aimed at ground)' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Oxygen mask' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Adrenaline/Epinephrine' }]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Patient Assessment Guidelines' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Can revive:', marks: [{ type: 'bold' }] }
              ]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Simple cuts/bruises treatable with OTC medication' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Fist fights/dehydration/starvation' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Off-duty medics if no EMS response in 5 minutes' }]
                    }
                  ]
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Cannot revive:', marks: [{ type: 'bold' }] }
              ]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Moderate-to-major trauma' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Injuries beyond cuts/bruises' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Anything requiring more than band-aids/paracetamol' }]
                    }
                  ]
                }
              ]
            }
          ]
        }),
        type: 'guide' as const,
        status: 'published' as const,
        authorId: 'system',
        tags: ['protocols', 'doa', 'medical', 'assessment'],
        version: 1,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        contentId: 'ems-10-codes',
        departmentId: emsDepartment.$id,
        title: '10-Codes Reference',
        slug: '10-codes',
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '10-Codes Reference' }]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Radio Communication Formula' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Call sign → 10-code → Description' }
              ]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Example: "(Dispatch) 100, 10-76, latest 911 in Vinewood Hills"' }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Common 10-Codes' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: '10-3: ', marks: [{ type: 'bold' }] },
                        { type: 'text', text: 'Stop transmitting / Tac-comms' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: '10-4: ', marks: [{ type: 'bold' }] },
                        { type: 'text', text: 'Acknowledged' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: '10-76: ', marks: [{ type: 'bold' }] },
                        { type: 'text', text: 'En route' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: '10-99: ', marks: [{ type: 'bold' }] },
                        { type: 'text', text: 'Emergency / Priority traffic' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }),
        type: 'resource' as const,
        status: 'published' as const,
        authorId: 'system',
        tags: ['10-codes', 'radio', 'communication'],
        version: 1,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        contentId: 'ems-disciplinary-policy',
        departmentId: emsDepartment.$id,
        title: 'EMS Disciplinary Policy & Violations',
        slug: 'disciplinary-policy',
        content: JSON.stringify({
          type: 'markdown',
          content: `
            <div class="space-y-8">
              <div class="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-xl p-6">
                <h1 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span class="text-red-400">⚠️</span>
                  EMS Disciplinary Policy & Violations
                </h1>
                <p class="text-gray-300 text-lg">
                  This policy outlines the disciplinary framework for EMS personnel, including violation levels, consequences, and procedures.
                </p>
              </div>

              <div class="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div class="bg-gradient-to-r from-purple-600 to-violet-600 p-4">
                  <h2 class="text-xl font-bold text-white">Disciplinary Violation Levels</h2>
                </div>
                
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="bg-gray-800">
                        <th class="px-6 py-4 text-left text-sm font-semibold text-white border-b border-gray-800">Level</th>
                        <th class="px-6 py-4 text-left text-sm font-semibold text-white border-b border-gray-800">Problem</th>
                        <th class="px-6 py-4 text-left text-sm font-semibold text-white border-b border-gray-800">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- LEVEL 3 - Critical Violations -->
                      <tr class="bg-red-900/20 border-b border-red-800/50">
                        <td colspan="3" class="px-6 py-3">
                          <div class="flex items-center gap-2">
                            <span class="text-red-400 text-lg font-bold">🚨</span>
                            <h3 class="text-lg font-bold text-red-300">LEVEL 3 - CRITICAL VIOLATIONS</h3>
                          </div>
                        </td>
                      </tr>
                      <tr class="bg-red-900/10 hover:bg-red-900/20 transition-colors">
                        <td class="px-6 py-4 text-red-300 font-semibold border-b border-gray-800">LEVEL 3</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Felony Charges</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Any charges that are a felony charge</td>
                      </tr>
                      <tr class="bg-red-900/10 hover:bg-red-900/20 transition-colors">
                        <td class="px-6 py-4 text-red-300 font-semibold border-b border-gray-800">LEVEL 3</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Corruption</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Selling prescription drugs, giving out police info/location, treating without reporting</td>
                      </tr>
                      <tr class="bg-red-900/10 hover:bg-red-900/20 transition-colors">
                        <td class="px-6 py-4 text-red-300 font-semibold border-b border-gray-800">LEVEL 3</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Derogatory Comments</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Racism, Sexism, inappropriate comments about anyone. (Also report to admins)</td>
                      </tr>
                      <tr class="bg-red-900/10 hover:bg-red-900/20 transition-colors">
                        <td class="px-6 py-4 text-red-300 font-semibold border-b border-gray-800">LEVEL 3</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Tampering with Documents</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Altering or rewriting a document without command permission</td>
                      </tr>

                      <!-- LEVEL 2 - Serious Violations -->
                      <tr class="bg-orange-900/20 border-b border-orange-800/50">
                        <td colspan="3" class="px-6 py-3">
                          <div class="flex items-center gap-2">
                            <span class="text-orange-400 text-lg font-bold">⚡</span>
                            <h3 class="text-lg font-bold text-orange-300">LEVEL 2 - SERIOUS VIOLATIONS</h3>
                          </div>
                        </td>
                      </tr>
                      <tr class="bg-orange-900/10 hover:bg-orange-900/20 transition-colors">
                        <td class="px-6 py-4 text-orange-300 font-semibold border-b border-gray-800">LEVEL 2</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">HIPAA Violation</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Giving info to officers/civs without warrant or consent, Adverts etc.</td>
                      </tr>
                      <tr class="bg-orange-900/10 hover:bg-orange-900/20 transition-colors">
                        <td class="px-6 py-4 text-orange-300 font-semibold border-b border-gray-800">LEVEL 2</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Non-Felony Charges</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Any charges acquired that is not a felony charge</td>
                      </tr>
                      <tr class="bg-orange-900/10 hover:bg-orange-900/20 transition-colors">
                        <td class="px-6 py-4 text-orange-300 font-semibold border-b border-gray-800">LEVEL 2</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">On Duty Violence</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Shooting/stabbing/physical violence resulting in injury such as intentional fist fighting</td>
                      </tr>
                      <tr class="bg-orange-900/10 hover:bg-orange-900/20 transition-colors">
                        <td class="px-6 py-4 text-orange-300 font-semibold border-b border-gray-800">LEVEL 2</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Poor Treatment</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Failure to provide proper medical care/incorrect treatment</td>
                      </tr>

                      <!-- LEVEL 1 - Minor Violations -->
                      <tr class="bg-yellow-900/20 border-b border-yellow-800/50">
                        <td colspan="3" class="px-6 py-3">
                          <div class="flex items-center gap-2">
                            <span class="text-yellow-400 text-lg font-bold">⚠️</span>
                            <h3 class="text-lg font-bold text-yellow-300">LEVEL 1 - MINOR VIOLATIONS</h3>
                          </div>
                        </td>
                      </tr>
                      <tr class="bg-yellow-900/10 hover:bg-yellow-900/20 transition-colors">
                        <td class="px-6 py-4 text-yellow-300 font-semibold border-b border-gray-800">LEVEL 1</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Insubordination</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Failure to follow orders from High Command/Disrespectful comment to other employees</td>
                      </tr>
                      <tr class="bg-yellow-900/10 hover:bg-yellow-900/20 transition-colors">
                        <td class="px-6 py-4 text-yellow-300 font-semibold border-b border-gray-800">LEVEL 1</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Firearm/Taser on Duty</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Having a firearm/Taser/weapon on duty at any point on their person</td>
                      </tr>
                      <tr class="bg-yellow-900/10 hover:bg-yellow-900/20 transition-colors">
                        <td class="px-6 py-4 text-yellow-300 font-semibold border-b border-gray-800">LEVEL 1</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Treatments/Equipment not for your rank</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Using Helicopters, water training, or any other training when not the appropriate rank</td>
                      </tr>
                      <tr class="bg-yellow-900/10 hover:bg-yellow-900/20 transition-colors">
                        <td class="px-6 py-4 text-yellow-300 font-semibold border-b border-gray-800">LEVEL 1</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Driving Improperly</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Not clearing intersections, excessive speeding/Reckless driving with patients</td>
                      </tr>

                      <!-- VERBAL WARNINGS -->
                      <tr class="bg-blue-900/20 border-b border-blue-800/50">
                        <td colspan="3" class="px-6 py-3">
                          <div class="flex items-center gap-2">
                            <span class="text-blue-400 text-lg font-bold">💬</span>
                            <h3 class="text-lg font-bold text-blue-300">VERBAL WARNINGS</h3>
                          </div>
                        </td>
                      </tr>
                      <tr class="bg-blue-900/10 hover:bg-blue-900/20 transition-colors">
                        <td class="px-6 py-4 text-blue-300 font-semibold border-b border-gray-800">VERBAL</td>
                        <td class="px-6 py-4 text-white font-medium border-b border-gray-800">Issues with others in Dept.</td>
                        <td class="px-6 py-4 text-gray-300 border-b border-gray-800">Excessive in-house arguments</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="bg-gray-800/50 p-4 border-t border-gray-800">
                  <p class="text-gray-400 text-sm italic">
                    <strong>Note:</strong> Other violations not listed here are up to Supervisor discretion
                  </p>
                </div>
              </div>

              <div class="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                  <h2 class="text-xl font-bold text-white">Disciplinary Consequences</h2>
                </div>
                
                <div class="p-6 space-y-4">
                  <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-red-400 text-xl">🚨</span>
                      <h3 class="text-lg font-bold text-red-300">LEVEL 3</h3>
                    </div>
                    <p class="text-red-200 font-semibold">Immediate Termination</p>
                  </div>

                  <div class="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-orange-400 text-xl">⚡</span>
                      <h3 class="text-lg font-bold text-orange-300">LEVEL 2</h3>
                    </div>
                    <p class="text-orange-200 font-semibold">Suspension, a strike and possible investigation for further action</p>
                  </div>

                  <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-yellow-400 text-xl">⚠️</span>
                      <h3 class="text-lg font-bold text-yellow-300">LEVEL 1</h3>
                    </div>
                    <p class="text-yellow-200 font-semibold">Basic type of strike</p>
                  </div>

                  <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-blue-400 text-xl">💬</span>
                      <h3 class="text-lg font-bold text-blue-300">VERBAL</h3>
                    </div>
                    <p class="text-blue-200 font-semibold">Used to teach. Can be given a strike at discretion if it is a recurring issue</p>
                  </div>
                </div>
              </div>

              <div class="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl p-6">
                <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span class="text-purple-400">📋</span>
                  Important Policy Information
                </h2>
                <div class="space-y-3 text-gray-300">
                  <div class="flex items-start gap-3">
                    <span class="text-green-400 mt-1">✓</span>
                    <p><strong class="text-white">Strike Duration:</strong> Strikes disappear from an employee's record 1 month after they are committed.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-red-400 mt-1">⚠️</span>
                    <p><strong class="text-white">Three Strike Rule:</strong> If 3 Strikes are achieved in a 3 month period, Immediate Termination.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-blue-400 mt-1">ℹ️</span>
                    <p><strong class="text-white">Supervisor Discretion:</strong> Violations not explicitly listed are subject to supervisor discretion and may be classified under the most appropriate level.</p>
                  </div>
                </div>
              </div>
            </div>
          `
        }),
        type: 'policy' as const,
        status: 'published' as const,
        authorId: 'system',
        tags: ['disciplinary', 'policy', 'violations', 'consequences'],
        version: 1,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // Create all content
    for (const content of emsContent) {
      const createdContent = await contentService.create(content);
      console.log(`Created content: ${content.title} (${createdContent.$id})`);
    }

    console.log('Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

// Helper function to check if database needs seeding
export async function isDatabaseSeeded() {
  try {
    const departments = await departmentService.list();
    return departments.length > 0;
  } catch (error) {
    console.error('Error checking if database is seeded:', error);
    return false;
  }
} 