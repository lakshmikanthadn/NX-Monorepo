import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';

export const booksTestData: StorageModel.Product[] = [
  {
    _createdDate: new Date('2020-02-11T13:52:16.995+00:00'),
    _id: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
    _isSellable: true,
    _modifiedDate: new Date('2020-02-11T13:52:16.995+00:00'),
    _schemaVersion: '4.0.1',
    _sources: [],
    _status: 'Available',

    audience: [
      {
        code: 'RPG',
        description: 'Postgraduate'
      },
      {
        code: 'RUG',
        description: 'Undergraduate'
      }
    ],

    availability: [
      {
        errors: ['random'],
        name: 'some-channel',
        status: ['some-status', 'some-status1']
      },
      {
        errors: ['random'],
        name: 'another-channel',
        status: ['some-status', 'some-status1']
      }
    ],

    book: {
      abstracts: [],
      bibliographicSpecification: {
        format: 'ROY8',
        height: null,
        weight: null,
        width: null
      },
      bindingStyle: 'eBook - General',
      bindingStyleCode: 'EBGE',
      citation: '',
      copyright: {
        holder: 'Taylor & Francis',
        statement: 'Copyright © 2009, Taylor & Francis.',
        year: 2009
      },
      counts: [
        {
          count: 27,
          type: 'illustrationsBW'
        },
        {
          count: 1,
          type: 'line_artsBW'
        },
        {
          count: 1,
          type: 'tablesBW'
        },
        {
          count: 26,
          type: 'halftonesBW'
        },
        {
          count: 150,
          type: 'pagesArabic'
        },
        {
          count: 10,
          type: 'pagesRoman'
        }
      ],
      description:
        '<P>This book looks at the trends in the development of the Igbo Novel from its antecedents in oral and performance, through the emergence of the first published novel, Omenuko, in 1933 by Pita Nwana, to the contemporary Igbo novel.</P>',
      division: 'African Studies',
      divisionCode: 'AFST',
      doiRegistrationStatus: false,
      edition: 1,
      firstPublishedYear: 2020,
      // Changing this data 2020 to 201 intentionally for testing
      // the firstPublishedYearNumber transformation
      firstPublishedYearNumber: 2010,

      format: 'e-Book',

      formatCode: 'EBK',

      formerImprints: [
        {
          code: 'FIMPASH',
          description: 'Ashgate'
        }
      ],

      fundingGroups: [],

      inLanguage: 'eng',

      legacyDivision: null,

      legalOwner: 'UK',

      license: {
        description: 'some-description',
        location: 'some-location',
        type: 'some-type'
      },

      plannedPublicationDate: new Date('2020-02-27T00:00:00.000+00:00'),

      productionSpecification: {
        basicColor: '1 colour'
      },

      publicationDate: new Date('2020-02-07T00:00:00.000+00:00'),

      publicationLocation: 'London',

      publisherArea: 'Social Science',

      publisherAreaCode: 'SOCSCI',

      publisherImprint: 'Routledge',

      shortTitle: 'African Literature in African Languages',

      status: 'Available',

      statusCode: 'LFB',

      subtitle: 'African Literature in African Languages',

      textType: 'Monograph (DRM-Free)',
      textTypeCode: '680',
      toc: '<![CDATA[<P>1. The Need for a Literary History&nbsp; 2. Igbo Literary Origins&nbsp; 3. Minstrelsy in Traditional Igbo Society: Remembering a Pioneer Legend—Israel Nwaọba Njemanze (Alias Israel Nwaọba)&nbsp; 4. From Voice to Text: Missionary Influence on the Development of Igbo Orthography and Written Igbo Literature&nbsp; 5. Early Fiction in Igbo—The Pioneers&nbsp; 6. The Crisis of Standardization of Written (Literary) Igbo Language: Pioneer Efforts of F.C. Ogbalu: Founder and Architect, Society for Promoting Igbo Language and Culture (SPILC)&nbsp; 7. On the Threshold of Another Blackout: A New Controversy over the Standardization of Written (Literary) Igbo&nbsp; 8. Chinua Achebe and the Problematics of Writing in Indigenous Nigerian Languages: Towards a Resolution of the Igbo Language Predicament&nbsp; 9. The Female Voice—Rebuttal and Response to Patriarchy:&nbsp;Julie Onwuchekwa’s <EM>Chinaagọrọm</EM><EM>&nbsp;</EM>(1983)&nbsp; 10. Tony Uchenna Ubesie: The Quintessential Igbo Novelist &nbsp;11. Interviews with Two Major Igbo Novelists: J.U.T Nzeako and Chinedu Ofomata&nbsp; </P>]]>'
    },

    // _schemaVersion: '4.0.1',
    categories: [],

    classifications: [
      {
        code: 'SCAS02',
        group: null,
        level: 2,
        name: 'African Studies',
        priority: 1,
        type: 'subject'
      },
      {
        code: 'SCAS0203',
        group: null,
        level: 3,
        name: 'African Culture and Society',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCAS0206',
        group: null,
        level: 3,
        name: 'African Literature & Language',
        priority: 2,
        type: 'subject'
      },
      {
        code: 'SCAS0207',
        group: null,
        level: 3,
        name: 'African History',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA055005',
        group: null,
        level: 4,
        name: 'African Literature',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA0555',
        group: null,
        level: 3,
        name: 'Literary History',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCAS',
        group: null,
        level: 1,
        name: 'Area Studies',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA0550',
        group: null,
        level: 3,
        name: 'Literature by Geographic Area',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA05',
        group: null,
        level: 2,
        name: 'Literature',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA',
        group: null,
        level: 1,
        name: 'Language & Literature',
        priority: 0,
        type: 'subject'
      }
    ],

    contributors: [
      {
        affiliations: [
          {
            address: null,
            department: null,
            name: 'University of Michigan-Flint, USA'
          }
        ],
        bio: null,
        collab: null,
        email: null,
        familyName: 'Emenyonu',
        fullName: 'Ernest N. Emenyonu',
        givenName: 'Ernest N.',
        orcid: null,
        position: 1,
        roles: ['Author']
      }
    ],

    discountGroups: [
      {
        code: '10',
        description: '10 (old TPS 12) - Informa Law & Electr Media'
      }
    ],
    identifiers: {
      dacKey: 'C2019-0-05243-2',
      doi: '10.4324/9781003017455',
      editionId: '786246',
      isbn: '9781003017455',
      orderNumber: '329336',
      sku: null,
      titleId: '416788'
    },
    isPartOf: [],
    keywords: [
      {
        name: 'IGBO\tNOVEL',
        position: 1,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tWRITING',
        position: 2,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICAN\tNOVELS',
        position: 3,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICA\tNOVEL',
        position: 4,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICA\tHISTORY',
        position: 5,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tHISTORY',
        position: 6,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tAUTHORS',
        position: 7,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICAN\tAUTHORS',
        position: 8,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tLITERATURE',
        position: 9,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICA\tLITERATURE',
        position: 10,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'LITERATURE',
        position: 11,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'LITERARY\tHISTORY',
        position: 12,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'NIGERIA\tHISTORY',
        position: 13,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'NIGERIA\tLITERATURE',
        position: 14,
        type: 'catchword',
        weightage: null
      }
    ],
    permissions: [
      {
        code: 'CTMRFM',
        description: null,
        name: 'rfm',
        text: 'Ready For Market',
        type: 'sales',
        validFrom: null,
        validTo: null
      }
    ],
    prices: [
      {
        currency: 'EUR',
        price: 135,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'GBP',
        price: 135,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'USD',
        price: 175,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'GBP',
        price: 135,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'USD',
        price: 175,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'GBP',
        price: 41,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'USD',
        price: 57,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'AUD',
        price: 227,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'NZD',
        price: 240,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      }
    ],
    rights: [
      {
        area: [
          {
            code: 'ASIA',
            name: 'India'
          },
          {
            code: 'DECO',
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
    title: 'The Literary History of the Igbo Novel',
    type: 'book',
    version: '1.0.0'
  },
  {
    _createdDate: new Date('2020-02-11T13:52:16.995+00:00'),
    _id: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6897',
    _isSellable: true,
    _modifiedDate: new Date('2020-02-11T13:52:16.995+00:00'),
    _schemaVersion: '4.0.1',
    _sources: [],
    _status: 'Available',

    audience: [
      {
        code: 'RPG',
        description: 'Postgraduate'
      },
      {
        code: 'RUG',
        description: 'Undergraduate'
      }
    ],

    book: {
      abstracts: [],
      bibliographicSpecification: {
        format: 'ROY8',
        height: null,
        weight: null,
        width: null
      },
      bindingStyle: 'eBook - General',
      bindingStyleCode: 'EBGE',
      citation: '',
      copyright: {
        holder: 'Taylor & Francis',
        statement: 'Copyright © 2009, Taylor & Francis.',
        year: 2009
      },
      counts: [
        {
          count: 27,
          type: 'illustrationsBW'
        },
        {
          count: 1,
          type: 'line_artsBW'
        },
        {
          count: 1,
          type: 'tablesBW'
        },
        {
          count: 26,
          type: 'halftonesBW'
        },
        {
          count: 150,
          type: 'pagesArabic'
        },
        {
          count: 10,
          type: 'pagesRoman'
        }
      ],
      description:
        '<P>This book looks at the trends in the development of the Igbo Novel from its antecedents in oral and performance, through the emergence of the first published novel, Omenuko, in 1933 by Pita Nwana, to the contemporary Igbo novel.</P>',
      division: 'African Studies',
      divisionCode: 'AFST',
      doiRegistrationStatus: false,
      edition: 1,
      firstPublishedYear: 2020,
      firstPublishedYearNumber: 2020,
      format: 'e-Book',
      formatCode: 'EBK',
      formerImprints: [
        {
          code: 'FIMPASH',
          description: 'Ashgate'
        }
      ],
      fundingGroups: [],
      inLanguage: 'eng',
      legacyDivision: null,
      legalOwner: 'UK',
      license: {
        description: 'some-description',
        location: 'some-location',
        type: 'some-type'
      },
      plannedPublicationDate: new Date('2020-02-27T00:00:00.000+00:00'),
      productionSpecification: {
        basicColor: '1 colour'
      },
      publicationDate: new Date('2020-02-07T00:00:00.000+00:00'),
      publicationLocation: 'London',
      publisherArea: 'Social Science',
      publisherAreaCode: 'SOCSCI',
      publisherImprint: 'Routledge',
      status: 'Available',
      statusCode: 'LFB',
      subtitle: 'African Literature in African Languages',
      textType: 'Monograph (DRM-Free)',
      textTypeCode: '680',
      toc: '<![CDATA[<P>1. The Need for a Literary History&nbsp; 2. Igbo Literary Origins&nbsp; 3. Minstrelsy in Traditional Igbo Society: Remembering a Pioneer Legend—Israel Nwaọba Njemanze (Alias Israel Nwaọba)&nbsp; 4. From Voice to Text: Missionary Influence on the Development of Igbo Orthography and Written Igbo Literature&nbsp; 5. Early Fiction in Igbo—The Pioneers&nbsp; 6. The Crisis of Standardization of Written (Literary) Igbo Language: Pioneer Efforts of F.C. Ogbalu: Founder and Architect, Society for Promoting Igbo Language and Culture (SPILC)&nbsp; 7. On the Threshold of Another Blackout: A New Controversy over the Standardization of Written (Literary) Igbo&nbsp; 8. Chinua Achebe and the Problematics of Writing in Indigenous Nigerian Languages: Towards a Resolution of the Igbo Language Predicament&nbsp; 9. The Female Voice—Rebuttal and Response to Patriarchy:&nbsp;Julie Onwuchekwa’s <EM>Chinaagọrọm</EM><EM>&nbsp;</EM>(1983)&nbsp; 10. Tony Uchenna Ubesie: The Quintessential Igbo Novelist &nbsp;11. Interviews with Two Major Igbo Novelists: J.U.T Nzeako and Chinedu Ofomata&nbsp; </P>]]>'
    },

    // _schemaVersion: '4.0.1',
    categories: [],

    classifications: [
      {
        code: 'SCAS02',
        group: null,
        level: 2,
        name: 'African Studies',
        priority: 1,
        type: 'subject'
      },
      {
        code: 'SCAS0203',
        group: null,
        level: 3,
        name: 'African Culture and Society',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCAS0206',
        group: null,
        level: 3,
        name: 'African Literature & Language',
        priority: 2,
        type: 'subject'
      },
      {
        code: 'SCAS0207',
        group: null,
        level: 3,
        name: 'African History',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA055005',
        group: null,
        level: 4,
        name: 'African Literature',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA0555',
        group: null,
        level: 3,
        name: 'Literary History',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCAS',
        group: null,
        level: 1,
        name: 'Area Studies',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA0550',
        group: null,
        level: 3,
        name: 'Literature by Geographic Area',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA05',
        group: null,
        level: 2,
        name: 'Literature',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA',
        group: null,
        level: 1,
        name: 'Language & Literature',
        priority: 0,
        type: 'subject'
      }
    ],

    contributors: [
      {
        affiliations: [
          {
            address: null,
            department: null,
            name: 'University of Michigan-Flint, USA'
          }
        ],
        bio: null,
        collab: null,
        email: null,
        familyName: 'Emenyonu',
        fullName: 'Ernest N. Emenyonu',
        givenName: 'Ernest N.',
        orcid: null,
        position: 1,
        roles: ['Author']
      }
    ],

    discountGroups: [
      {
        code: '10',
        description: '10 (old TPS 12) - Informa Law & Electr Media'
      }
    ],

    identifiers: {
      dacKey: 'C2019-0-05243-2',
      doi: '10.4324/9781003017455',
      editionId: '786246',
      isbn: '9781003017455',
      orderNumber: '329336',
      sku: null,
      titleId: '416788'
    },
    isPartOf: [],
    keywords: [
      {
        name: 'IGBO\tNOVEL',
        position: 1,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tWRITING',
        position: 2,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICAN\tNOVELS',
        position: 3,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICA\tNOVEL',
        position: 4,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICA\tHISTORY',
        position: 5,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tHISTORY',
        position: 6,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tAUTHORS',
        position: 7,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICAN\tAUTHORS',
        position: 8,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tLITERATURE',
        position: 9,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICA\tLITERATURE',
        position: 10,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'LITERATURE',
        position: 11,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'LITERARY\tHISTORY',
        position: 12,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'NIGERIA\tHISTORY',
        position: 13,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'NIGERIA\tLITERATURE',
        position: 14,
        type: 'catchword',
        weightage: null
      }
    ],
    permissions: [
      {
        code: 'CTMRFM',
        description: null,
        name: 'rfm',
        text: 'Ready For Market',
        type: 'sales',
        validFrom: null,
        validTo: null
      }
    ],
    prices: [
      {
        currency: 'EUR',
        price: 135,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'GBP',
        price: 135,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'USD',
        price: 175,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'GBP',
        price: 135,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'USD',
        price: 175,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'GBP',
        price: 41,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'USD',
        price: 57,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'AUD',
        price: 227,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'NZD',
        price: 240,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      }
    ],
    rights: [],
    title: 'The Literary History of the Igbo Novel',
    type: 'book',
    version: '1.0.0'
  },
  {
    _createdDate: new Date('2020-02-11T13:52:16.995+00:00'),
    _id: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6898',
    _isSellable: true,
    _modifiedDate: new Date('2020-02-11T13:52:16.995+00:00'),
    _schemaVersion: '4.0.1',
    _sources: [],
    _status: 'Available',

    audience: [
      {
        code: 'RPG',
        description: 'Postgraduate'
      },
      {
        code: 'RUG',
        description: 'Undergraduate'
      }
    ],

    book: {
      abstracts: [],
      bibliographicSpecification: {
        format: 'ROY8',
        height: null,
        weight: null,
        width: null
      },
      bindingStyle: 'eBook - General',
      bindingStyleCode: 'EBGE',
      citation: '',
      copyright: {
        holder: 'Taylor & Francis',
        statement: 'Copyright © 2009, Taylor & Francis.',
        year: 2009
      },
      counts: [
        {
          count: 27,
          type: 'illustrationsBW'
        },
        {
          count: 1,
          type: 'line_artsBW'
        },
        {
          count: 1,
          type: 'tablesBW'
        },
        {
          count: 26,
          type: 'halftonesBW'
        },
        {
          count: 150,
          type: 'pagesArabic'
        },
        {
          count: 10,
          type: 'pagesRoman'
        }
      ],
      description:
        '<P>This book looks at the trends in the development of the Igbo Novel from its antecedents in oral and performance, through the emergence of the first published novel, Omenuko, in 1933 by Pita Nwana, to the contemporary Igbo novel.</P>',
      division: 'African Studies',
      divisionCode: 'AFST',
      doiRegistrationStatus: false,
      edition: 1,
      firstPublishedYear: 2020,
      firstPublishedYearNumber: 2020,
      format: 'e-Book',
      formatCode: 'EBK',
      formerImprints: [
        {
          code: 'FIMPASH',
          description: 'Ashgate'
        }
      ],
      fundingGroups: [],
      inLanguage: 'eng',
      legacyDivision: null,
      legalOwner: 'UK',
      license: {
        description: 'some-description',
        location: 'some-location',
        type: 'some-type'
      },
      plannedPublicationDate: new Date('2020-02-27T00:00:00.000+00:00'),
      productionSpecification: {
        basicColor: '1 colour'
      },
      publicationDate: new Date('2020-02-07T00:00:00.000+00:00'),
      publicationLocation: 'London',
      publisherArea: 'Social Science',
      publisherAreaCode: 'SOCSCI',
      publisherImprint: 'Routledge',
      status: 'Available',
      statusCode: 'LFB',
      subtitle: 'African Literature in African Languages',
      textType: 'Monograph (DRM-Free)',
      textTypeCode: '680',
      toc: '<![CDATA[<P>1. The Need for a Literary History&nbsp; 2. Igbo Literary Origins&nbsp; 3. Minstrelsy in Traditional Igbo Society: Remembering a Pioneer Legend—Israel Nwaọba Njemanze (Alias Israel Nwaọba)&nbsp; 4. From Voice to Text: Missionary Influence on the Development of Igbo Orthography and Written Igbo Literature&nbsp; 5. Early Fiction in Igbo—The Pioneers&nbsp; 6. The Crisis of Standardization of Written (Literary) Igbo Language: Pioneer Efforts of F.C. Ogbalu: Founder and Architect, Society for Promoting Igbo Language and Culture (SPILC)&nbsp; 7. On the Threshold of Another Blackout: A New Controversy over the Standardization of Written (Literary) Igbo&nbsp; 8. Chinua Achebe and the Problematics of Writing in Indigenous Nigerian Languages: Towards a Resolution of the Igbo Language Predicament&nbsp; 9. The Female Voice—Rebuttal and Response to Patriarchy:&nbsp;Julie Onwuchekwa’s <EM>Chinaagọrọm</EM><EM>&nbsp;</EM>(1983)&nbsp; 10. Tony Uchenna Ubesie: The Quintessential Igbo Novelist &nbsp;11. Interviews with Two Major Igbo Novelists: J.U.T Nzeako and Chinedu Ofomata&nbsp; </P>]]>'
    },

    // _schemaVersion: '4.0.1',
    categories: [],

    classifications: [
      {
        code: 'SCAS02',
        group: null,
        level: 2,
        name: 'African Studies',
        priority: 1,
        type: 'subject'
      },
      {
        code: 'SCAS0203',
        group: null,
        level: 3,
        name: 'African Culture and Society',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCAS0206',
        group: null,
        level: 3,
        name: 'African Literature & Language',
        priority: 2,
        type: 'subject'
      },
      {
        code: 'SCAS0207',
        group: null,
        level: 3,
        name: 'African History',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA055005',
        group: null,
        level: 4,
        name: 'African Literature',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA0555',
        group: null,
        level: 3,
        name: 'Literary History',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCAS',
        group: null,
        level: 1,
        name: 'Area Studies',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA0550',
        group: null,
        level: 3,
        name: 'Literature by Geographic Area',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA05',
        group: null,
        level: 2,
        name: 'Literature',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCLA',
        group: null,
        level: 1,
        name: 'Language & Literature',
        priority: 0,
        type: 'subject'
      }
    ],

    contributors: [
      {
        affiliations: [
          {
            address: null,
            department: null,
            name: 'University of Michigan-Flint, USA'
          }
        ],
        bio: null,
        collab: null,
        email: null,
        familyName: 'Emenyonu',
        fullName: 'Ernest N. Emenyonu',
        givenName: 'Ernest N.',
        orcid: null,
        position: 1,
        roles: ['Author']
      }
    ],

    discountGroups: [
      {
        code: '10',
        description: '10 (old TPS 12) - Informa Law & Electr Media'
      }
    ],

    identifiers: {
      dacKey: 'C2019-0-05243-2',
      doi: '10.4324/9781003017455',
      editionId: '786246',
      isbn: '9781003017455',
      orderNumber: '329336',
      sku: null,
      titleId: '416788'
    },
    isPartOf: [],
    keywords: [
      {
        name: 'IGBO\tNOVEL',
        position: 1,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tWRITING',
        position: 2,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICAN\tNOVELS',
        position: 3,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICA\tNOVEL',
        position: 4,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICA\tHISTORY',
        position: 5,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tHISTORY',
        position: 6,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tAUTHORS',
        position: 7,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICAN\tAUTHORS',
        position: 8,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'IGBO\tLITERATURE',
        position: 9,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'AFRICA\tLITERATURE',
        position: 10,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'LITERATURE',
        position: 11,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'LITERARY\tHISTORY',
        position: 12,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'NIGERIA\tHISTORY',
        position: 13,
        type: 'catchword',
        weightage: null
      },
      {
        name: 'NIGERIA\tLITERATURE',
        position: 14,
        type: 'catchword',
        weightage: null
      }
    ],
    permissions: [
      {
        code: 'CTMRFM',
        description: null,
        name: 'rfm',
        text: 'Ready For Market',
        type: 'sales',
        validFrom: null,
        validTo: null
      }
    ],
    prices: [
      {
        currency: 'EUR',
        price: 135,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'GBP',
        price: 135,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'USD',
        price: 175,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'GBP',
        price: 135,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'USD',
        price: 175,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'GBP',
        price: 41,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'USD',
        price: 57,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'AUD',
        price: 227,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      },
      {
        currency: 'NZD',
        price: 240,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-02-07T00:00:00.000+00:00')
      }
    ],
    rights: [],
    title: 'The Literary History of the Igbo Novel',
    type: 'book',
    version: '1.0.0'
  },
  {
    _createdDate: new Date('2020-01-31T09:19:40.937Z'),
    _id: 'b4d25b04-9ca8-4f8d-9b84-72d6bc5577e1',
    _isSellable: false,
    _modifiedDate: new Date('2020-01-31T09:33:37.572Z'),
    _schemaVersion: '4.0.1',
    _sources: [],
    _status: null,
    audience: [],
    availability: [
      {
        errors: ['random'],
        name: 'some-channel',
        status: ['some-status', 'some-status1']
      },
      {
        errors: ['random'],
        name: 'another-channel',
        status: ['some-status', 'some-status1']
      }
    ],
    book: {
      abstracts: [
        {
          location: null,
          type: 'text',
          value:
            'The purpose of this book has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
        }
      ],
      bibliographicSpecification: {
        format: '280 x 216',
        height: null,
        weight: null,
        width: null
      },
      bindingStyle: 'eBook - General',
      bindingStyleCode: 'EBGE',
      citation: '',
      copyright: {
        holder: 'The Stationery Office',
        statement: '© The Stationery Office 2001',
        year: 2001
      },
      counts: [],
      description:
        'First Published in 2002. Routledge is an imprint of Taylor &amp; Francis, an informa company.',
      division: 'History',
      divisionCode: 'HIST',
      doiRegistrationStatus: false,
      edition: 1,
      firstPublishedYear: 2001,
      firstPublishedYearNumber: 2001,
      format: 'e-Book',
      formatCode: 'EBK',
      formerImprints: [],
      fundingGroups: [],
      inLanguage: 'eng',
      legacyDivision: null,
      legalOwner: null,
      license: {
        description: 'some-description',
        location: 'some-location',
        type: 'some-type'
      },
      plannedPublicationDate: new Date('2018-10-31T00:00:00.000Z'),
      productionSpecification: null,
      publicationDate: null,
      publicationLocation: null,
      publisherArea: 'Humanities & Media Arts',
      publisherAreaCode: 'HUMMED',
      publisherImprint: 'Routledge',
      status: 'Available',
      statusCode: 'LFB',
      subtitle: 'Coachbuilding',
      textType: 'Reference (DRM-Free)',
      textTypeCode: '300',
      toc: "<![CDATA[Dedication&nbsp; Alphabetical List of Colour Illustrations&nbsp; Alphabetical List of Original Manufacturers' Promotional Images&nbsp; Foreword&nbsp; Acknowledgements&nbsp; Introduction&nbsp; Terms and Abbreviations Used&nbsp; History of Coachbuilding&nbsp; Early Days&nbsp; From World War I to the Depression&nbsp; The&nbsp; Years Before World War II&nbsp; After World War II&nbsp; Colour&nbsp; Illustrations&nbsp; Alphabetical List of Makes&nbsp; Supplementary List&nbsp; Glossary&nbsp; Contributors to the Encyclopedia]]>"
    },
    categories: [],
    classifications: [
      {
        code: 'SCRF06',
        group: '',
        level: 2,
        name: 'General Reference',
        priority: 0,
        type: 'subject'
      },
      {
        code: 'SCRF',
        group: '',
        level: 1,
        name: 'Reference & Information Science',
        priority: 0,
        type: 'subject'
      }
    ],
    contributors: [
      {
        affiliations: [
          {
            address: null,
            department: null,
            name: 'University of Michigan-Flint, USA'
          }
        ],
        bio: null,
        collab: null,
        email: null,
        familyName: 'Sewell',
        fullName: 'Brian Sewell',
        givenName: 'Brian',
        orcid: null,
        position: 1,
        roles: ['author']
      }
    ],
    discountGroups: [
      {
        code: 'Y',
        description: 'Y - USA Hum/Soc Reference'
      }
    ],
    identifiers: {
      dacKey: 'C2006-0-08068-9',
      doi: '10.4324/9780203357644',
      editionId: '256935',
      isbn: '9780203357644',
      orderNumber: 'YE17780',
      sku: null,
      titleId: '113493'
    },
    isPartOf: [],
    keywords: [
      {
        name: 'BRIANSEWELL',
        position: 1,
        type: 'Brian Sewell',
        weightage: 0
      }
    ],
    permissions: [],
    prices: [
      {
        currency: 'EUR',
        price: 181.5,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: new Date('2019-07-19T00:00:00.000Z')
      },
      {
        currency: 'USD',
        price: 265,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: new Date('2019-11-12T00:00:00.000Z')
      },
      {
        currency: 'USD',
        price: 57.95,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2018-03-27T00:00:00.000Z')
      }
    ],
    rights: [],
    title: 'The Beaulieu Encyclopedia of the Automobile',
    type: 'book',
    version: '1.0.0'
  },
  {
    _createdDate: new Date('2020-01-31T09:19:40.937Z'),
    _id: 'some-uuid',
    _isSellable: false,
    _modifiedDate: new Date('2020-01-31T09:33:37.572Z'),
    _schemaVersion: '4.0.1',
    _sources: [],
    _status: null,
    audience: [],
    availability: [
      {
        errors: ['random'],
        name: 'some-channel',
        status: ['some-status', 'some-status1']
      },
      {
        errors: ['random'],
        name: 'another-channel',
        status: ['some-status', 'some-status1']
      }
    ],
    book: {
      abstracts: [
        {
          location: null,
          type: 'text',
          value:
            'The purpose of this book has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
        }
      ],
      bibliographicSpecification: {
        format: '280 x 216',
        height: null,
        weight: null,
        width: null
      },
      bindingStyle: 'eBook - General',
      bindingStyleCode: 'EBGE',
      citation: '',
      copyright: {
        holder: 'The Stationery Office',
        statement: '© The Stationery Office 2001',
        year: 2001
      },
      counts: [],
      description:
        'First Published in 2002. Routledge is an imprint of Taylor &amp; Francis, an informa company.',
      division: 'History',
      divisionCode: 'HIST',
      doiRegistrationStatus: false,
      edition: 1,
      firstPublishedYear: 2001,
      firstPublishedYearNumber: 2001,
      format: 'e-Book',
      formatCode: 'EBK',
      formerImprints: [],
      fundingGroups: [],
      inLanguage: 'eng',
      legacyDivision: null,
      legalOwner: null,
      license: {
        description: 'some-description',
        location: 'some-location',
        type: 'some-type'
      },
      plannedPublicationDate: new Date('2018-10-31T00:00:00.000Z'),
      productionSpecification: null,
      publicationDate: null,
      publicationLocation: null,
      publisherArea: 'Humanities & Media Arts',
      publisherAreaCode: 'HUMMED',
      publisherImprint: 'Routledge',
      status: 'Available',
      statusCode: 'LFB',
      subtitle: 'Coachbuilding',
      textType: 'Reference (DRM-Free)',
      textTypeCode: '300',
      toc: "<![CDATA[Dedication&nbsp; Alphabetical List of Colour Illustrations&nbsp; Alphabetical List of Original Manufacturers' Promotional Images&nbsp; Foreword&nbsp; Acknowledgements&nbsp; Introduction&nbsp; Terms and Abbreviations Used&nbsp; History of Coachbuilding&nbsp; Early Days&nbsp; From World War I to the Depression&nbsp; The&nbsp; Years Before World War II&nbsp; After World War II&nbsp; Colour&nbsp; Illustrations&nbsp; Alphabetical List of Makes&nbsp; Supplementary List&nbsp; Glossary&nbsp; Contributors to the Encyclopedia]]>"
    },
    categories: [],
    classifications: [],
    contributors: [],
    discountGroups: [],
    identifiers: {
      dacKey: 'some-dac',
      doi: 'some-doi',
      editionId: '256935',
      isbn: 'some-isbn',
      orderNumber: 'some-order_number',
      sku: null,
      titleId: 'some-titleid'
    },
    isPartOf: [],
    keywords: [],
    permissions: [],
    prices: [],
    rights: [],
    title: 'some-title',
    type: 'book',
    version: '1.0.0'
  },
  {
    _id: 'f209ebc7-a646-44dd-be3f-12a1656c6dcc',
    _isSellable: true,
    _schemaVersion: '4.0.1',
    _sources: [
      {
        source: 'CMS',
        type: 'content'
      }
    ],
    _status: 'Available',
    audience: [],
    availability: [
      {
        errors: [],
        name: 'AGG',
        status: ['CAN_SEND_TO_AGG']
      },
      {
        errors: [],
        name: 'UBX',
        status: ['SELLABLE', 'CAN_HOST', 'PUBLISHED']
      }
    ],
    book: {
      abstracts: [],
      bibliographicSpecification: {
        format: 'SPCL',
        height: null,
        weight: null,
        width: null
      },
      bindingStyle: 'eBook - General',
      bindingStyleCode: 'EBGE',
      citation:
        'Craggs, S.R.(1998). Soundtracks: An International Dictionary of Composers for Film. Routledge, https://doi.org/10.4324/9780429431920',
      copyright: {
        holder: 'Stewart R. Craggs',
        statement: 'Copyright © Stewart R. Craggs, 1998',
        year: 1998
      },
      counts: [],
      description:
        '<P>First published in 1998, this dictionary complements other studies which have appeared in recent years which look at the technical and theoretical issues concerned with film music composition. </P>',
      division: 'Music (Ashgate)',
      divisionCode: 'MUAG',
      doiRegistrationStatus: false,
      edition: 1,
      firstPublishedYear: 1998,
      firstPublishedYearNumber: 1998,
      format: 'Hardback',
      formatCode: 'EBK',
      formerImprints: [
        {
          code: 'FIMPASH',
          description: 'Ashgate'
        }
      ],
      fundingGroups: null,
      inLanguage: 'eng',
      legacyDivision: null,
      legalOwner: 'UK',
      license: null,
      plannedPublicationDate: new Date('2020-01-31T09:33:37.572Z'),
      productionSpecification: null,
      publicationLocation: 'London',
      publisherArea: 'Humanities & Media Arts',
      publisherAreaCode: 'HUMMED',
      publisherImprint: 'Routledge',
      shortTitle: 'Soundtracks (1998) Revival RRA',
      status: 'Available',
      statusCode: 'LFB',
      subtitle: 'An International Dictionary of Composers for Film',
      textType: 'Reissue',
      textTypeCode: '490',
      toc: '<![CDATA[<P>1. Alphabetical Listing of Composers. 2. Select List of Feature and Documentary Films with Music Wholly or Partly by Classical Composers. 3. Index of Film Titles Listed.</P>]]>'
    },
    categories: [
      {
        code: 'ZN',
        name: 'Music & Visual Arts Ashgate UK',
        type: 'flexcat'
      },
      {
        code: null,
        name: 'monograph',
        type: 'book-type'
      }
    ],
    classifications: [
      {
        code: 'SCAR20',

        group: null,
        level: 2,
        name: 'Music',
        priority: 1,
        type: 'subject'
      }
    ],
    contributors: [
      {
        affiliations: [],
        bio: null,
        collab: null,
        email: null,
        familyName: 'Craggs',
        fullName: 'Stewart R Craggs',
        givenName: 'Stewart R',
        orcid: null,
        position: 1,
        roles: ['author']
      }
    ],
    discountGroups: [
      {
        code: '10',
        description: '10 (old TPS 12) - Informa Law & Electr Media'
      }
    ],
    identifiers: {
      dacKey: 'C2018-0-87691-4',
      doi: '10.4324/9780429431920',
      editionId: '700856',
      isbn: '9780429431920',
      orderNumber: 'KE68564',
      sku: null,
      titleId: '397369'
    },
    impressionLocations: null,
    isPartOf: [],
    keywords: [],
    permissions: [],
    prices: [],
    rights: [],
    title: 'Soundtracks',
    type: 'book',
    version: '1.0.0'
  },
  {
    _id: 'f209ebc7-a646-44dd-be3f-12a1656c6dff',
    _isSellable: true,
    _schemaVersion: '4.0.1',
    _sources: [
      {
        source: 'CMS',
        type: 'content'
      }
    ],
    _status: 'Available',
    audience: [],
    availability: [
      {
        errors: [],
        name: 'AGG',
        status: ['CAN_SEND_TO_AGG']
      },
      {
        errors: [],
        name: 'SALESFORCE',
        status: ['CAN_HOST']
      },
      {
        errors: [],
        name: 'UBX',
        status: ['SELLABLE', 'CAN_HOST', 'PUBLISHED']
      }
    ],
    book: {
      abstracts: [],
      bibliographicSpecification: {
        format: 'SPCL',
        height: null,
        weight: null,
        width: null
      },
      bindingStyle: 'eBook - General',
      bindingStyleCode: 'EBGE',
      citation:
        'Craggs, S.R.(1998). Soundtracks: An International Dictionary of Composers for Film. Routledge, https://doi.org/10.4324/9780429431920',
      copyright: {
        holder: 'Stewart R. Craggs',
        statement: 'Copyright © Stewart R. Craggs, 1998',
        year: 1998
      },
      counts: [],
      description:
        '<P>First published in 1998, this dictionary complements other studies which have appeared in recent years which look at the technical and theoretical issues concerned with film music composition. </P>',
      division: 'Music (Ashgate)',
      divisionCode: 'MUAG',
      doiRegistrationStatus: false,
      edition: 1,
      firstPublishedYear: 1998,
      firstPublishedYearNumber: 1998,
      format: 'e-Book',
      formatCode: 'EBK',
      formerImprints: [
        {
          code: 'FIMPASH',
          description: 'Ashgate'
        }
      ],
      fundingGroups: null,
      inLanguage: 'eng',
      legacyDivision: null,
      legalOwner: 'UK',
      license: null,
      plannedPublicationDate: new Date('2020-01-31T09:33:37.572Z'),
      productionSpecification: null,
      publicationLocation: 'London',
      publisherArea: 'Humanities & Media Arts',
      publisherAreaCode: 'HUMMED',
      publisherImprint: 'Routledge',
      shortTitle: 'Soundtracks (1998) Revival RRA',
      status: 'Available',
      statusCode: 'LFB',
      subtitle: 'An International Dictionary of Composers for Film',
      textType: 'Reissue',
      textTypeCode: '490',
      toc: '<![CDATA[<P>1. Alphabetical Listing of Composers. 2. Select List of Feature and Documentary Films with Music Wholly or Partly by Classical Composers. 3. Index of Film Titles Listed.</P>]]>'
    },
    categories: [
      {
        code: 'ZN',
        name: 'Music & Visual Arts Ashgate UK',
        type: 'flexcat'
      },
      {
        code: null,
        name: 'monograph',
        type: 'book-type'
      }
    ],
    classifications: [
      {
        code: 'SCAR20',

        group: null,
        level: 2,
        name: 'Music',
        priority: 1,
        type: 'subject'
      }
    ],
    contributors: [
      {
        affiliations: [],
        bio: null,
        collab: null,
        email: null,
        familyName: 'Craggs',
        fullName: 'Stewart R Craggs',
        givenName: 'Stewart R',
        orcid: null,
        position: 1,
        roles: ['author']
      }
    ],
    discountGroups: [
      {
        code: '10',
        description: '10 (old TPS 12) - Informa Law & Electr Media'
      }
    ],
    identifiers: {
      dacKey: 'C2018-0-87691-4',
      doi: '10.4324/9780429431920',
      editionId: '700856',
      isbn: '9780429431920',
      orderNumber: 'KE68564',
      sku: null,
      titleId: '397369'
    },
    impressionLocations: null,
    isPartOf: [],
    keywords: [],
    permissions: [],
    prices: [],
    rights: [],
    title: 'Soundtracks',
    type: 'book',
    version: '1.0.0'
  },
  {
    _id: '7ce1dd8d-f398-4e54-9202-91d463ce28ee',
    _isSellable: false,
    _schemaVersion: '4.0.1',
    _sources: [
      {
        source: 'MBS',
        type: 'product'
      }
    ],
    _status: 'Out of Print',
    audience: [],
    availability: [
      {
        errors: ['OUT_OF_PRINT'],
        name: 'AGG',
        status: ['SHOULD_NOTIFY']
      }
    ],
    book: {
      abstracts: [],
      bibliographicSpecification: {
        format: 'C4',
        height: null,
        weight: '0',
        width: null
      },
      bindingStyle: 'eBook - General',
      bindingStyleCode: 'EBGE',
      citation: null,
      copyright: {
        holder: 'Stewart R. Craggs',
        statement: 'Copyright © Stewart R. Craggs, 1998',
        year: 1998
      },
      counts: [],
      description:
        'Materials for Architects and Builders provides an introduction to a wide range of building materials. It explains in detail the manufacture, key physical properties, specification and uses of the standard building products, everything a student would need to know. The book also describes many recent technological innovations and rediscovered materials, reflecting an increased concern for environmental issues within the Industry.<BR id="CRLF"><BR id="CRLF">This new edition has been completely updated to reflect the amended Building Regulations, the latest British and European Standards as well as incorporating current advice and information from the Building Research Establishment. <BR id="CRLF"><BR id="CRLF">Dr Arthur Lyons is a teacher fellow and principal lecturer in building materials at the Leicester School of Architecture within the Faculty of Art and Design at De Montfort University, UK. He has taught the subject of building materials for thirty five years to a wide range of students within the built environment disciplines.',
      division: 'Construction & Property',
      divisionCode: 'CONS',
      doiRegistrationStatus: false,
      firstPublishedYear: 2007,
      firstPublishedYearNumber: 2007,
      format: 'e-Book',
      formatCode: 'EBK',
      formerImprints: [
        {
          code: 'FIMPELS',
          description: 'Elsevier'
        }
      ],
      fundingGroups: [],
      inLanguage: 'eng',
      legacyDivision: null,
      legalOwner: 'UK',
      license: null,
      plannedPublicationDate: new Date('2020-01-31T09:33:37.572Z'),
      productionSpecification: null,
      publicationLocation: 'London',
      publisherArea: 'Engineering',
      publisherAreaCode: 'ENGINEER',
      publisherImprint: 'Routledge',
      shortTitle: 'MATERIALS FOR ARCHITECTS & BLDRS 3E',
      status: 'Out of Print',
      statusCode: 'WNN',
      subtitle: null,
      textType: 'Textbook (Standard) (DRM-Free)',
      textTypeCode: '020',
      toc: '<![CDATA[Bricks and brickwork<BR id="CRLF">Blocks and blockwork<BR id="CRLF">Lime, cement and concrete<BR id="CRLF">Timber and timber products<BR id="CRLF">Ferrous and non-ferrous metals<BR id="CRLF">Bitumen and flat roofing materials<BR id="CRLF">Glass<BR id="CRLF">Ceramic materials<BR id="CRLF">Stone and cast stone<BR id="CRLF">Plastics<BR id="CRLF">Glass-fibre reinforced plastics, cement and gypsum<BR id="CRLF">Plaster and board materials<BR id="CRLF">Insulating materials<BR id="CRLF">Energy-saving materials and components<BR id="CRLF">Recycled and ecological materials<BR id="CRLF">Sealants, gaskets and adhesives<BR id="CRLF">Paints, wood stains, varnishes and colour]]>'
    },
    categories: [
      {
        code: 'WB0000',
        name: 'On Atypon',
        type: 'netbase'
      },
      {
        code: 'VD',
        name: 'Construction UK',
        type: 'flexcat'
      }
    ],
    classifications: [],
    contributors: [],
    discountGroups: [
      {
        code: '14',
        description: '14 (old TPS 18) - UK exPearson Textbk'
      }
    ],
    identifiers: {
      dacKey: 'C2011-0-11921-6',
      doi: '10.4324/9780080465791',
      editionId: '255568',
      isbn: '9780080465791',
      orderNumber: 'Y130995',
      sku: null,
      titleId: '207083'
    },
    impressionLocations: [],
    isPartOf: [],
    keywords: [],
    permissions: [],
    prices: [],
    rights: [],
    title: 'Materials for Architects and Builders',
    type: 'book',
    version: '1.0.0'
  }
];
