import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';

export const creativeWorkTestData: StorageModel.Product[] = [
  {
    _id: 'id1234',
    _isSellable: true,
    _schemaVersion: '1',
    _sources: [{ source: 'WEBCMS', type: 'product' }],
    _status: '',
    audience: [
      {
        code: 'RPG',
        description: 'RPG - Postgraduate'
      }
    ],
    availability: [],
    categories: [
      {
        code: 'SA',
        name: 'Linguistics UK',
        type: 'flexcat'
      },
      {
        code: 'WB021',
        name: 'MATHnetBASE',
        type: 'netBASE'
      },
      {
        code: 'SA',
        name: 'Tnf goal 1',
        type: 'sdgo'
      },
      {
        code: 'SA',
        name: 'monograph',
        type: 'book-type'
      },
      {
        code: 'SA',
        name: 'presentation',
        type: 'media-type'
      }
    ],
    classifications: [
      {
        code: 'SC01',
        group: '',
        level: 1,
        name: 'Engineering',
        priority: 4,
        type: 'subject'
      },
      {
        code: 'SC011',
        group: '',
        level: 2,
        name: 'Mech Engg',
        priority: 3,
        type: 'subject'
      },
      {
        code: 'SC0111',
        group: '',
        level: 3,
        name: 'Heat Transfer',
        priority: 1,
        type: 'subject'
      },
      {
        code: 'SC0112',
        group: '',
        level: 3,
        name: 'Thermo',
        priority: 2,
        type: 'subject'
      },
      {
        code: 'LC011',
        group: '',
        level: 2,
        name: 'Mech Engg',
        priority: 1,
        type: 'lc'
      }
    ],
    contributors: [
      {
        affiliations: [
          {
            address: {
              city: 'Oxford',
              country: 'UK',
              locality: '',
              state: ''
            },
            department: 'Computer Engineering Department',
            name: 'University of Oxford'
          }
        ],
        bio: 'Fiona Whelan completed her DPhil in Medieval History at the University of Oxford in 2015, and has previously studied at Trinity College Dublin and University College London. She has published widely on medieval codes of behaviour, in particular on Urbanus magnus by Daniel of Beccles. Her research interests include the cultivation of norms of behaviour, food and diet in the medieval period, household administration, and the manuscript culture of early courtesy literature.',
        collab: '',
        email: '',
        familyName: 'Whelan',
        fullName: 'Fiona Whelan',
        givenName: 'Fiona',
        orcid: '',
        position: 1,
        roles: ['editor']
      }
    ],
    creativeWork: {
      abstracts: [
        {
          location: '',
          type: 'text',
          value:
            'Teaching materials for SENCo by Dennis Piper (Special Educational Needs Consultant and a Social, Emotional and Mental Health Specialist)'
        }
      ],
      copyright: {
        holder: 'Taylor and Francis Group',
        statement: '© 2019 Taylor and Francis Group',
        year: 2019
      },
      description:
        'Teaching materials for SENCo by Dennis Piper (Special Educational Needs Consultant and a Social, Emotional and Mental Health Specialist)',
      firstPublishedYear: null,
      format: 'presentation',
      inLanguage: 'en',
      plannedPublicationDate: new Date(),
      publicationDate: new Date(),
      publisherImprint: 'Taylor and Francis Group',
      subtitle: ''
    },
    discountGroups: [
      {
        code: 'W',
        description: 'W - USA ST Titles'
      }
    ],
    identifiers: {
      doi: '10.4324/2fa3b-06ad-4e15-90f4-d0cbe96f62bc',
      sku: ''
    },
    impressionLocations: [],
    isPartOf: [],
    isRelatedTo: [],
    keywords: [
      {
        name: 'Rancid',
        position: 1,
        type: 'editor',
        weightage: 25
      },
      {
        name: 'Regulation',
        position: 1,
        type: 'author',
        weightage: 25
      },
      {
        name: 'Challenges',
        position: 2,
        type: 'editor',
        weightage: 25
      },
      {
        name: 'Law',
        position: 3,
        type: 'author',
        weightage: 25
      },
      {
        name: 'Legal issues',
        position: 4,
        type: 'unsilo',
        weightage: 25
      }
    ],
    permissions: [
      {
        code: 'CTMRFM',
        name: 'rfm',
        text: 'Ready For Market',
        type: 'sales'
      },
      {
        code: 'EBRALL',
        name: 'ebr',
        text: 'Institutional, retail and Atypon',
        type: 'sales'
      },
      {
        code: 'WSTNSS',
        name: 'not-sold-separately',
        text: 'Not Sold Separately',
        type: 'sales'
      },
      {
        code: 'NORIGHTSEB',
        name: 'no-rights-eb',
        text: 'No rights to publish : Ebook',
        type: 'publishing'
      },
      {
        code: 'DRMY',
        name: 'drm',
        text: 'DRM-Protected',
        type: 'access'
      },
      {
        code: 'IN',
        description: 'Restrict Information about Product - USE WITH CAUTION',
        name: 'info-restrict',
        text: 'Indian Originals only - use with caution',
        type: 'access'
      },
      {
        name: 'open-access',
        text: 'Open access product',
        type: 'access'
      },
      {
        description: 'Accessible for Free',
        name: 'free-access',
        text: 'Accesible for free',
        type: 'access',
        validFrom: new Date(),
        validTo: new Date()
      }
    ],
    prices: [
      {
        currency: 'USD',
        price: 129.0,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date()
      },
      {
        currency: 'GBP',
        price: 87.0,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date()
      },
      {
        currency: 'AUD',
        price: 137.0,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date()
      }
    ],
    rights: [
      {
        area: [
          {
            code: 'IND',
            name: 'India'
          }
        ],
        category: 'exclusion',
        iso2: 'IN',
        iso3: 'IND',
        isonum: '356',
        name: 'India',
        type: 'acquired'
      }
    ],
    subType: 'presentation',
    title: 'presentation on TnF Goal 1',
    type: 'creativeWork',
    version: '1.0.0'
  },
  {
    _id: 'id5678',
    _isSellable: true,
    _schemaVersion: '1',
    _sources: [{ source: 'WEBCMS', type: 'product' }],
    _status: '',
    audience: [
      {
        code: 'RPG',
        description: 'RPG - Postgraduate'
      }
    ],
    categories: [
      {
        code: 'SA',
        name: 'Linguistics UK',
        type: 'flexcat'
      },
      {
        code: 'WB021',
        name: 'MATHnetBASE',
        type: 'netBASE'
      },
      {
        code: 'SA',
        name: 'Tnf goal 1',
        type: 'sdgo'
      },
      {
        code: 'SA',
        name: 'monograph',
        type: 'book-type'
      },
      {
        code: 'SA',
        name: 'presentation',
        type: 'media-type'
      }
    ],
    classifications: [
      {
        code: 'SC01',
        group: '',
        level: 1,
        name: 'Engineering',
        priority: 4,
        type: 'subject'
      },
      {
        code: 'SC011',
        group: '',
        level: 2,
        name: 'Mech Engg',
        priority: 3,
        type: 'subject'
      },
      {
        code: 'SC0111',
        group: '',
        level: 3,
        name: 'Heat Transfer',
        priority: 1,
        type: 'subject'
      },
      {
        code: 'SC0112',
        group: '',
        level: 3,
        name: 'Thermo',
        priority: 2,
        type: 'subject'
      },
      {
        code: 'LC011',
        group: '',
        level: 2,
        name: 'Mech Engg',
        priority: 1,
        type: 'lc'
      }
    ],
    contributors: [
      {
        affiliations: [
          {
            address: {
              city: 'Oxford',
              country: 'UK',
              locality: '',
              state: ''
            },
            department: 'Computer Engineering Department',
            name: 'University of Oxford'
          }
        ],
        bio: 'Fiona Whelan completed her DPhil in Medieval History at the University of Oxford in 2015, and has previously studied at Trinity College Dublin and University College London. She has published widely on medieval codes of behaviour, in particular on Urbanus magnus by Daniel of Beccles. Her research interests include the cultivation of norms of behaviour, food and diet in the medieval period, household administration, and the manuscript culture of early courtesy literature.',
        collab: '',
        email: '',
        familyName: 'Whelan',
        fullName: 'Fiona Whelan',
        givenName: 'Fiona',
        orcid: '',
        position: 1,
        roles: ['editor']
      }
    ],
    creativeWork: {
      abstracts: [
        {
          location: '',
          type: 'text',
          value:
            'Teaching materials for SENCo by Dennis Piper (Special Educational Needs Consultant and a Social, Emotional and Mental Health Specialist)'
        }
      ],
      copyright: {
        holder: 'Taylor and Francis Group',
        statement: '© 2019 Taylor and Francis Group',
        year: 2018
      },
      description:
        'Teaching materials for SENCo by Dennis Piper (Special Educational Needs Consultant and a Social, Emotional and Mental Health Specialist)',
      firstPublishedYear: null,
      format: 'presentation',
      inLanguage: 'en',
      plannedPublicationDate: new Date(),
      publicationDate: new Date(),
      publisherImprint: 'Taylor and Francis Group',
      subtitle: ''
    },
    discountGroups: [
      {
        code: 'W',
        description: 'W - USA ST Titles'
      }
    ],
    identifiers: {
      doi: '10.4324/2fa3b-0ad-4e15-90f4-d0cbe96f62bc',
      sku: ''
    },
    isPartOf: [],
    keywords: [
      {
        name: 'Rancid',
        position: 1,
        type: 'editor',
        weightage: 25
      },
      {
        name: 'Regulation',
        position: 1,
        type: 'author',
        weightage: 25
      },
      {
        name: 'Challenges',
        position: 2,
        type: 'editor',
        weightage: 25
      },
      {
        name: 'Law',
        position: 3,
        type: 'author',
        weightage: 25
      },
      {
        name: 'Legal issues',
        position: 4,
        type: 'unsilo',
        weightage: 25
      }
    ],
    permissions: [
      {
        code: 'CTMRFM',
        name: 'rfm',
        text: 'Ready For Market',
        type: 'sales'
      },
      {
        code: 'EBRALL',
        name: 'ebr',
        text: 'Institutional, retail and Atypon',
        type: 'sales'
      },
      {
        code: 'WSTNSS',
        name: 'not-sold-separately',
        text: 'Not Sold Separately',
        type: 'sales'
      },
      {
        code: 'NORIGHTSEB',
        name: 'no-rights-eb',
        text: 'No rights to publish : Ebook',
        type: 'publishing'
      },
      {
        code: 'DRMY',
        name: 'drm',
        text: 'DRM-Protected',
        type: 'access'
      },
      {
        code: 'IN',
        description: 'Restrict Information about Product - USE WITH CAUTION',
        name: 'info-restrict',
        text: 'Indian Originals only - use with caution',
        type: 'access'
      },
      {
        name: 'open-access',
        text: 'open access product',
        type: 'access'
      },
      {
        description: 'Accessible for Free',
        name: 'free-access',
        text: 'accessible for free',
        type: 'access',
        validFrom: new Date(),
        validTo: new Date()
      }
    ],
    prices: [
      {
        currency: 'USD',
        price: 129.0,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date()
      },
      {
        currency: 'GBP',
        price: 87.0,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date()
      },
      {
        currency: 'AUD',
        price: 137.0,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date()
      }
    ],
    rights: [
      {
        area: [
          {
            code: 'IND',
            name: 'India'
          },
          {
            code: 'INDI',
            name: 'India'
          }
        ],
        category: 'exclusion',
        iso2: 'IN',
        iso3: 'IND',
        isonum: '356',
        name: 'India',
        type: 'acquired'
      }
    ],
    subType: 'presentation',
    title: 'presentation on TnF Goal 2',
    type: 'creativeWork',
    version: '2.0.0'
  },
  {
    _id: '3325f513-7cea-48b0-a2a5-8cbfbd8ccd76',
    _isSellable: true,
    _schemaVersion: '1',
    _sources: [],
    _status: '',
    audience: [
      {
        code: 'RPG',
        description: 'RPG - Postgraduate'
      }
    ],
    categories: [
      {
        code: 'SA',
        name: 'Linguistics UK',
        type: 'flexcat'
      },
      {
        code: 'WB021',
        name: 'MATHnetBASE',
        type: 'netBASE'
      },
      {
        code: 'SA',
        name: 'Tnf goal 1',
        type: 'sdgo'
      },
      {
        code: 'SA',
        name: 'monograph',
        type: 'book-type'
      },
      {
        code: 'SA',
        name: 'presentation',
        type: 'media-type'
      }
    ],
    classifications: [
      {
        code: 'SC01',
        group: '',
        level: 1,
        name: 'Engineering',
        priority: 4,
        type: 'subject'
      },
      {
        code: 'SC011',
        group: '',
        level: 2,
        name: 'Mech Engg',
        priority: 3,
        type: 'subject'
      },
      {
        code: 'SC0111',
        group: '',
        level: 3,
        name: 'Heat Transfer',
        priority: 1,
        type: 'subject'
      },
      {
        code: 'SC0112',
        group: '',
        level: 3,
        name: 'Thermo',
        priority: 2,
        type: 'subject'
      },
      {
        code: 'LC011',
        group: '',
        level: 2,
        name: 'Mech Engg',
        priority: 1,
        type: 'lc'
      }
    ],
    contributors: [
      {
        affiliations: [
          {
            address: {
              city: 'Oxford',
              country: 'UK',
              locality: '',
              state: ''
            },
            department: 'Computer Engineering Department',
            name: 'University of Oxford'
          }
        ],
        bio: 'Fiona Whelan completed her DPhil in Medieval History at the University of Oxford in 2015, and has previously studied at Trinity College Dublin and University College London. She has published widely on medieval codes of behaviour, in particular on Urbanus magnus by Daniel of Beccles. Her research interests include the cultivation of norms of behaviour, food and diet in the medieval period, household administration, and the manuscript culture of early courtesy literature.',
        collab: '',
        email: '',
        familyName: 'Whelan',
        fullName: 'Fiona Whelan',
        givenName: 'Fiona',
        orcid: '',
        position: 1,
        roles: ['editor']
      }
    ],
    creativeWork: {
      abstracts: [
        {
          location: '',
          type: 'text',
          value:
            'Teaching materials for SENCo by Dennis Piper (Special Educational Needs Consultant and a Social, Emotional and Mental Health Specialist)'
        }
      ],
      copyright: {
        holder: 'Taylor and Francis Group',
        statement: '© 2019 Taylor and Francis Group',
        year: 2018
      },
      description:
        'Teaching materials for SENCo by Dennis Piper (Special Educational Needs Consultant and a Social, Emotional and Mental Health Specialist)',
      firstPublishedYear: null,
      format: 'document',
      inLanguage: 'en',
      plannedPublicationDate: new Date(),
      publicationDate: new Date(),
      publisherImprint: 'Taylor and Francis Group',
      subtitle: ''
    },
    discountGroups: [
      {
        code: 'W',
        description: 'W - USA ST Titles'
      }
    ],
    identifiers: {
      doi: '10.4324/2fa3b-0ad-4e15-90f4-d0cbe96f62bc',
      sku: ''
    },
    isPartOf: [],
    keywords: [
      {
        name: 'Rancid',
        position: 1,
        type: 'editor',
        weightage: 25
      },
      {
        name: 'Regulation',
        position: 1,
        type: 'author',
        weightage: 25
      },
      {
        name: 'Challenges',
        position: 2,
        type: 'editor',
        weightage: 25
      },
      {
        name: 'Law',
        position: 3,
        type: 'author',
        weightage: 25
      },
      {
        name: 'Legal issues',
        position: 4,
        type: 'unsilo',
        weightage: 25
      }
    ],
    permissions: [
      {
        code: 'CTMRFM',
        name: 'rfm',
        text: 'Ready For Market',
        type: 'sales'
      },
      {
        code: 'EBRALL',
        name: 'ebr',
        text: 'Institutional, retail and Atypon',
        type: 'sales'
      },
      {
        code: 'WSTNSS',
        name: 'not-sold-separately',
        text: 'Not Sold Separately',
        type: 'sales'
      },
      {
        code: 'NORIGHTSEB',
        name: 'no-rights-eb',
        text: 'No rights to publish : Ebook',
        type: 'publishing'
      },
      {
        code: 'DRMY',
        name: 'drm',
        text: 'DRM-Protected',
        type: 'access'
      },
      {
        code: 'IN',
        description: 'Restrict Information about Product - USE WITH CAUTION',
        name: 'info-restrict',
        text: 'Indian Originals only - use with caution',
        type: 'access'
      }
    ],
    prices: [
      {
        currency: 'USD',
        price: 129.0,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date()
      },
      {
        currency: 'GBP',
        price: 87.0,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date()
      },
      {
        currency: 'AUD',
        price: 137.0,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date()
      }
    ],
    rights: [
      {
        area: [
          {
            code: 'IND',
            name: 'India'
          },
          {
            code: 'INDI',
            name: 'India'
          }
        ],
        category: 'exclusion',
        iso2: 'IN',
        iso3: 'IND',
        isonum: '356',
        name: 'India',
        type: 'acquired'
      }
    ],
    subType: 'document',
    title: 'presentation on TnF Goal 2',
    type: 'creativeWork',
    version: '2.0.0'
  },
  {
    _id: '00c99870-7819-4a90-b78e-ecaf86f6106c',
    _isSellable: true,
    _schemaVersion: '1',
    _sources: [],
    _status: '',
    audience: [
      {
        code: 'RPG',
        description: 'RPG - Postgraduate'
      }
    ],
    categories: [
      {
        code: 'SA',
        name: 'Linguistics UK',
        type: 'flexcat'
      },
      {
        code: 'WB021',
        name: 'MATHnetBASE',
        type: 'netBASE'
      },
      {
        code: 'SA',
        name: 'Tnf goal 1',
        type: 'sdgo'
      },
      {
        code: 'SA',
        name: 'monograph',
        type: 'book-type'
      },
      {
        code: 'SA',
        name: 'presentation',
        type: 'media-type'
      }
    ],
    classifications: [
      {
        code: 'SC01',
        group: '',
        level: 1,
        name: 'Engineering',
        priority: 4,
        type: 'subject'
      },
      {
        code: 'SC011',
        group: '',
        level: 2,
        name: 'Mech Engg',
        priority: 3,
        type: 'subject'
      },
      {
        code: 'SC0111',
        group: '',
        level: 3,
        name: 'Heat Transfer',
        priority: 1,
        type: 'subject'
      },
      {
        code: 'SC0112',
        group: '',
        level: 3,
        name: 'Thermo',
        priority: 2,
        type: 'subject'
      },
      {
        code: 'LC011',
        group: '',
        level: 2,
        name: 'Mech Engg',
        priority: 1,
        type: 'lc'
      }
    ],
    contributors: [
      {
        affiliations: [
          {
            address: {
              city: 'Oxford',
              country: 'UK',
              locality: '',
              state: ''
            },
            department: 'Computer Engineering Department',
            name: 'University of Oxford'
          }
        ],
        bio: 'Fiona Whelan completed her DPhil in Medieval History at the University of Oxford in 2015, and has previously studied at Trinity College Dublin and University College London. She has published widely on medieval codes of behaviour, in particular on Urbanus magnus by Daniel of Beccles. Her research interests include the cultivation of norms of behaviour, food and diet in the medieval period, household administration, and the manuscript culture of early courtesy literature.',
        collab: '',
        email: '',
        familyName: 'Whelan',
        fullName: 'Fiona Whelan',
        givenName: 'Fiona',
        orcid: '',
        position: 1,
        roles: ['editor']
      }
    ],
    creativeWork: {
      abstracts: [
        {
          location: '',
          type: 'text',
          value:
            'Teaching materials for SENCo by Dennis Piper (Special Educational Needs Consultant and a Social, Emotional and Mental Health Specialist)'
        }
      ],
      copyright: {
        holder: 'Taylor and Francis Group',
        statement: '© 2019 Taylor and Francis Group',
        year: 2018
      },
      description:
        'Teaching materials for SENCo by Dennis Piper (Special Educational Needs Consultant and a Social, Emotional and Mental Health Specialist)',
      firstPublishedYear: null,
      format: 'hyperlink',
      inLanguage: 'en',
      plannedPublicationDate: new Date(),
      publicationDate: new Date(),
      publisherImprint: 'Taylor and Francis Group',
      subtitle: ''
    },
    discountGroups: [
      {
        code: 'W',
        description: 'W - USA ST Titles'
      }
    ],
    identifiers: {
      doi: '10.4324/2fa3b-0ad-4e15-90f4-d0cbe96f62bc',
      sku: ''
    },
    isPartOf: [],
    keywords: [
      {
        name: 'Rancid',
        position: 1,
        type: 'editor',
        weightage: 25
      },
      {
        name: 'Regulation',
        position: 1,
        type: 'author',
        weightage: 25
      },
      {
        name: 'Challenges',
        position: 2,
        type: 'editor',
        weightage: 25
      },
      {
        name: 'Law',
        position: 3,
        type: 'author',
        weightage: 25
      },
      {
        name: 'Legal issues',
        position: 4,
        type: 'unsilo',
        weightage: 25
      }
    ],
    permissions: [
      {
        code: 'CTMRFM',
        name: 'rfm',
        text: 'Ready For Market',
        type: 'sales'
      },
      {
        code: 'EBRALL',
        name: 'ebr',
        text: 'Institutional, retail and Atypon',
        type: 'sales'
      },
      {
        code: 'WSTNSS',
        name: 'not-sold-separately',
        text: 'Not Sold Separately',
        type: 'sales'
      },
      {
        code: 'NORIGHTSEB',
        name: 'no-rights-eb',
        text: 'No rights to publish : Ebook',
        type: 'publishing'
      },
      {
        code: 'DRMY',
        name: 'drm',
        text: 'DRM-Protected',
        type: 'access'
      },
      {
        code: 'IN',
        description: 'Restrict Information about Product - USE WITH CAUTION',
        name: 'info-restrict',
        text: 'Indian Originals only - use with caution',
        type: 'access'
      },
      {
        name: 'open-access',
        text: 'open acess product',
        type: 'access'
      }
    ],
    prices: [
      {
        currency: 'USD',
        price: 129.0,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date()
      },
      {
        currency: 'GBP',
        price: 87.0,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date()
      },
      {
        currency: 'AUD',
        price: 137.0,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date()
      }
    ],
    rights: [
      {
        area: [
          {
            code: 'IND',
            name: 'India'
          },
          {
            code: 'INDI',
            name: 'India'
          }
        ],
        category: 'exclusion',
        iso2: 'IN',
        iso3: 'IND',
        isonum: '356',
        name: 'India',
        type: 'acquired'
      }
    ],
    subType: 'hyperlink',
    title: 'presentation on TnF Goal 2',
    type: 'creativeWork',
    version: '2.0.0'
  }
];
