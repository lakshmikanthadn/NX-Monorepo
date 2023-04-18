export const booksTestData = {
  _id: '176e03c3-4b63-4e24-9e1f-fcd2f663e669',
  _index: 'books-dev-blue',
  _score: 0.2876821,
  _source: {
    _createdDate: '2020-11-25T13:47:23.702Z',
    _isSellable: true,
    _modifiedDate: '2022-01-06T13:34:35.315Z',
    _schemaVersion: '4.0.1',
    _sources: [
      {
        source: 'MBS',
        type: 'product'
      },
      {
        source: 'CMS',
        type: 'content'
      }
    ],
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
        errors: [],
        name: 'SFDC',
        status: ['SF-ACTIVE']
      },
      {
        errors: [],
        name: 'KORTEXT',
        status: ['VALID']
      },
      {
        errors: [],
        name: 'UBX',
        status: [
          'SELLABLE',
          'PUBLISHED',
          'DRM_FREE',
          'INCLUDE_IN_STATIC_BUNDLE',
          'CAN_HOST',
          'INCLUDE_IN_DYNAMIC_PACKAGE'
        ]
      },
      {
        errors: [],
        name: 'ONIX',
        status: ['VALID']
      }
    ],
    book: {
      abstracts: [
        {
          caption: null,
          location:
            'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/9780429323423/52e4214c-d180-44a6-966e-315d8c8c4edd/abstracts/abstract-book-body-blurb-0.xml',
          position: 0,
          textType: 'blurb',
          transcript: null,
          type: 'xml',
          value: null
        }
      ],
      bibliographicSpecification: {
        format: 'ROY8',
        height: null,
        weight: null,
        width: null
      },
      bindingStyle: 'eBook - General',
      bindingStyleCode: 'EBGE',
      citation:
        'Yasnitsky, A. (Ed.). (2020). A History of Marxist Psychology: The Golden Age of Soviet Science (1st ed.). Routledge. https://doi.org/10.4324/9780429323423',
      coPublishers: [],
      copyright: {
        holder:
          'selection and editorial matter, Anton Yasnitsky; individual chapters, the contributors',
        statement:
          '© 2021 selection and editorial matter, Anton Yasnitsky; individual chapters, the contributors',
        year: 2021
      },
      counts: [
        {
          count: 4,
          type: 'illustrationsBW'
        }
      ],
      description: '',
      division: 'Psychology',
      divisionCode: 'PSYP',
      doiRegistrationStatus: true,
      edition: 1,
      firstPublishedYear: 2020,
      format: 'e-Book',
      formatCode: 'EBK',
      formerImprints: [
        {
          code: null,
          description: null
        }
      ],
      fundingGroups: null,
      groupOfCompany: null,
      inLanguage: 'eng',
      legacyDivision: null,
      legalOwner: 'UK',
      license: null,
      plannedPublicationDate: '2020-10-26T00:00:00.000Z',
      podSuitable: false,
      productionSpecification: {
        basicColor: '1 colour'
      },
      publicationDate: '2020-10-25T00:00:00.000Z',
      publicationLocation: 'London',
      publisherArea: 'Behavioural Science & Education',
      publisherAreaCode: 'BSCIED',
      publisherImprint: 'Routledge',
      publisherImprintCode: 'impr',
      shortDescription:
        '<P>An illuminating and original collection of essays on 20<SUP>th</SUP> Century Russian psychology, offering unparalleled coverage of the scholarship of Vygotsky and his peers.</P>',
      shortTitle: 'A History of Marxist Psychology - Yasnitsky',
      status: 'Available',
      statusCode: 'LFB',
      subtitle: 'The Golden Age of Soviet Science',
      textType: 'Supplementary (DRM-Free)',
      textTypeCode: '090',
      toc: ''
    },
    categories: [
      {
        code: '3M',
        name: 'Psychology UK',
        type: 'flexcat'
      },
      {
        code: null,
        name: 'edited',
        type: 'book-type'
      }
    ],
    classifications: [
      {
        code: 'SCAS15',
        group: null,
        level: 2,
        name: 'Central Asian, Russian & Eastern European Studies',
        priority: 2,
        type: 'subject'
      }
    ],
    contributors: [
      {
        affiliations: [
          {
            address: null,
            department: null,
            name: 'Canadian Independent Researcher'
          }
        ],
        bio: null,
        collab: null,
        email: null,
        familyName: 'Yasnitsky',
        fullName: 'Anton Yasnitsky',
        givenName: 'Anton',
        orcid: null,
        position: 1,
        roles: ['editor']
      }
    ],
    discountGroups: [
      {
        code: '10',
        description: '10 (old TPS 12) - Informa Law & Electr Media'
      }
    ],
    identifiers: {
      dacKey: 'C2019-0-99658-4',
      doi: '10.4324/9780429323423',
      editionId: '766255',
      isbn: '9780429323423',
      orderNumber: '314815',
      sku: null,
      titleId: '410333'
    },
    impressionLocations: [
      {
        discountGroups: [
          {
            code: '10',
            description: '10 (old TPS 12) - Informa Law & Electr Media'
          }
        ],
        distributionCenter: {
          code: 'LOC1',
          location: 'UK',
          status: 'Available',
          statusCode: 'LFB',
          stockStatus: []
        },
        mainLocation: true,
        plannedPublicationDate: '2020-10-26T00:00:00.000Z',
        publicationDate: '2020-10-25T00:00:00.000Z'
      },
      {
        discountGroups: [
          {
            code: 'V',
            description: 'V - USA Routledge Research and Monographs'
          }
        ],
        distributionCenter: {
          code: 'USNY',
          location: 'US Kentucky',
          status: 'Available',
          statusCode: 'LFB',
          stockStatus: []
        },
        mainLocation: false,
        plannedPublicationDate: '2020-10-26T00:00:00.000Z',
        publicationDate: '2020-10-25T00:00:00.000Z'
      },
      {
        discountGroups: [
          {
            code: 'PROF',
            description: 'Trade/Professional'
          }
        ],
        distributionCenter: {
          code: 'AUS',
          location: 'Australia - TLD',
          status: 'Available',
          statusCode: 'LFB',
          stockStatus: [
            {
              name: 'Stock In Hand',
              value: 0
            }
          ]
        },
        mainLocation: false,
        plannedPublicationDate: '2020-11-16T00:00:00.000Z',
        publicationDate: '2020-10-25T00:00:00.000Z'
      }
    ],
    isPartOf: [
      {
        _id: '78a34db2-0913-40d0-a7f0-eec06dd2ebc6',
        identifiers: {
          sku: '01t9E000009uwoDQAQ'
        },
        level: 1,
        position: 348,
        title: null,
        type: 'collection'
      },
      {
        _id: '472b8416-2344-4664-943a-0464a7bc5378',
        identifiers: {
          collectionId: 'NET-DFGTR542022'
        },
        level: 1,
        position: 1,
        subType: 'Discovery Collection',
        title: null,
        type: 'collection'
      }
    ],
    keywords: [
      {
        name: 'Marxism',
        position: 1,
        type: 'catchword',
        weightage: null
      }
    ],
    oplog_date: '2022/01/06 13:34:35',
    oplog_ts: {
      I: 3,
      T: 1641476075
    },
    permissions: [
      {
        code: 'CTMRFM',
        description: null,
        name: 'rfm',
        text: 'Ready For Market',
        type: 'sales',
        validFrom: null,
        validTo: null
      },
      {
        code: 'EBRALL',
        description: null,
        name: 'EBRALL',
        text: 'Institutional, retail and Atypon',
        type: 'access',
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
        validFrom: '2020-05-19T00:00:00.000Z',
        validTo: null
      },
      {
        currency: 'GBP',
        price: 135,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2020-05-19T00:00:00.000Z',
        validTo: null
      },
      {
        currency: 'USD',
        price: 175,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2020-05-19T00:00:00.000Z',
        validTo: null
      },
      {
        currency: 'GBP',
        price: 135,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: '2020-05-19T00:00:00.000Z',
        validTo: null
      },
      {
        currency: 'USD',
        price: 175,
        priceType: 'Institutional Price',
        priceTypeCode: 'IS',
        validFrom: '2020-05-19T00:00:00.000Z',
        validTo: null
      },
      {
        currency: 'GBP',
        price: 34.99,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: '2019-02-26T00:00:00.000Z',
        validTo: null
      },
      {
        currency: 'AUD',
        price: 66.99,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: '2020-05-08T00:00:00.000Z',
        validTo: null
      },
      {
        currency: 'NZD',
        price: 70.99,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: '2020-05-08T00:00:00.000Z',
        validTo: null
      },
      {
        currency: 'USD',
        price: 46.95,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: '2020-09-14T00:00:00.000Z',
        validTo: null
      }
    ],
    printOnDemand: [],
    reviews: [],
    rights: [],
    tieBreakerId: '176e03c3-4b63-4e24-9e1f-fcd2f663e669',
    title: 'A History of Marxist Psychology',
    type: 'book',
    version: '1.0.0'
  },

  _type: '_doc'
};
